"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PulsePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/[0.01]">
        
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-zinc-400 text-[10px] font-black tracking-widest uppercase hover:text-black transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Back
          </Link>
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-300">
            Under Construction
          </span>
        </div>

        <div className="text-center py-16">
          <h1 className="text-4xl font-[900] tracking-tighter uppercase mb-4">
            TEFT Pulse
          </h1>
          <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-8">
            See what others don't.
          </p>
          <div className="inline-block bg-zinc-100 rounded-full px-6 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Coming Soon
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
