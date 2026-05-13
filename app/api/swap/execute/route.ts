import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.JUPITER_API_KEY!;
const BASE_URL = "https://api.jup.ag/swap/v2";

export async function POST(req: NextRequest) {
  try {
    const { signedTransaction, requestId } = await req.json();

    const res = await fetch(`${BASE_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ signedTransaction, requestId }),
    });

    const result = await res.json();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
