"use client";
import React from "react";
import Navigation from "./components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-black selection:text-white">
      <Navigation />
      
      <main className="flex flex-col items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-[440px] w-full space-y-12">
          
          {/* Main Visual / Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-black/5 to-black/10 rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white rounded-[3rem] overflow-hidden shadow-sm border border-black/[0.02]">
              <img 
                src="https://fuxshiauvjshvshvuvnd.supabase.co/storage/v1/object/public/images//TEFT-LEGION.png" 
                alt="TEFT LEGION"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="p-10 text-center space-y-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-[1000] tracking-tighter uppercase italic">TEFT</h1>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Access the TEFT ecosystem</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            <a href="https://jup.ag/swap/SOL-TEFT" target="_blank" className="bg-white p-6 rounded-[2rem] text-center border border-black/[0.03] hover:bg-zinc-50 transition-all group">
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">Swap</span>
            </a>
            <a href="https://magiceden.io" target="_blank" className="bg-white p-6 rounded-[2rem] text-center border border-black/[0.03] hover:bg-zinc-50 transition-all group">
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">NFTs</span>
            </a>
            <a href="#" className="bg-white p-6 rounded-[2rem] text-center border border-black/[0.03] opacity-50 cursor-not-allowed group">
              <span className="text-[10px] font-black uppercase tracking-widest">Staking</span>
            </a>
            {/* DEAKTIVIERTER CREATOR HUB */}
            <div className="bg-zinc-100/50 p-6 rounded-[2rem] text-center border border-dashed border-zinc-200 cursor-help group relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Creator Hub</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-[2rem]">
                <span className="text-[8px] font-black uppercase tracking-tighter text-black">Under Construction</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-6">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Mobile ready. Phantom supported.</p>
            <div className="flex justify-center gap-8">
              <a href="https://x.com/teft" target="_blank" className="text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">X</a>
              <a href="https://t.me/teft" target="_blank" className="text-[10px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors">Telegram</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
