import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { wallet, xHandle } = await req.json();
    if (!wallet || !xHandle) {
      return NextResponse.json({ error: "Missing wallet or xHandle" }, { status: 400 });
    }

    await supabase.from("legion_members").update({
      x_handle: xHandle,
      x_verified_at: new Date().toISOString(),
    }).eq("wallet_address", wallet);

    return NextResponse.json({ success: true, xHandle });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
