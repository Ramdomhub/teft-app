import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json();
    if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

    const session = await getServerSession() as any;
    if (!session?.xHandle) return NextResponse.json({ error: "Not authenticated with X" }, { status: 401 });

    await supabase.from("legion_members").update({
      x_handle: session.xHandle,
      x_verified_at: new Date().toISOString(),
    }).eq("wallet_address", wallet);

    return NextResponse.json({ success: true, xHandle: session.xHandle });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
