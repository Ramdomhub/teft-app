"use client";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-black font-sans antialiased flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white">
      
      <div className="bg-white rounded-[2.5rem] max-w-[380px] w-full p-4 shadow-xl shadow-black/5 overflow-hidden border border-black/[0.01]">
        
        {/* Main Visual */}
        <div className="rounded-[2rem] overflow-hidden mb-6 bg-zinc-100 aspect-square flex items-center justify-center">
          <img 
            src="/teft.png" 
            alt="TEFT LEGION"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header Text */}
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-black tracking-tight uppercase">TEFT</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Access the TEFT ecosystem</p>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-2 gap-3 px-2">
          <a 
            href="https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump&referral=7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere&feeBps=50" 
            target="_blank" 
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95"
          >
            Buy TEFT
          </a>
          
          <a 
            href="/nft-marketplace" 
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95"
          >
            Get NFTs
          </a>
          
          <a 
            href="https://www.solsuite.io/teftsupreme" 
            target="_blank" 
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95"
          >
            NFT Staking
          </a>
          
          
          <a
            href="/pulse" className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            TEFT Pulse <span style={{background:"#e9e9e9",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:700,color:"#999"}}>BETA</span>
          </a>
          <a
            href="/identity"
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            TEFT Identity <span style={{background:"#C084FC22",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:700,color:"#C084FC"}}>NEW</span>
          </a>
        </div>

        {/* Footer Links - Mit korrigiertem X Link */}
        <div className="mt-10 mb-4 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight mb-4">Mobile ready · Phantom supported</p>
          <div className="flex justify-center items-center gap-4 text-[11px] font-bold">
            <a href="https://x.com/TEFTofficial" target="_blank" className="text-zinc-500 hover:text-black transition-none">X</a>
            <a href="https://www.teftlegion.io" className="text-zinc-500 hover:text-black">www.teftlegion.io</a>
            <a href="https://t.me/teftlegionofficial" target="_blank" className="text-zinc-500 hover:text-black transition-none">Telegram</a>
          </div>
        </div>

      </div>
    </div>
  );
}
