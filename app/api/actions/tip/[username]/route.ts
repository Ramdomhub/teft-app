import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import { supabase } from "@/lib/supabase";

const TEFT_MINT_ADDRESS = new PublicKey("8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump");
const TEFT_DECIMALS = 6;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers });
}

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params;
  const { data: creator } = await supabase.from("creators").select("*").eq("username", username).single();

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404, headers });
  }

  const payload = {
    icon: creator.avatar_url,
    title: `Support ${creator.display_name} 🛡️`,
    description: `Drop a tip directly from your feed! Support @${creator.username} to climb the TEFT Legion Leaderboard. Use TEFT for a 1.5x score boost!`,
    label: "Support",
    links: {
      actions: [
        { label: "0.1 SOL", href: `/api/actions/tip/${username}?amount=0.1&token=SOL` },
        { label: "100 TEFT", href: `/api/actions/tip/${username}?amount=100&token=TEFT` },
        { label: "500 TEFT", href: `/api/actions/tip/${username}?amount=500&token=TEFT` },
      ]
    }
  };

  return NextResponse.json(payload, { headers });
}

export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params;
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get("amount") || "0.1");
    const tokenType = searchParams.get("token") || "SOL";

    const body = await req.json();
    const senderWallet = new PublicKey(body.account);

    const { data: creator } = await supabase.from("creators").select("wallet_address").eq("username", username).single();
    if (!creator) throw new Error("Creator not found");

    const connection = new Connection("https://api.devnet.solana.com");
    const latestBlockhash = await connection.getLatestBlockhash();
    
    const transaction = new Transaction({
      feePayer: senderWallet,
      recentBlockhash: latestBlockhash.blockhash,
    });

    if (tokenType === "TEFT") {
      // TEFT Token Transfer (SPL)
      const senderATA = await getAssociatedTokenAddress(TEFT_MINT_ADDRESS, senderWallet);
      const creatorATA = await getAssociatedTokenAddress(TEFT_MINT_ADDRESS, new PublicKey(creator.wallet_address));
      
      transaction.add(
        createTransferInstruction(
          senderATA,
          creatorATA,
          senderWallet,
          amount * Math.pow(10, TEFT_DECIMALS)
        )
      );
    } else {
      // Standard SOL Transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderWallet,
          toPubkey: new PublicKey(creator.wallet_address),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
    }

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
    const base64Transaction = serializedTransaction.toString("base64");

    return NextResponse.json({
      transaction: base64Transaction,
      message: `Boom! Supported @${username} with ${amount} ${tokenType}. Leaderboard is updating!`,
    }, { headers });

  } catch (error) {
    console.error("Blink Error:", error);
    return NextResponse.json({ error: "Failed to build transaction" }, { status: 500, headers });
  }
}
