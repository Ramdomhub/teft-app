"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";

export default function CreatorHub() {
  const [recentTips, setRecentTips] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVolume: 1.7, activeCreators: 1 });

  const fetchData = async () => {
    const { data: tips } = await supabase.from("tips").select("*").order("created_at", { ascending: false }).limit(5);
    if (tips) setRecentTips(tips);
    
    const { data: creatorData } = await supabase.from("creators").select("total_sol");
    const total = creatorData?.reduce((sum, c) => sum + (Number(c.total_sol) || 0), 0) || 1.7;
    setStats({ totalVolume: total < 1.7 ? 1.7 : total, activeCreators: creatorData?.length || 1 });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased pb-20 selection:bg-black selection:text-white">
      <Navigation />
      <section className="pt-48 pb-20 px-4 text-center">
        <h1 className="text-7xl md:text-9xl font-[900] tracking-tighter mb-8 leading-[0.85] uppercase italic">LIVE<br/><span className="text-zinc-200">ACTIVITY.</span></h1>
        <p className="text-zinc-400 text-lg font-bold max-w-xl mx-auto mb-12 uppercase tracking-tight">The elite ecosystem for Solana creators.</p>
        <Link href="/creators" className="bg-black text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] inline-block shadow-2xl hover:scale-105 transition-all active:scale-95">View Creators</Link>
      </section>

      <section className="max-w-3xl mx-auto px-4 mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-black/[0.01]">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-4 italic">Total Support</p>
          <p className="text-5xl font-[900] tracking-tighter">{stats.totalVolume.toFixed(1).replace('.', ',')} PTS</p>
        </div>
        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-black/[0.01]">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-4 italic">Verified Creators</p>
          <p className="text-5xl font-[900] tracking-tighter">{stats.activeCreators}</p>
        </div>
      </section>

      {/* Mini Activity Feed */}
      <section className="max-w-xl mx-auto px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 text-center">Recent Activity</h2>
        <div className="space-y-3">
          {recentTips.map((tip) => (
            <div key={tip.id} className="bg-white p-6 rounded-[2rem] flex justify-between items-center shadow-sm border border-black/[0.01]">
               <div className="text-[11px] font-black uppercase tracking-tight">Support → {tip.recipient_name}</div>
               <div className="text-green-600 font-black">+{tip.amount} SOL</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
