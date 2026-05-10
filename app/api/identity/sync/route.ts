import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { wallet, balance, referredBy } = await req.json();
    if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

    await supabase.from("legion_members").upsert({
      wallet_address: wallet,
      teft_balance: balance,
      joined_at: new Date().toISOString(),
      referral_code: wallet.slice(0, 8),
      ...(referredBy ? { referred_by: referredBy } : {}),
    }, { onConflict: "wallet_address", ignoreDuplicates: false });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
