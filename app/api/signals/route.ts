import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─────────────────────────────────────────────────────────────
// TEFT Pulse — Signals API v2
// Strategie: 
//   1. /token-profiles/latest/v1  → neueste Solana Token-Adressen
//   2. /tokens/v1/solana/{addrs}  → Pair-Daten für diese Tokens
// Filter: pairCreatedAt < 10 Min
// Cache: 30 Sekunden
// ─────────────────────────────────────────────────────────────

const DEXSCREENER_BASE = "https://api.dexscreener.com";
const CACHE_TTL_MS = 30_000;
const MAX_AGE_MS = 10 * 60_000;

export type PulseToken = {
  address: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  pairAddress: string;
  dexId: string;
  ageMinutes: number;
  pairCreatedAt: number;
  priceUsd: number | null;
  marketCap: number | null;
  fdv: number | null;
  liquidityUsd: number | null;
  buys5m: number;
  sells5m: number;
  volume5m: number;
  priceChange5m: number;
  buys1h: number;
  sells1h: number;
  volume1h: number;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  dexscreenerUrl: string;
};

type PulseResponse = {
  updatedAt: string;
  count: number;
  source: "dexscreener";
  cached: boolean;
  tokens: PulseToken[];
  error?: string;
};

let cache: { data: PulseResponse; ts: number } | null = null;

function extractSocials(info: any) {
  if (!info?.socials || !Array.isArray(info.socials)) return { twitter: null, telegram: null };
  let twitter: string | null = null;
  let telegram: string | null = null;
  for (const s of info.socials) {
    const p = (s.platform || s.type || "").toLowerCase();
    const h = s.handle || s.url || "";
    if (p.includes("twitter") || p.includes("x")) twitter = h;
    if (p.includes("telegram")) telegram = h;
  }
  return { twitter, telegram };
}

function normalizePair(pair: any, now: number): PulseToken | null {
  if (!pair?.baseToken?.address) return null;
  if (pair.chainId !== "solana") return null;
  const pairCreatedAt = Number(pair.pairCreatedAt || 0);
  if (!pairCreatedAt) return null;
  const ageMs = now - pairCreatedAt;
  if (ageMs < 0 || ageMs > MAX_AGE_MS) return null;
  const { twitter, telegram } = extractSocials(pair.info);
  return {
    address: pair.baseToken.address,
    name: pair.baseToken.name || "Unknown",
    symbol: pair.baseToken.symbol || "?",
    imageUrl: pair.info?.imageUrl || null,
    pairAddress: pair.pairAddress || "",
    dexId: pair.dexId || "unknown",
    ageMinutes: Math.floor(ageMs / 60_000),
    pairCreatedAt,
    priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
    marketCap: pair.marketCap ? Number(pair.marketCap) : null,
    fdv: pair.fdv ? Number(pair.fdv) : null,
    liquidityUsd: pair.liquidity?.usd ? Number(pair.liquidity.usd) : null,
    buys5m: Number(pair.txns?.m5?.buys || 0),
    sells5m: Number(pair.txns?.m5?.sells || 0),
    volume5m: Number(pair.volume?.m5 || 0),
    priceChange5m: Number(pair.priceChange?.m5 || 0),
    buys1h: Number(pair.txns?.h1?.buys || 0),
    sells1h: Number(pair.txns?.h1?.sells || 0),
    volume1h: Number(pair.volume?.h1 || 0),
    twitter,
    telegram,
    website: pair.info?.websites?.[0]?.url || null,
    dexscreenerUrl: pair.url || `https://dexscreener.com/solana/${pair.pairAddress}`,
  };
}

export async function GET() {
  const now = Date.now();

  if (cache && now - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache.data, cached: true });
  }

  try {
    // Step 1: Neueste Token-Profile holen (gibt uns frische Solana-Adressen)
    const profilesRes = await fetch(`${DEXSCREENER_BASE}/token-profiles/latest/v1`, {
      cache: "no-store",
      headers: { "User-Agent": "TEFT-Pulse/1.0" },
    });

    if (!profilesRes.ok) throw new Error(`Profiles endpoint: ${profilesRes.status}`);

    const profiles = await profilesRes.json();
    const profileArray = Array.isArray(profiles) ? profiles : [];

    // Nur Solana-Tokens, max 30 Adressen (API-Limit)
    const solanaAddresses = profileArray
      .filter((p: any) => p.chainId === "solana" && p.tokenAddress)
      .slice(0, 30)
      .map((p: any) => p.tokenAddress as string);

    if (solanaAddresses.length === 0) {
      const empty: PulseResponse = {
        updatedAt: new Date(now).toISOString(),
        count: 0,
        source: "dexscreener",
        cached: false,
        tokens: [],
      };
      cache = { data: empty, ts: now };
      return NextResponse.json(empty);
    }

    // Step 2: Pair-Daten für diese Adressen holen (max 30 per Request)
    const chunks: string[][] = [];
    for (let i = 0; i < solanaAddresses.length; i += 30) {
      chunks.push(solanaAddresses.slice(i, i + 30));
    }

    const allPairs: any[] = [];
    for (const chunk of chunks) {
      const pairsRes = await fetch(
        `${DEXSCREENER_BASE}/tokens/v1/solana/${chunk.join(",")}`,
        {
          cache: "no-store",
          headers: { "User-Agent": "TEFT-Pulse/1.0" },
        }
      );
      if (!pairsRes.ok) continue;
      const pairsData = await pairsRes.json();
      const pairs = Array.isArray(pairsData) ? pairsData : (pairsData?.pairs ?? []);
      allPairs.push(...pairs);
    }

    // Filtern: nur < 10 Min alte Pairs
    const tokens: PulseToken[] = allPairs
      .map((p: any) => normalizePair(p, now))
      .filter((t): t is PulseToken => t !== null)
      .sort((a, b) => b.pairCreatedAt - a.pairCreatedAt);

    const response: PulseResponse = {
      updatedAt: new Date(now).toISOString(),
      count: tokens.length,
      source: "dexscreener",
      cached: false,
      tokens,
    };

    cache = { data: response, ts: now };
    return NextResponse.json(response);

  } catch (error) {
    console.error("[Pulse /api/signals] Error:", error);
    if (cache) {
      return NextResponse.json({
        ...cache.data,
        cached: true,
        error: "Fresh fetch failed, returning cached data",
      });
    }
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        count: 0,
        source: "dexscreener",
        cached: false,
        tokens: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
