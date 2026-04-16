"use client";
import React, { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  // Erst wenn die Komponente im Browser gelandet ist (Mounted),
  // erlauben wir das Rendern des Wallet-Buttons.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-32 bg-zinc-100 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="wallet-btn-wrapper">
      <WalletMultiButton className="!bg-black !rounded-2xl !text-[12px] !font-bold !h-10 !px-5 transition-all hover:opacity-80" />
    </div>
  );
}
