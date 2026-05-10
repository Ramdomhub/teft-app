import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("legion_stats")
      .select("wallet_address, x_handle, teft_balance, referral_count, referral_code, score")
      .gt("teft_balance", 0)
      .order("score", { ascending: false })
      .limit(100);

    if (error) throw error;

    const leaderboard = (data || []).map((m: any, i: number) => ({
      position: i + 1,
      wallet: m.wallet_address,
      xHandle: m.x_handle,
      balance: m.teft_balance || 0,
      referrals: m.referral_count || 0,
      referralCode: m.referral_code,
      score: m.score || 0,
    }));

    return NextResponse.json({ leaderboard });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ leaderboard: [] });
  }
}
