"use client";
import React from "react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";

export default function JoinCreator() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 antialiased font-sans">
      <Navigation />
      <div className="w-full max-w-[400px] bg-white rounded-[3rem] p-10 shadow-xl border border-black/[0.01] text-center">
        <h1 className="text-3xl font-[1000] tracking-tighter text-black uppercase mb-4">Apply</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          The Legion is currently at maximum capacity. Applications for new creators will reopen soon.
        </p>
        <Link href="/creator" className="inline-block bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
