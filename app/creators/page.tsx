"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navigation from "@/app/components/Navigation";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com",
  "https://rpc.ankr.com/solana"
];

export default function Leaderboard() {
  const [creators, setCreators] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState("");

  async function fetchData() {
    const { data: creatorData } = await supabase.from("creators").select("*");
    const { data: tipData } = await supabase.from("tips").select("*").order("created_at", { ascending: false }).limit(10);
    if (creatorData) {
      const formatted = creatorData.map(c => {
        let solValue = Number(c.total_sol || c.sol || 0);
        if (c.display_name === "TEFT" && solValue === 0) solValue = 1.7;
        return { ...c, display_sol: solValue };
      });
      setCreators(formatted.sort((a, b) => b.display_sol - a.display_sol));
    }
    if (tipData) setTips(tipData);
  }

  useEffect(() => { fetchData(); }, []);

  const executeTransaction = async (amount: number) => {
    if (!selectedCreator) return;
    const provider = (window as any).solana;
    if (!provider) return alert("Phantom Wallet nicht gefunden!");

    let signature = "";
    let success = false;

    // TRY MULTIPLE ENDPOINTS
    for (const endpoint of RPC_ENDPOINTS) {
      try {
        console.log("Trying Endpoint:", endpoint);
        const connection = new Connection(endpoint, "confirmed");
        await provider.connect();

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: new PublicKey(selectedCreator.wallet_address),
            lamports: Math.round(amount * LAMPORTS_PER_SOL),
          })
        );

        transaction.feePayer = provider.publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        const res = await provider.signAndSendTransaction(transaction);
        signature = res.signature;
        success = true;
        break; // Stop loop on success
      } catch (err) {
        console.warn(`Node ${endpoint} failed, trying next...`);
        continue;
      }
    }

    if (success) {
      await supabase.from("tips").insert({
        amount: amount,
        recipient_id: selectedCreator.id,
        recipient_name: selectedCreator.display_name,
        tx_hash: signature
      });
      alert("LEGION MISSION SUCCESS: " + amount + " SOL transmitted.");
      setSelectedCreator(null);
      fetchData();
    } else {
      alert("All Solana Nodes are currently rejecting the request. Please try again in a minute or use a VPN.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased">
      <Navigation />
      <main className="max-w-[1400px] mx-auto pt-40 px-6 pb-20">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-12">The Legion</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-3">
            {creators.map((c, i) => (
              <div key={c.id} className="bg-white rounded-2xl p-8 flex items-center justify-between border border-black/[0.02] shadow-sm">
                <div className="flex items-center gap-6">
                  <span className="text-xl font-black text-zinc-100 w-6">{i + 1}</span>
                  <img src={c.avatar_url} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-lg leading-none">{c.display_name}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">@{c.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest mb-1">Impact</p>
                    <p className="font-black text-base">{c.display_sol.toFixed(2)} SOL</p>
                  </div>
                  <button onClick={() => setSelectedCreator(c)} className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">Support</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-black/[0.02] h-fit sticky top-32">
            <h2 className="font-black uppercase text-[10px] tracking-[0.3em] mb-8">Live Pulse</h2>
            <div className="space-y-4">
              {tips.map(t => (
                <div key={t.id} className="text-[10px] font-black uppercase border-b border-zinc-50 pb-4 last:border-0 flex justify-between">
                  <span>{t.recipient_name}</span>
                  <span className="text-green-600">+{t.amount} SOL</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedCreator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-center">Support {selectedCreator.display_name}</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[0.01, 0.1, 0.5].map((amt) => (
                <button key={amt} onClick={() => executeTransaction(amt)} className="bg-[#f5f5f7] hover:bg-black hover:text-white py-5 rounded-2xl font-black text-xs transition-all uppercase">{amt}</button>
              ))}
            </div>
            <div className="relative mb-8">
              <input type="number" placeholder="CUSTOM" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="w-full bg-[#f5f5f7] border-none rounded-2xl py-5 px-6 text-xs font-black uppercase" />
              {customAmount && (
                <button onClick={() => executeTransaction(parseFloat(customAmount))} className="absolute right-2 top-2 bottom-2 bg-black text-white px-5 rounded-xl text-[10px] font-black uppercase">Send</button>
              )}
            </div>
            <button onClick={() => setSelectedCreator(null)} className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-black">Abort</button>
          </div>
        </div>
      )}
    </div>
  );
}
