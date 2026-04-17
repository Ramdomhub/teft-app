"use client";
import React from "react";
import Link from "next/link";

export default function CreatorHub() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center p-6 font-sans antialiased">
      <div className="max-w-[400px] w-full bg-white rounded-[2.5rem] p-10 shadow-xl text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Creator Hub</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          The central place for all TEFT Legions creators. Dashboard and tools are coming soon.
        </p>
        <Link href="/" className="inline-block bg-black text-white px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
          Back to Gateway
        </Link>
      </div>
    </div>
  );
}
