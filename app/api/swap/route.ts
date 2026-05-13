import { NextRequest, NextResponse } from "next/server";

const REFERRAL_ACCOUNT = "7zWJaZ9bGrUNrMPN2CeaH3P7YTYen3FNjEtLToqVD29U";
const REFERRAL_FEE = "50";
const BASE_URL = "https://api.jup.ag/swap/v2";

export async function POST(req: NextRequest) {
  try {
    const { inputMint, outputMint, amount, taker } = await req.json();
    if (!inputMint || !outputMint || !amount || !taker) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: String(Math.round(parseFloat(amount) * 1e9)),
      taker,
      referralAccount: REFERRAL_ACCOUNT,
      referralFee: REFERRAL_FEE,
      slippageBps: "1000",
    });

    const orderRes = await fetch(`${BASE_URL}/order?${params}`, {
      headers: { "x-api-key": process.env.JUPITER_API_KEY! },
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      return NextResponse.json({ error: err }, { status: orderRes.status });
    }

    const order = await orderRes.json();
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
