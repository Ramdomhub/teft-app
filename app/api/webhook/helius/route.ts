import { NextRequest, NextResponse } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // 1. Die geheime Payload von Helius empfangen
    const body = await req.json();

    // Helius sendet meistens ein Array von Transaktionen
    if (!body || body.length === 0) {
      return NextResponse.json({ message: "No events found" }, { status: 200 });
    }

    const tx = body[0]; // Wir nehmen die erste Transaktion im Array
    
    // Wir prüfen nur erfolgreiche SOL oder Token Transfers
    if (tx.type !== "TRANSFER" && tx.type !== "UNKNOWN") {
      return NextResponse.json({ message: "Not a transfer, ignored." }, { status: 200 });
    }

    // 2. Extrahiere die relevanten Daten aus der Blockchain
    const signature = tx.signature;
    const sender = tx.feePayer;
    let receiver = "";
    let amount = 0;
    let token = "SOL";

    // Prüfen, ob es ein Token (TEFT) oder natives SOL ist
    if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
      const transfer = tx.tokenTransfers[0];
      receiver = transfer.toUserAccount;
      amount = transfer.tokenAmount;
      // Wenn es deine TEFT Mint Adresse ist (hier Platzhalter)
      if (transfer.mint === "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump") {
        token = "TEFT";
      }
    } else if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
      const transfer = tx.nativeTransfers[0];
      receiver = transfer.toUserAccount;
      amount = transfer.amount / 1000000000; // Umrechnung Lamports zu SOL
    }

    // Wenn keine gültigen Daten gefunden wurden, abbrechen
    if (!receiver || amount <= 0) {
      return NextResponse.json({ message: "No valid transfer data found" }, { status: 200 });
    }

    // 3. Finde den Creator in DEINER Datenbank anhand der Empfänger-Wallet
    const { data: creator } = await supabase
      .from("creators")
      .select("username")
      .eq("wallet_address", receiver)
      .single();

    if (!creator) {
      return NextResponse.json({ message: "Wallet not registered as creator." }, { status: 200 });
    }

    // 4. SICHERHEITS-CHECK: Ist die Transaktion schon in der Datenbank?
    const { data: existingTip } = await supabase
      .from("tips")
      .select("id")
      .eq("tx_signature", signature)
      .single();

    if (existingTip) {
      return NextResponse.json({ message: "Transaction already recorded." }, { status: 200 });
    }

    // 5. In die Datenbank schreiben (Leaderboard aktualisieren!)
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
