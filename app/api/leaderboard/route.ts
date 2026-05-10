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
      .from("legion_members")
      .select("wallet_address, x_handle, teft_balance, referral_count, created_at")
      .not("teft_balance", "is", null)
      .gt("teft_balance", 0)
      .order("teft_balance", { ascending: false })
      .limit(100);

    if (error) throw error;

    const scored = (data || [])
      .map((m: any) => ({
        wallet: m.wallet_address,
        xHandle: m.x_handle,
        balance: m.teft_balance || 0,
        referrals: m.referral_count || 0,
        joinDate: m.created_at,
        score: Math.round((m.teft_balance || 0) * (1 + (m.referral_count || 0) * 0.25)),
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .map((m: any, i: number) => ({ ...m, position: i + 1 }));

    return NextResponse.json({ leaderboard: scored });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ leaderboard: [] });
  }
}
