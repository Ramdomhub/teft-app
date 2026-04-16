"use client";
import Link from "next/link";

export default function Gateway() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        
        {/* Top Image */}
        <div className="rounded-[24px] overflow-hidden aspect-square w-full bg-zinc-100">
          <img src="/teft.png" alt="TEFT" className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-6 flex flex-col text-center">
          <h1 className="text-[22px] font-bold tracking-tight text-black m-0 p-0">TEFT</h1>
          <p className="text-[14px] text-zinc-500 mt-1 mb-5">Access the TEFT ecosystem</p>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <a href="https://phantom.com/tokens/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump" target="_blank" className="bg-black text-white py-3.5 rounded-[16px] text-[13px] font-bold flex items-center justify-center hover:scale-[1.02] transition-transform">
              Swap
            </a>
            
            {/* GEÄNDERT: Link jetzt auf /nft */}
            <Link href="/nft" className="bg-[#efefef] text-black py-3.5 rounded-[16px] text-[13px] font-bold flex items-center justify-center hover:bg-[#e5e5e5] transition-colors">
              NFTs
            </Link>

            <a href="https://www.solsuite.io/teftsupreme" target="_blank" className="bg-[#efefef] text-black py-3.5 rounded-[16px] text-[13px] font-bold flex items-center justify-center hover:bg-[#e5e5e5] transition-colors">
              Staking
            </a>

            {/* GEÄNDERT: Name jetzt Creator Hub und Link auf /hub */}
            <Link href="/hub" className="bg-[#efefef] text-black py-3.5 rounded-[16px] text-[13px] font-bold flex items-center justify-center hover:bg-black hover:text-white transition-all">
              Creator Hub
            </Link>
          </div>

          {/* Footer Info */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-[10px] text-zinc-400 font-medium">Mobile ready · Phantom supported</div>
            <div className="flex justify-center gap-4 text-[11px] text-zinc-500 font-semibold mt-1">
              <a href="https://x.com/TEFTofficial" target="_blank" className="hover:text-black transition-colors">X</a>
              <a href="https://t.me/teftlegionofficial" target="_blank" className="hover:text-black transition-colors">Telegram</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
