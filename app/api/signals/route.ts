import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const liveCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30_000;

async function getLiveTokenData(tokenAddress: string) {
  const cached = liveCache.get(tokenAddress);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${tokenAddress}`,
      { headers: { "User-Agent": "TEFT-Pulse/1.0" }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pairs = Array.isArray(data) ? data : (data?.pairs ?? []);

    if (!pairs.length || pairs.every((p: any) => !p.marketCap && !p.liquidity?.usd)) {
      return null;
    }

    const raydium = pairs.find((p: any) => p.dexId === "raydium" && (p.liquidity?.usd || 0) > 500);
    const pumpswap = pairs.find((p: any) => p.dexId === "pumpswap" && (p.liquidity?.usd || 0) > 500);
    const byLiquidity = pairs
      .filter((p: any) => (p.liquidity?.usd || 0) > 100)
      .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    const best = raydium || pumpswap || byLiquidity || pairs[0];

    const isMigrated =
      best.dexId === "raydium" ||
      best.dexId === "pumpswap" ||
      pairs.some((p: any) => p.dexId === "raydium" && (p.liquidity?.usd || 0) > 100);

    const isDexPaid = !!(
      (best.info?.websites && best.info.websites.length > 0) ||
      (best.info?.socials && best.info.socials.length > 0)
    );

    const result = {
      currentMarketCap: best.marketCap ? Number(best.marketCap) : null,
      currentLiquidity: best.liquidity?.usd ? Number(best.liquidity.usd) : null,
      volumeM5: Number(best.volume?.m5 || 0),
      volumeH1: Number(best.volume?.h1 || 0),
      volumeH6: Number(best.volume?.h6 || 0),
      priceChangeM5: Number(best.priceChange?.m5 || 0),
      priceChangeH1: Number(best.priceChange?.h1 || 0),
      buys5m: Number(best.txns?.m5?.buys || 0),
      sells5m: Number(best.txns?.m5?.sells || 0),
      dexscreenerUrl: best.url || null,
      isMigrated,
      isDexPaid,
    };

    liveCache.set(tokenAddress, { data: result, ts: Date.now() });
    return result;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("pulse_signals")
      .select(`
        id, detected_at, token_address, token_name, token_symbol,
        token_image_url, amount_sol, dex_id, liquidity_usd,
        market_cap, entry_market_cap, dexscreener_url, wallet_address,
        smart_wallets ( label )
      `)
      .gte("detected_at", twoHoursAgo)
      .neq("token_symbol", "USDC")
      .neq("token_symbol", "USDT")
      .order("detected_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const grouped: Record<string, any> = {};
    for (const row of data || []) {
      const key = row.token_address;
      if (!grouped[key]) {
        grouped[key] = {
          ...row,
          wallet_label: (row.smart_wallets as any)?.label || null,
          wallet_count: 1,
          entry_market_cap: row.entry_market_cap || row.market_cap,
        };
      } else {
        grouped[key].wallet_count++;
        if (new Date(row.detected_at) < new Date(grouped[key].detected_at)) {
          grouped[key].detected_at = row.detected_at;
          grouped[key].entry_market_cap = row.entry_market_cap || row.market_cap;
        }
      }
    }

    const tokens = Object.values(grouped);
    const chunks: any[][] = [];
    for (let i = 0; i < tokens.length; i += 10) chunks.push(tokens.slice(i, i + 10));

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (token: any) => {
        const live = await getLiveTokenData(token.token_address);
        if (live) {
          token.current_market_cap = live.currentMarketCap;
          token.current_liquidity = live.currentLiquidity;
          token.volume_m5 = live.volumeM5;
          token.volume_h1 = live.volumeH1;
          token.volume_h6 = live.volumeH6;
          token.price_change_m5 = live.priceChangeM5;
          token.price_change_h1 = live.priceChangeH1;
          token.buys_5m = live.buys5m;
          token.sells_5m = live.sells5m;
          token.is_migrated = live.isMigrated;
          token.is_dex_paid = live.isDexPaid;
          if (live.dexscreenerUrl) token.dexscreener_url = live.dexscreenerUrl;
          if (token.entry_market_cap && live.currentMarketCap) {
            token.multiplier = live.currentMarketCap / token.entry_market_cap;
          }
        }
      }));
    }

    const signals = tokens.sort((a: any, b: any) =>
      b.wallet_count - a.wallet_count ||
      new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
    );

    return NextResponse.json({
      signals,
      updatedAt: new Date().toISOString(),
      count: signals.length,
    });

  } catch (error) {
    console.error("[Pulse /api/signals] Error:", error);
    return NextResponse.json(
      { signals: [], updatedAt: new Date().toISOString(), count: 0, error: String(error) },
      { status: 503 }
    );
  }
}
