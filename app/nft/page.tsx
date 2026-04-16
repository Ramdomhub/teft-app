'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function TeftMarket() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/nfts');
      const json = await res.json();
      setData(json);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-[400px] bg-[#0f0f0f] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 min-h-[650px] flex flex-col relative">
        
        <div className="flex flex-col h-full p-6 animate-in fade-in duration-500">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center text-zinc-400 text-sm font-medium hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={fetchData} className="text-zinc-600 hover:text-white transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">Market Live</span>
            </div>
          </div>

          {loading && !data ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/20" />
            </div>
          ) : (
            <>
              {/* TITEL SEKTION */}
              <div className="mb-8">
                <h3 className="text-2xl font-black tracking-tighter">Recent Listings</h3>
                <p className="text-zinc-500 text-xs font-medium">Verified TEFT Supreme Collection</p>
              </div>

              {/* HORIZONTAL CAROUSEL */}
              <div className="flex gap-4 overflow-x-auto pb-8 snap-x no-scrollbar">
                {data?.items?.map((nft: any, i: number) => (
                  <div key={i} className="min-w-[240px] bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden snap-center group shadow-2xl">
                    <div className="aspect-square w-full bg-zinc-800 overflow-hidden relative">
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <p className="text-[10px] font-black tracking-widest text-white">SOLANA</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">Current Price</p>
                      <p className="text-2xl font-black tracking-tighter">{nft.price} SOL</p>
                    </div>
                  </div>
                ))}
                {(!data?.items || data.items.length === 0) && (
                   <div className="min-w-full py-20 text-center text-zinc-600 text-sm font-medium border border-dashed border-white/10 rounded-[2.5rem]">
                     No listings found at the moment
                   </div>
                )}
              </div>

              {/* STATS CARD */}
              <div className="bg-zinc-900/50 rounded-[2rem] p-6 border border-white/5 mb-8">
                 <div className="flex justify-between items-center mb-6">
                   <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">Collection Stats</span>
                   <span className="flex items-center gap-1.5 text-[9px] bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full font-black border border-green-500/20">
                     <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> LIVE
                   </span>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-black mb-1">Floor Price</p>
                      <p className="text-xl font-bold tracking-tight">{data?.floor?.toFixed(3)} SOL</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase font-black mb-1">Listed Items</p>
                      <p className="text-xl font-bold tracking-tight">{data?.listed || '0'}</p>
                    </div>
                 </div>
              </div>
            </>
          )}

          {/* MAIN MAGIC EDEN BUTTON */}
          <a 
            href="https://magiceden.io/marketplace/teft_supreme" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-white text-black rounded-2xl py-4.5 font-black flex items-center justify-center gap-2 mt-auto hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl text-sm"
          >
            BUY ON MAGIC EDEN <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
