"use client";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white">
      <div className="bg-white rounded-[2.5rem] max-w-[380px] w-full p-4 shadow-xl shadow-black/5 overflow-hidden border border-black/[0.03]">

        {/* Hero Image */}
        <div className="rounded-[2rem] overflow-hidden mb-6 bg-zinc-100 aspect-square flex items-center justify-center">
          <img src="/teft.png" alt="TEFT LEGION" className="w-full h-full object-cover" />
        </div>

        {/* Header */}
        <div className="px-2 mb-6">
          <h1 className="text-2xl font-black tracking-tight uppercase">TEFT</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Token-gated tools for TEFT holders on Solana</p>
        </div>

        {/* Buy TEFT — full width, primary */}
        <div className="px-2 mb-3">
          <a
            href={"https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump&referral=7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere&feeBps=50"}
            target="_blank"
            className="bg-black text-white py-4 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95 block w-full"
          >
            Buy TEFT
          </a>
        </div>

        {/* Feature Cards */}
        <div className="px-2 flex flex-col gap-3 mb-3">

          {/* TEFT Pulse */}
          <a href="/pulse" className="block bg-black text-white rounded-2xl p-4 hover:opacity-90 transition-all active:scale-95">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black tracking-wide">TEFT Pulse</span>
              <span style={{background:"#2a2a2a",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,color:"#888"}}>BETA</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Real-time signals from 24 smart wallets. See what the best traders on Solana are buying — before everyone else.</p>
          </a>

          {/* TEFT Terminal */}
          <a href="/terminal" className="block bg-black text-white rounded-2xl p-4 hover:opacity-90 transition-all active:scale-95">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black tracking-wide">TEFT Terminal</span>
              <span style={{background:"#4ade8022",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,color:"#4ade80"}}>LIVE</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Price, MCap, Fear & Greed, Crypto News — all signals, one screen.</p>
          </a>

          {/* TEFT Identity */}
          <a href="/identity" className="block bg-black text-white rounded-2xl p-4 hover:opacity-90 transition-all active:scale-95">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black tracking-wide">TEFT Identity</span>
              <span style={{background:"#C084FC22",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,color:"#C084FC"}}>NEW</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Your on-chain profile. Rank, badges, legion size — all based on your wallet. Share your identity on X.</p>
          </a>

        </div>

        {/* Secondary buttons */}
        <div className="grid grid-cols-2 gap-3 px-2 mb-3">
          <a href="/nft-marketplace" className="bg-black text-white py-3 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95">
            Get NFTs
          </a>
          <a href="https://www.solsuite.io/teftsupreme" target="_blank" className="bg-black text-white py-3 rounded-2xl text-center text-xs font-bold hover:opacity-80 transition-all active:scale-95">
            NFT Staking
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 mb-2 text-center">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight mb-3">Mobile ready · Phantom supported</p>
          <div className="flex justify-center items-center gap-4 text-[11px] font-bold">
            <a href="https://x.com/TEFTofficial" target="_blank" className="text-zinc-400 hover:text-black transition-colors">X</a>
            <a href="https://www.teftlegion.io" target="_blank" className="text-zinc-400 hover:text-black transition-colors">teftlegion.io</a>
            <a href="https://t.me/teftlegionofficial" target="_blank" className="text-zinc-400 hover:text-black transition-colors">Telegram</a>
          </div>
        </div>

      </div>
    </div>
  );
}
