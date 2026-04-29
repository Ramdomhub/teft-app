import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// TEFT Pulse — Helius Webhook Receiver
// Helius ruft diesen Endpoint an wenn eine
// Smart Wallet eine Transaktion macht.
// ─────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Nur diese DEX Program IDs interessieren uns
const DEX_PROGRAMS = new Set([
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", // Raydium AMM
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",  // Pump.fun
  "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",  // PumpSwap
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",  // Orca Whirlpool
  "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP", // Orca v2
]);

type HeliusTransaction = {
  signature: string;
  type: string;
  source: string;
  feePayer: string;
  tokenTransfers?: {
    mint: string;
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
  }[];
  nativeTransfers?: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  accountData?: {
    account: string;
    nativeBalanceChange: number;
  }[];
  instructions?: {
    programId: string;
    accounts: string[];
  }[];
};

async function getSmartWallets(): Promise<Set<string>> {
  const { data } = await supabase
    .from("smart_wallets")
    .select("address")
    .eq("active", true);
  return new Set((data || []).map((w: { address: string }) => w.address));
}

async function getTokenInfo(mint: string) {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${mint}`,
      { headers: { "User-Agent": "TEFT-Pulse/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pairs = Array.isArray(data) ? data : data?.pairs ?? [];
    if (!pairs.length) return null;
    // Nimm das Pair mit der höchsten Liquidität
    const best = pairs.sort(
      (a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0];
    return {
      name: best.baseToken?.name || "Unknown",
      symbol: best.baseToken?.symbol || "?",
      imageUrl: best.info?.imageUrl || null,
      liquidityUsd: best.liquidity?.usd || null,
      marketCap: best.marketCap || null,
      dexId: best.dexId || null,
      pairAddress: best.pairAddress || null,
      dexscreenerUrl: best.url || `https://dexscreener.com/solana/${mint}`,
    };
  } catch {
    return null;
  }
}

function isDexSwap(tx: HeliusTransaction): boolean {
  if (!tx.instructions) return false;
  return tx.instructions.some((ix) => DEX_PROGRAMS.has(ix.programId));
}

function extractBoughtToken(tx: HeliusTransaction, walletAddress: string): string | null {
  if (!tx.tokenTransfers) return null;
  const incoming = tx.tokenTransfers.find(
    (t) => t.toUserAccount === walletAddress && t.mint !== "So11111111111111111111111111111111111111112"
  );
  return incoming?.mint || null;
}

function extractSoldToken(tx: HeliusTransaction, walletAddress: string): string | null {
  if (!tx.tokenTransfers) return null;
  const outgoing = tx.tokenTransfers.find(
    (t) => t.fromUserAccount === walletAddress && t.mint !== "So11111111111111111111111111111111111111112"
  );
  return outgoing?.mint || null;
}

function extractSolReceived(tx: HeliusTransaction, walletAddress: string): number {
  if (!tx.nativeTransfers) return 0;
  const incoming = tx.nativeTransfers
    .filter((t) => t.toUserAccount === walletAddress)
    .reduce((sum, t) => sum + t.amount, 0);
  return incoming / 1e9;
}

function extractSolSpent(tx: HeliusTransaction, walletAddress: string): number {
  if (!tx.nativeTransfers) return 0;
  const outgoing = tx.nativeTransfers
    .filter((t) => t.fromUserAccount === walletAddress)
    .reduce((sum, t) => sum + t.amount, 0);
  return outgoing / 1e9; // Lamports → SOL
}

export async function POST(req: NextRequest) {
  try {
    // Helius sendet ein Array von Transaktionen
    const body = await req.json();
    const transactions: HeliusTransaction[] = Array.isArray(body) ? body : [body];

    const smartWallets = await getSmartWallets();
    const processed: string[] = [];

    for (const tx of transactions) {
      // Nur Swap-Transaktionen
      if (!isDexSwap(tx)) continue;

      // Ist der feePayer eine Smart Wallet?
      const walletAddress = tx.feePayer;
      if (!smartWallets.has(walletAddress)) continue;

      // BUY: Welcher Token wurde gekauft?
      const tokenMint = extractBoughtToken(tx, walletAddress);
      
      if (tokenMint) {
        const amountSol = extractSolSpent(tx, walletAddress);
        if (amountSol >= 0.01) {
          const tokenInfo = await getTokenInfo(tokenMint);
          const { error } = await supabase.from("pulse_signals").insert({
            wallet_address: walletAddress,
            token_address: tokenMint,
            token_name: tokenInfo?.name || "Unknown",
            token_symbol: tokenInfo?.symbol || "?",
            token_image_url: tokenInfo?.imageUrl || null,
            amount_sol: amountSol,
            tx_signature: tx.signature,
            dex_id: tokenInfo?.dexId || null,
            pair_address: tokenInfo?.pairAddress || null,
            liquidity_usd: tokenInfo?.liquidityUsd || null,
            market_cap: tokenInfo?.marketCap || null,
            dexscreener_url: tokenInfo?.dexscreenerUrl || null,
          });
          if (!error) {
            processed.push(tx.signature);
            console.log(`[Pulse] BUY: ${tokenInfo?.name} by ${walletAddress.slice(0, 8)}... for ${amountSol.toFixed(3)} SOL`);
          }
        }
      }

      // SELL: Welcher Token wurde verkauft?
      const soldMint = extractSoldToken(tx, walletAddress);
      if (soldMint && soldMint !== tokenMint) {
        const solReceived = extractSolReceived(tx, walletAddress);
        if (solReceived >= 0.001) {
          const tokenInfo = await getTokenInfo(soldMint);
          const { error } = await supabase.from("smart_wallet_sells").insert({
            wallet_address: walletAddress,
            token_address: soldMint,
            token_name: tokenInfo?.name || "Unknown",
            token_symbol: tokenInfo?.symbol || "?",
            amount_sol: solReceived,
            tx_signature: tx.signature + "_sell",
          });
          if (!error) {
            console.log(`[Pulse] SELL: ${tokenInfo?.name} by ${walletAddress.slice(0, 8)}... received ${solReceived.toFixed(3)} SOL`);
          }
        }
      }
      
      if (tokenMint || soldMint) processed.push(tx.signature);
    }

    return NextResponse.json({
      ok: true,
      processed: processed.length,
      signatures: processed,
    });

  } catch (error) {
    console.error("[Pulse Webhook] Error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
