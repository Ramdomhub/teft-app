"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import { useParams } from "next/navigation";

const TEFT_MINT_ADDRESS = new PublicKey("8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump");
const TEFT_DECIMALS = 6;

export default function PublicCreatorProfile() {
  const { username } = useParams();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("creators").select("*").eq("username", username).single()
      .then(({ data }) => {
        setCreator(data);
        setLoading(false);
      });
  }, [username]);

  const handleTip = async (amount: number, isTeft: boolean) => {
    if (!publicKey || !creator) return alert("Please connect your wallet first.");
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      if (isTeft) {
        const senderATA = await getAssociatedTokenAddress(TEFT_MINT_ADDRESS, publicKey);
        const creatorATA = await getAssociatedTokenAddress(TEFT_MINT_ADDRESS, new PublicKey(creator.wallet_address));
        tx.add(createTransferInstruction(senderATA, creatorATA, publicKey, amount * Math.pow(10, TEFT_DECIMALS)));
      } else {
        tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(creator.wallet_address), lamports: amount * LAMPORTS_PER_SOL }));
      }

      const signature = await sendTransaction(tx, connection);
      await supabase.from("tips").insert({ 
        sender_wallet: publicKey.toBase58(), 
        creator_username: creator.username, 
        amount, token: isTeft ? "TEFT" : "SOL", 
        tx_signature: signature 
      });
      alert(`Support successfully sent to ${creator.display_name}!`);
      window.location.reload();
    } catch (err) { alert("Transaction failed."); }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center pt-40 px-4 pb-20 selection:bg-black selection:text-white font-sans">
      <div className="w-full max-w-[440px] text-center">
        
        {/* AVATAR FIX: hardware acceleration & rendering quality */}
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-black/5 rounded-[3.5rem] blur-2xl transform translate-y-4 scale-90"></div>
          <img 
            src={creator.avatar_url} 
            className="relative w-36 h-36 rounded-[3rem] border-[6px] border-white shadow-sm object-cover z-10"
            style={{ 
              imageRendering: 'auto', 
              transform: 'translateZ(0)', 
              backfaceVisibility: 'hidden' 
            }} 
            alt="Creator"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#357aff] text-white p-2 rounded-full border-[5px] border-[#f5f5f7] z-20 shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM9.447 11l3.854-3.853-1.414-1.415L9.447 8.172 7.82 6.545 6.406 7.96 9.447 11z"/></svg>
          </div>
        </div>

        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 leading-none">{creator.display_name}</h1>
        <p className="text-zinc-300 font-bold mb-14 uppercase text-[12px] tracking-[0.2em]">@{creator.username}</p>

        <div className="bg-white rounded-[3.8rem] p-12 shadow-2xl shadow-black/[0.03] border border-white mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-10">Select Support Tier</p>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <button onClick={() => handleTip(100, true)} className="bg-black text-white font-black py-7 rounded-[1.8rem] text-[12px] uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-black/10">100 TEFT</button>
            <button onClick={() => handleTip(0.1, false)} className="bg-[#f2f2f2] text-black font-black py-7 rounded-[1.8rem] text-[12px] uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all">0.1 SOL</button>
          </div>
          <button onClick={() => handleTip(0.5, false)} className="w-full bg-[#f2f2f2] text-black font-black py-7 rounded-[1.8rem] text-[12px] uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all">0.5 SOL</button>
        </div>
        
        <p className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.5em]">Direct Peer-to-Peer Transmission</p>
      </div>
    </div>
  );
}
