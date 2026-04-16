"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navigation from "@/app/components/Navigation";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function Leaderboard() {
  const [creators, setCreators] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [currency, setCurrency] = useState<"SOL" | "TEFT">("SOL");
  const [customAmount, setCustomAmount] = useState("");
  const [user, setUser] = useState<any>(null);

  async function fetchData() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    const { data: creatorData } = await supabase.from("creators").select("*");
    const { data: tipData } = await supabase.from("tips").select("*").order("created_at", { ascending: false }).limit(10);
    if (creatorData) {
      setCreators(creatorData.map(c => ({
        ...c,
        display_sol: Number(c.total_sol || (c.display_name === "TEFT" ? 1.7 : 0))
      })).sort((a, b) => b.display_sol - a.display_sol));
    }
    if (tipData) setTips(tipData);
  }

  useEffect(() => { fetchData(); }, []);

  const executeTransaction = async (amount: number) => {
    if (!selectedCreator) return;
    const provider = (window as any).solana;
    if (!provider) return alert("Phantom Wallet nicht gefunden!");

    try {
      await provider.connect();
      // Nutze einen alternativen Public RPC für bessere Erreichbarkeit
      const connection = new Connection("https://solana-mainnet.rpc.extrnode.com", "confirmed");

      let transaction = new Transaction();
      if (currency === "SOL") {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: new PublicKey(selectedCreator.wallet_address),
            lamports: Math.round(amount * LAMPORTS_PER_SOL),
          })
        );
      } else {
        alert("TEFT Transfer via SPL Library wird im nächsten Schritt aktiviert.");
        return;
      }

      transaction.feePayer = provider.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const { signature } = await provider.signAndSendTransaction(transaction);
      
      await supabase.from("tips").insert({
        amount,
        currency,
        recipient_name: selectedCreator.display_name,
        sender_wallet: provider.publicKey.toString(),
        sender_name: user?.user_metadata?.full_name || user?.user_metadata?.user_name || null,
        tx_hash: signature
      });

      alert("LEGION MISSION SUCCESS");
      setSelectedCreator(null);
      fetchData();
    } catch (err: any) {
      alert("RPC Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased">
      <Navigation />
      <main className="max-w-[1400px] mx-auto pt-40 px-6 pb-20">
        <h1 className="text-6xl font-[900] uppercase tracking-tighter mb-12">The Legion</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-3">
            {creators.map((c, i) => (
              <div key={c.id} className="bg-white rounded-2xl p-8 flex items-center justify-between border border-black/[0.02] shadow-sm">
                <div className="flex items-center gap-6">
                  <span className="text-xl font-black text-zinc-100 w-6">{i + 1}</span>
                  <img src={c.avatar_url} className="w-14 h-14 rounded-2xl object-cover" />
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

          <div className="bg-white rounded-[2.5rem] p-8 border border-black/[0.02] h-fit sticky top-32 shadow-sm">
            <h2 className="font-black uppercase text-[10px] tracking-[0.3em] mb-8 text-zinc-400">Live Pulse</h2>
            <div className="space-y-6">
              {tips.map((t) => (
                <div key={t.id} className="border-b border-zinc-50 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-black uppercase tracking-tight">
                      {t.sender_name ? `@${t.sender_name}` : `${t.sender_wallet?.slice(0,4)}...`}
                    </span>
                    <span className="text-green-600 font-black text-[11px]">+{t.amount} {t.currency || "SOL"}</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">pushed {t.recipient_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedCreator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 text-center">Support {selectedCreator.display_name}</h2>
            <div className="flex bg-zinc-100 p-1 rounded-2xl mb-8">
              <button onClick={() => setCurrency("SOL")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currency === "SOL" ? "bg-white shadow-sm" : "text-zinc-400"}`}>SOL</button>
              <button onClick={() => setCurrency("TEFT")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${currency === "TEFT" ? "bg-white shadow-sm" : "text-zinc-400"}`}>TEFT</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[0.1, 0.5, 1].map((amt) => (
                <button key={amt} onClick={() => executeTransaction(amt)} className="bg-[#f5f5f7] hover:bg-black hover:text-white py-5 rounded-2xl font-black text-[11px] uppercase transition-all">
                  {amt} <span className="text-[8px] opacity-50">{currency}</span>
                </button>
              ))}
            </div>
            <div className="relative mb-8">
              <input type="number" placeholder={`CUSTOM ${currency}`} value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="w-full bg-[#f5f5f7] border-none rounded-2xl py-5 px-6 text-xs font-black uppercase" />
              {customAmount && (
                <button onClick={() => executeTransaction(parseFloat(customAmount))} className="absolute right-2 top-2 bottom-2 bg-black text-white px-5 rounded-xl text-[10px] font-black uppercase">Send</button>
              )}
            </div>
            <button onClick={() => setSelectedCreator(null)} className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Abort Mission</button>
          </div>
        </div>
      )}
    </div>
  );
}
