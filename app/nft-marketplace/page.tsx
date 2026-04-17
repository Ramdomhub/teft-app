"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

type NftItem = {
  address: string;
  name: string;
  image: string;
  price: number;
};

type NftResponse = {
  items: NftItem[];
  floor: number;
  listed: number;
};

const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/marketplace/teft_supreme";

function formatSol(value: number) {
  return Number.isFinite(value) ? `${value} SOL` : "—";
}

export default function Market() {
  const [data, setData] = useState<NftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMarket() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/nfts", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Marketplace-Daten konnten nicht geladen werden.");
      }

      const json = (await response.json()) as NftResponse;
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarket();
  }, []);

  const items = data?.items ?? [];
  const stats = useMemo(() => ({
    floor: data?.floor ?? 0,
    listed: data?.listed ?? items.length,
  }), [data, items.length]);

  return (
    <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 antialiased selection:bg-black selection:text-white font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[40px] p-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-black/[0.01]">
        <div className="px-5 pt-6 pb-6 flex flex-col min-h-[720px]">
          
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 text-[10px] font-black tracking-widest uppercase hover:text-black transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={3} />
              Back
            </Link>
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-300">
              Live Market
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-[1000] tracking-tighter text-black uppercase mb-2">
              Marketplace
            </h1>
            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
              Verified TEFT Supreme Collection
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-[24px] border border-zinc-100 bg-zinc-50/50 px-5 py-4">
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-2">
                Floor
              </p>
              <p className="text-xl font-[1000] text-black">
                {formatSol(stats.floor)}
              </p>
            </div>
            <div className="rounded-[24px] border border-zinc-100 bg-zinc-50/50 px-5 py-4">
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-2">
                Listed
              </p>
              <p className="text-xl font-[1000] text-black">{stats.listed}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-zinc-300">
                <Loader2 className="animate-spin" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest">Syncing...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center rounded-[32px] border border-zinc-100 bg-zinc-50/30 px-6 py-10">
              <p className="text-xs font-black uppercase mb-2">Unavailable</p>
              <p className="text-[11px] font-medium text-zinc-500 mb-6 leading-relaxed">{error}</p>
              <button
                onClick={loadMarket}
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition active:scale-95"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center rounded-[32px] border border-zinc-100 bg-zinc-50/30 px-6 py-10">
              <p className="text-xs font-black uppercase mb-2">No Listings</p>
              <p className="text-[11px] font-medium text-zinc-500 mb-6">Currently no TEFT NFTs on market.</p>
              <a
                href={MAGIC_EDEN_COLLECTION_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest"
              >
                Magic Eden <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-6 mb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((nft) => (
                  <div
                    key={nft.address}
                    className="min-w-[280px] rounded-[32px] overflow-hidden border border-zinc-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                  >
                    <div className="aspect-square bg-zinc-50">
                      <img
                        src={nft.image || "/teft.png"}
                        alt={nft.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/teft.png";
                        }}
                      />
                    </div>
                    <div className="px-6 py-5">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-2">
                        Price
                      </p>
                      <p className="text-[22px] font-[1000] text-black mb-1">
                        {formatSol(nft.price)}
                      </p>
                      <p className="text-[11px] font-bold text-zinc-400 truncate uppercase tracking-tight">
                        {nft.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={MAGIC_EDEN_COLLECTION_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-auto w-full h-[64px] rounded-[24px] bg-black text-white flex items-center justify-center gap-3 text-[11px] font-black tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
              >
                Buy on Magic Eden
                <ExternalLink size={16} strokeWidth={3} />
              </a>
            </>
          )}

          <div className="pt-8 text-center text-[9px] uppercase tracking-[0.3em] font-black text-zinc-200">
            Solana Blockchain
          </div>
        </div>
      </div>
    </main>
  );
}
