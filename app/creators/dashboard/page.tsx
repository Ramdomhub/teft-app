"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CreatorDashboard() {
  const { publicKey } = useWallet();
  const [creator, setCreator] = useState<any>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    const fetchData = async () => {
      const { data: creatorData } = await supabase.from("creators")
        .select("*")
        .eq("wallet_address", publicKey.toBase58())
        .single();
      
      if (creatorData) {
        setCreator(creatorData);
        const { data: tipsData } = await supabase.from("tips")
          .select("*")
          .eq("creator_username", creatorData.username)
          .order("created_at", { ascending: false });
        setTips(tipsData || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [publicKey]);

  if (!publicKey) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-[0.3em]">Connect Wallet</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-[0.3em]">Syncing Data...</div>;

  const solTotal = tips.filter(t => t.token === "SOL").reduce((sum, t) => sum + Number(t.amount), 0);
  const teftTotal = tips.filter(t => t.token === "TEFT").reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-40 px-4 pb-20 selection:bg-black selection:text-white">
      <div className="max-w-[480px] mx-auto">
        
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <img src={creator?.avatar_url} className="w-32 h-32 rounded-[3rem] object-cover shadow-2xl border-4 border-white" />
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full border-4 border-[#f5f5f7]">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM9.447 11l3.854-3.853-1.414-1.415L9.447 8.172 7.82 6.545 6.406 7.96 9.447 11z"/></svg>
            </div>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">My Dashboard</h1>
          <p className="text-zinc-300 font-bold uppercase text-[11px] tracking-[0.2em] mt-4">@{creator?.username}</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-black/[0.02] border border-white mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 text-center mb-12">Earnings Overview</p>
          
          <div className="grid grid-cols-2 gap-8 text-center mb-12">
            <div>
              <p className="text-5xl font-black tracking-tighter">{solTotal.toFixed(2)}</p>
              <p className="text-[10px] font-black text-zinc-300 uppercase mt-2 tracking-widest">Sol Total</p>
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter">{teftTotal.toLocaleString()}</p>
              <p className="text-[10px] font-black text-zinc-300 uppercase mt-2 tracking-widest">Teft Total</p>
            </div>
          </div>
          
          <div className="pt-10 border-t border-zinc-50 flex justify-between px-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-300 uppercase mb-2 tracking-widest">Rank</p>
              <p className="font-black text-xl tracking-tight">#01</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-300 uppercase mb-2 tracking-widest">Status</p>
              <p className="font-black text-blue-500 uppercase text-xl tracking-tight">Elite</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/creators/join?ref=${creator.username}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`w-full py-6 rounded-[2.2rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl ${copied ? "bg-green-500 text-white" : "bg-black text-white shadow-black/20 active:scale-95"}`}
        >
          {copied ? "Link Copied" : "Copy Referral Link"}
        </button>
      </div>
    </div>
  );
}
