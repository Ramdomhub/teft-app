import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let cache: { tps: number; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ tps: cache.tps, cached: true });
  }
  try {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getRecentPerformanceSamples", params: [1] })
    });
    const data = await res.json();
    const sample = data.result?.[0];
    const tps = sample ? Math.round(sample.numTransactions / sample.samplePeriodSecs) : null;
    if (tps) cache = { tps, ts: Date.now() };
    return NextResponse.json({ tps, cached: false });
  } catch {
    return NextResponse.json({ tps: cache?.tps || null, cached: true });
  }
}
