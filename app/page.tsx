"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LandingPage() {
  const [recentTips, setRecentTips] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVolume: 0, activeCreators: 0 });

  const fetchData = async () => {
    const { data: tips } = await supabase.from("tips").select("*").order("created_at", { ascending: false }).limit(5);
    setRecentTips(tips || []);

    const { data: allTips } = await supabase.from("tips").select("amount");
    const { count } = await supabase.from("creators").select("*", { count: 'exact', head: true }).eq("status", "approved");
    
    const total = allTips?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    setStats({ totalVolume: total, activeCreators: count || 0 });
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('landing_realtime').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tips' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-black selection:text-white pb-20">
      
      {/* Hero Section */}
      <section className="pt-48 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            LIVE<br/><span className="text-zinc-300">ACTIVITY.</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl mx-auto mb-12">
            The elite ecosystem for Solana creators. Support your favorites directly on-chain.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <Link href="/creators" className="bg-black text-white px-12 py-5 rounded-[2rem] font-black text-sm shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-widest">
              View Creators
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards - Updated Labels */}
      <section className="max-w-3xl mx-auto px-4 mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-black/[0.01]">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-2">Total Support</p>
          <p className="text-4xl font-black tracking-tighter">{stats.totalVolume.toLocaleString()} PTS</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-black/[0.01]">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-2">Verified Creators</p>
          <p className="text-4xl font-black tracking-tighter">{stats.activeCreators}</p>
        </div>
      </section>

      {/* Live Feed */}
      <section className="max-w-xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Live</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {recentTips.map((tip) => (
            <div key={tip.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-white flex justify-between items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-[#f5f5f7] rounded-2xl flex items-center justify-center font-black text-[10px] text-zinc-300">
                   {tip.token}
                </div>
                <div>
                  <p className="text-[14px] font-bold tracking-tight">Support for @{tip.creator_username}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    From {tip.sender_wallet.slice(0,4)}...
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black tracking-tighter">+{tip.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
