"use client";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WalletButton } from "../Providers";

export default function Navigation() {
  const { publicKey } = useWallet();
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (publicKey) {
      supabase.from("creators")
        .select("id")
        .eq("wallet_address", publicKey.toBase58())
        .single()
        .then(({ data }) => setIsCreator(!!data));
    } else {
      setIsCreator(false);
    }
  }, [publicKey]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f5f5f7]/80 backdrop-blur-md border-b border-black/[0.03]">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="font-black text-2xl tracking-tighter uppercase">
            THE LEGION
          </Link>
          <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-400">
            <Link href="/creators" className="hover:text-black transition-colors">Leaderboard</Link>
            {isCreator && (
              <Link href="/creators/dashboard" className="hover:text-black transition-colors">Profile</Link>
            )}
            <a href="mailto:support@teftlegion.io" className="hover:text-black transition-colors">Feedback</a>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/creators/join" className="text-[11px] font-black uppercase tracking-widest text-black hover:opacity-60 transition-all">
            Join
          </Link>
          <div className="scale-90 origin-right">
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
