import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Connection, PublicKey } from "@solana/web3.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

// Rate limiting: max 10 requests per wallet per minute
const rateLimitMap = new Map<string, { count: number; ts: number }>();
function isRateLimited(wallet: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(wallet);
  if (!entry || now - entry.ts > 60_000) {
    rateLimitMap.set(wallet, { count: 1, ts: now });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

async function getOnChainBalance(wallet: string): Promise<number> {
  try {
    const conn = new Connection(
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    );
    const accounts = await conn.getParsedTokenAccountsByOwner(
      new PublicKey(wallet),
      { mint: new PublicKey(TEFT_MINT) }
    );
    return accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
  } catch {
    return -1; // RPC error → don't update balance
  }
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, referredBy } = await req.json();

    // 1. Wallet validation
    if (!wallet || wallet.length < 40 || wallet.length > 50) {
      return NextResponse.json({ error: "Invalid wallet" }, { status: 400 });
    }

    // 2. Rate limiting
    if (isRateLimited(wallet)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    // 3. Get balance ON-CHAIN — never trust client
    const balance = await getOnChainBalance(wallet);
    if (balance === -1) {
      // RPC failed — upsert without balance update
    }

    // 4. X handle comes ONLY from Supabase Auth — never from client body
    const authHeader = req.headers.get("authorization");
    let xHandle: string | null = null;
    let xVerifiedAt: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.user_metadata?.user_name) {
        xHandle = user.user_metadata.user_name;
        xVerifiedAt = new Date().toISOString();
      }
    }

    // 5. Resolve referral
    let referredByWallet: string | null = null;
    if (referredBy) {
      if (referredBy.length >= 40 && referredBy !== wallet) {
        referredByWallet = referredBy;
      } else if (referredBy.length < 40) {
        const { data } = await supabase
          .from("legion_members")
          .select("wallet_address")
          .eq("referral_code", referredBy)
          .single();
        referredByWallet = data?.wallet_address || null;
      }
    }

    // 6. Don't overwrite existing referral
    const { data: existing } = await supabase
      .from("legion_members")
      .select("referred_by, x_handle")
      .eq("wallet_address", wallet)
      .single();

    // 7. Don't overwrite x_handle if already set by a different auth
    const finalXHandle = xHandle || existing?.x_handle || null;
    const finalXVerifiedAt = xHandle ? xVerifiedAt : null;

    await supabase.from("legion_members").upsert({
      wallet_address: wallet,
      ...(balance >= 0 ? { teft_balance: balance } : {}),
      joined_at: existing ? undefined : new Date().toISOString(),
      referral_code: wallet.slice(0, 8),
      ...(referredByWallet && !existing?.referred_by ? { referred_by: referredByWallet } : {}),
      ...(finalXHandle ? { x_handle: finalXHandle, ...(finalXVerifiedAt ? { x_verified_at: finalXVerifiedAt } : {}) } : {}),
    }, { onConflict: "wallet_address", ignoreDuplicates: false });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
