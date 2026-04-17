"use client";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased flex flex-col items-center justify-center p-6">
      
      <div className="max-w-[400px] w-full space-y-10">
        
        {/* Main Card */}
        <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/[0.01]">
          <div className="relative aspect-[4/5] w-full bg-[#f5f5f7]">
            <img 
              src="https://fuxshiauvjshvshvuvnd.supabase.co/storage/v1/object/public/images/TEFT-LEGION.png" 
              alt="TEFT LEGION"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-10 text-center space-y-2">
            <h1 className="text-2xl font-[1000] tracking-tighter uppercase italic">TEFT</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Access the TEFT ecosystem</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <a href="https://jup.ag/swap/SOL-TEFT" target="_blank" className="bg-white p-6 rounded-[2rem] text-center shadow-sm border border-black/[0.02] hover:bg-zinc-50 transition-all active:scale-95">
            <span className="text-[10px] font-black uppercase tracking-widest">Swap</span>
          </a>
          <a href="https://magiceden.io" target="_blank" className="bg-white p-6 rounded-[2rem] text-center shadow-sm border border-black/[0.02] hover:bg-zinc-50 transition-all active:scale-95">
            <span className="text-[10px] font-black uppercase tracking-widest">NFTs</span>
          </a>
          <div className="bg-white/40 p-6 rounded-[2rem] text-center border border-black/[0.02] opacity-40 cursor-not-allowed">
            <span className="text-[10px] font-black uppercase tracking-widest">Staking</span>
          </div>
          
          {/* Deaktivierter Creator Hub */}
          <div className="bg-zinc-200/20 p-6 rounded-[2rem] text-center border border-dashed border-zinc-300 opacity-60 cursor-default">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Creator Hub</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-6 pt-2">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Mobile ready. Phantom supported.</p>
          <div className="flex justify-center gap-8">
            <a href="https://x.com/teft" target="_blank" className="text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-all">X</a>
            <a href="https://t.me/teft" target="_blank" className="text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-all">Telegram</a>
          </div>
        </div>
      </div>
    </div>
  );
}
