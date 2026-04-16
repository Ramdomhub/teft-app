"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full p-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center fixed top-0 z-50">
      <div className="text-xl font-bold text-white tracking-tighter">
        TEFT <span className="text-blue-500">LEGION</span>
      </div>
      <div className="min-w-[150px] flex justify-end">
        {mounted && <WalletMultiButton />}
      </div>
    </nav>
  );
}
