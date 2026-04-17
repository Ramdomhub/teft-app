"use client";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] text-black font-sans antialiased flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white">
      
      <div className="bg-white rounded-[2.5rem] max-w-[380px] w-full p-4 shadow-xl shadow-black/5 overflow-hidden border border-black/[0.01]">
        
        {/* Main Visual - Korrigierter Pfad zu public/teft.png */}
        <div className="rounded-[2rem] overflow-hidden mb-6 bg-zinc-100 aspect-square flex items-center justify-center">
          <img 
            src="/teft.png" 
            alt="TEFT LEGION"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Bild 'teft.png' konnte nicht in /public gefunden werden.");
            }}
          />
        </div>

        {/* Header Text - Keine Kursivschrift */}
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-black tracking-tight uppercase">TEFT</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Access the TEFT ecosystem</p>
        </div>

        {/* Button Grid - Deine korrekten Links */}
        <div className="grid grid-cols-2 gap-3 px-2">
          {/* Swap Link zu Phantom Trade */}
          <a 
            href="https://trade.phantom.com/token/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump" 
            target="_blank" 
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95"
          >
            Swap via Phantom
          </a>
          
          {/* NFT Marketplace Unterseite */}
          <a 
            href="/nft-marketplace" 
            className="bg-[#e9e9e9] text-black py-4 rounded-2xl text-center text-xs font-bold hover:bg-[#dfdfdf] transition-all active:scale-95"
          >
            Get NFTs
          </a>
          
          {/* Staking Link zu Solsuite */}
          <a 
            href="https://www.solsuite.io/teftsupreme" 
            target="_blank" 
            className="bg-[#e9e9e9] text-black py-4 rounded-2xl text-center text-xs font-bold hover:bg-[#dfdfdf] transition-all active:scale-95"
          >
            NFT Staking
          </a>
          
          {/* Creator Hub gesperrt */}
          <div className="bg-[#e9e9e9] text-zinc-400 py-4 rounded-2xl text-center text-xs font-bold opacity-60 cursor-not-allowed flex items-center justify-center">
            Creator Hub
          </div>
        </div>

        {/* Footer Links - OHNE Kursivschrift */}
        <div className="mt-10 mb-4 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight mb-4">Mobile ready · Phantom supported</p>
          <div className="flex justify-center items-center gap-4 text-[11px] font-bold">
            <a href="https://x.com/teft" target="_blank" className="text-zinc-500 hover:text-black">X</a>
            <a href="https://www.teftlegion.io" className="text-zinc-500 hover:text-black italic-none">www.teftlegion.io</a>
            <a href="https://t.me/teft" target="_blank" className="text-zinc-500 hover:text-black">Telegram</a>
          </div>
        </div>

      </div>
    </div>
  );
}
