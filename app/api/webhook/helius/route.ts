import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || body.length === 0) {
      return NextResponse.json({ message: "No events found" }, { status: 200 });
    }

    const tx = body[0];

    if (tx.type !== "TRANSFER" && tx.type !== "UNKNOWN") {
      return NextResponse.json({ message: "Not a transfer, ignored." }, { status: 200 });
    }

    const signature = tx.signature;
    const sender = tx.feePayer;
    let receiver = "";
    let amount = 0;
    let token = "SOL";

    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const transfer = tx.tokenTransfers[0];
      receiver = transfer.toUserAccount;
      amount = transfer.tokenAmount;
      if (transfer.mint === "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump") {
        token = "TEFT";
      }
    } else if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const transfer = tx.nativeTransfers[0];
      receiver = transfer.toUserAccount;
      amount = transfer.amount / 1000000000;
    }

    if (!receiver || amount <= 0) {
      return NextResponse.json({ message: "No valid transfer data found" }, { status: 200 });
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("username")
      .eq("wallet_address", receiver)
      .single();

    if (!creator) {
      return NextResponse.json({ message: "Wallet not registered as creator." }, { status: 200 });
    }

    const { data: existingTip } = await supabase
      .from("tips")
      .select("id")
      .eq("tx_signature", signature)
      .single();

    if (existingTip) {
      return NextResponse.json({ message: "Transaction already recorded." }, { status: 200 });
    }

    const { error } = await supabase.from("tips").insert({
      sender_wallet: sender,
      creator_username: creator.username,
      amount: amount,
      token: token,
      tx_signature: signature
    });

    if (error) throw new Error("Failed to save to Supabase: " + error.message);

    return NextResponse.json({ message: "Webhook processed & Leaderboard updated!" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
