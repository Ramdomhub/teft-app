import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// On-demand Token-Details (wird später mit Helius + DexScreener befüllt)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  
  return NextResponse.json({
    status: "under_construction",
    mint,
    message: "Token details endpoint — phase 1 coming soon",
  });
}
