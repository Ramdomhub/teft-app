"use client";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] text-black font-sans antialiased flex flex-col items-center justify-center p-4">
      
      <div className="bg-white rounded-[2.5rem] max-w-[380px] w-full p-4 shadow-xl shadow-black/5 overflow-hidden">
        
        {/* Main Visual */}
        <div className="rounded-[2rem] overflow-hidden mb-6">
          <img 
            src="https://fuxshiauvjshvshvuvnd.supabase.co/storage/v1/object/public/images/TEFT-LEGION.png" 
            alt="TEFT LEGION"
            className="w-full aspect-square object-cover"
          />
        </div>

        {/* Header Text */}
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-black tracking-tight uppercase">TEFT</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Access the TEFT ecosystem</p>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-2 gap-3 px-2">
          <a href="https://jup.ag/swap/SOL-TEFT" target="_blank" className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all">
            Swap via Phantom
          </a>
          <a href="https://magiceden.io" target="_blank" className="bg-[#e9e9e9] text-black py-4 rounded-2xl text-center text-xs font-bold hover:bg-[#dfdfdf] transition-all">
            Get NFTs
          </a>
          
          {/* STAKING WIEDER AKTIV */}
          <a href="/staking" className="bg-[#e9e9e9] text-black py-4 rounded-2xl text-center text-xs font-bold hover:bg-[#dfdfdf] transition-all">
            NFT Staking
          </a>
          
          {/* NUR CREATOR HUB GESPERRT */}
          <div className="bg-[#e9e9e9] text-zinc-400 py-4 rounded-2xl text-center text-xs font-bold opacity-60 cursor-not-allowed">
            Creator Hub
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-10 mb-4 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight mb-4">Mobile ready · Phantom supported</p>
          <div className="flex justify-center items-center gap-4 text-[11px] font-bold">
            <a href="https://x.com/teft" target="_blank" className="text-zinc-500 hover:text-black">X</a>
            <a href="https://www.teftlegion.io" className="text-zinc-500 hover:text-black italic">www.teftlegion.io</a>
            <a href="https://t.me/teft" target="_blank" className="text-zinc-500 hover:text-black">Telegram</a>
          </div>
        </div>

      </div>
    </div>
  );
}
