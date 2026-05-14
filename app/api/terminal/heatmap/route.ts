import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: signals } = await supabase
      .from("pulse_signals")
      .select("token_address, token_name, token_symbol, wallet_address, entry_market_cap, market_cap")
      .gte("detected_at", since)
      .order("detected_at", { ascending: false });

    // Debug: count all signals
    const { count } = await supabase
      .from("pulse_signals")
      .select("*", { count: "exact", head: true });
    
    const { data: sample, error: sampleError } = await supabase
      .from("pulse_signals")
      .select("token_address, detected_at")
      .limit(3);

    if (!signals || signals.length === 0) return NextResponse.json({ heatmap: [], debug: "no signals", since, total_count: count, sample, url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0,30) });

    const { data: wallets } = await supabase
      .from("smart_wallets")
      .select("address, win_rate")
      .eq("active", true);

    const walletMap = new Map(wallets?.map((w: any) => [w.address, w]) || []);

    const { data: sells } = await supabase
      .from("smart_wallet_sells")
      .select("token_address, wallet_address")
      .gte("detected_at", since);

    const sellSet = new Set(sells?.map((s: any) => `${s.wallet_address}-${s.token_address}`) || []);

    const tokenMap = new Map<string, any>();
    for (const signal of signals) {
      const key = signal.token_address;
      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          token_address: signal.token_address,
          token_name: signal.token_name,
          token_symbol: signal.token_symbol,
          market_cap: signal.market_cap,
          entry_market_cap: signal.entry_market_cap,
          wallets: new Set(),
          win_rates: [],
          still_holding: 0,
        });
      }
      const entry = tokenMap.get(key);
      const wallet = walletMap.get(signal.wallet_address);
      if (!entry.wallets.has(signal.wallet_address)) {
        entry.wallets.add(signal.wallet_address);
        if (wallet?.win_rate) entry.win_rates.push(wallet.win_rate);
        if (!sellSet.has(`${signal.wallet_address}-${signal.token_address}`)) entry.still_holding++;
      }
    }


    // DexScreener Volume Check
    const candidates = Array.from(tokenMap.values())
      .filter((t: any) => (t.market_cap || 0) >= 7000)
      .slice(0, 30);

    const tokenAddresses = candidates.map((t: any) => t.token_address).join(",");
    let volumeMap = new Map<string, number>();
    try {
      const dexRes = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${tokenAddresses}`, { cache: "no-store" });
      if (dexRes.ok) {
        const dexData = await dexRes.json();
        const pairs = Array.isArray(dexData) ? dexData : dexData?.pairs ?? [];
        for (const pair of pairs) {
          const addr = pair.baseToken?.address;
          const vol = pair.volume?.h24 || 0;
          if (addr && (!volumeMap.has(addr) || vol > (volumeMap.get(addr) || 0))) {
            volumeMap.set(addr, vol);
          }
        }
      }
    } catch {}

    const heatmap = candidates
      .map((t: any) => ({
        token_address: t.token_address,
        token_name: t.token_name,
        token_symbol: t.token_symbol,
        market_cap: t.market_cap,
        entry_market_cap: t.entry_market_cap,
        wallet_count: t.wallets.size,
        still_holding: t.still_holding,
        avg_win_rate: t.win_rates.length > 0 ? Math.round(t.win_rates.reduce((a: number, b: number) => a + b, 0) / t.win_rates.length) : null,
        mcap_change: t.entry_market_cap > 0 ? ((t.market_cap - t.entry_market_cap) / t.entry_market_cap * 100) : null,
        volume_24h: volumeMap.get(t.token_address) || 0,
      }))
      .sort((a: any, b: any) => (b.wallet_count * 10 + (b.avg_win_rate || 0) / 10) - (a.wallet_count * 10 + (a.avg_win_rate || 0) / 10))
      .slice(0, 15);

    return NextResponse.json({ heatmap });
  } catch (e: any) {
    return NextResponse.json({ heatmap: [], error: e.message, stack: e.stack });
  }
}
