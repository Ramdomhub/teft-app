import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { wallet, balance, referredBy, xHandle, xVerifiedAt } = await req.json();
    if (!wallet || wallet.length < 40) return NextResponse.json({ error: "Invalid wallet" }, { status: 400 });

    let referredByWallet = null;
    if (referredBy) {
      if (referredBy.length >= 40) {
        referredByWallet = referredBy;
      } else {
        const { data } = await supabase
          .from("legion_members")
          .select("wallet_address")
          .eq("referral_code", referredBy)
          .single();
        referredByWallet = data?.wallet_address || null;
      }
    }

    const { data: existing } = await supabase
      .from("legion_members")
      .select("referred_by")
      .eq("wallet_address", wallet)
      .single();

    await supabase.from("legion_members").upsert({
      wallet_address: wallet,
      teft_balance: balance,
      joined_at: new Date().toISOString(),
      referral_code: wallet.slice(0, 8),
      ...(referredByWallet && !existing?.referred_by ? { referred_by: referredByWallet } : {}),
      ...(xHandle ? { x_handle: xHandle, x_verified_at: xVerifiedAt || new Date().toISOString() } : {}),
    }, { onConflict: "wallet_address", ignoreDuplicates: false });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
