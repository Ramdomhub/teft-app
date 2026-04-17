"use client";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] text-black font-sans antialiased flex flex-col items-center justify-center p-4">
      
      <div className="bg-white rounded-[2.5rem] max-w-[380px] w-full p-4 shadow-xl shadow-black/5 overflow-hidden">
        
        {/* Main Visual - Pfad korrigiert */}
        <div className="rounded-[2rem] overflow-hidden mb-6 bg-zinc-100">
          <img 
            src="https://fuxshiauvjshvshvuvnd.supabase.co/storage/v1/object/public/images/TEFT-LEGION.png" 
            alt="TEFT LEGION"
            className="w-full aspect-square object-cover"
          />
        </div>

        {/* Header Text - Keine Kursivschrift */}
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-black tracking-tight uppercase">TEFT</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Access the TEFT ecosystem</p>
        </div>

        {/* Button Grid - Links aktualisiert */}
        <div className="grid grid-cols-2 gap-3 px-2">
          {/* Swap Button zu Phantom Trade */}
          <a 
            href="https://trade.phantom.com/token/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump" 
            target="_blank" 
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all"
          >
            Swap via Phantom
          </a>
          
          {/* NFT Marketplace Unterseite */}
          <a 
            href="/nft-marketplace" 
            className="bg-[#e9e9e9] text-black py-4 rounded-2xl text-center text-xs font-bold hover:bg-[#dfdfdf] transition-all"
          >
            Get NFTs
          </a>
          
          {/* Staking Button zu Solsuite */}
          <a 
            href="https://www.solsuite.io/teftsupreme" 
            target="_blank" 
            className="bg-[#e9e9e9] text-black py-4 rounded-2xl text-center text-xs font-bold hover:bg-[#dfdfdf] transition-all"
          >
            NFT Staking
          </a>
          
          {/* Creator Hub gesperrt */}
          <div className="bg-[#e9e9e9] text-zinc-400 py-4 rounded-2xl text-center text-xs font-bold opacity-60 cursor-not-allowed">
            Creator Hub
          </div>
        </div>

        {/* Footer Links - Kursivschrift entfernt */}
        <div className="mt-10 mb-4 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight mb-4">Mobile ready · Phantom supported</p>
          <div className="flex justify-center items-center gap-4 text-[11px] font-bold">
            <a href="https://x.com/teft" target="_blank" className="text-zinc-500 hover:text-black">X</a>
            <a href="https://www.teftlegion.io" className="text-zinc-500 hover:text-black">www.teftlegion.io</a>
            <a href="https://t.me/teft" target="_blank" className="text-zinc-500 hover:text-black">Telegram</a>
          </div>
        </div>

      </div>
    </div>
  );
}
