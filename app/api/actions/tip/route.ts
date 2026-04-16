import { 
  ActionPostResponse, 
  ACTIONS_CORS_HEADERS, 
  createPostResponse, 
  ActionGetResponse, 
  ActionPostRequest 
} from "@solana/actions";
import { 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  Connection, 
  clusterApiUrl, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { supabase } from "@/lib/supabase";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const username = url.searchParams.get("creator");

  const { data: creator } = await supabase
    .from("creators")
    .select("display_name, avatar_url, wallet_address")
    .eq("username", username)
    .single();

  const payload: ActionGetResponse = {
    icon: creator?.avatar_url || "https://teftlegion.com/logo.png",
    title: `Support ${creator?.display_name || username}`,
    description: `Directly support ${creator?.display_name} via Solana Blinks.`,
    label: "Tip",
    links: {
      actions: [
        { label: "0.1 SOL", href: `${url.href}&amount=0.1` },
        { label: "0.5 SOL", href: `${url.href}&amount=0.5` },
        { label: "1.0 SOL", href: `${url.href}&amount=1.0` }
      ]
    }
  };

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  const url = new URL(req.url);
  const amount = parseFloat(url.searchParams.get("amount") || "0.1");
  const username = url.searchParams.get("creator");
  const body: ActionPostRequest = await req.json();
  
  const { data: creator } = await supabase
    .from("creators")
    .select("wallet_address")
    .eq("username", username)
    .single();

  const sender = new PublicKey(body.account);
  const receiver = new PublicKey(creator!.wallet_address);
  const connection = new Connection(clusterApiUrl("devnet"));

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: receiver,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  transaction.feePayer = sender;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const payload: ActionPostResponse = await createPostResponse({
    fields: { transaction, message: `Support sent to ${username}!` }
  });

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
};
