"use client";
import React, { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { SolanaMobileWalletAdapter, createDefaultAuthorizationResultCache, createDefaultAddressSelector } from "@solana-mobile/wallet-adapter-mobile";
import { clusterApiUrl } from "@solana/web3.js";
import { SessionProvider } from "next-auth/react";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
    [network]
  );

  const wallets = useMemo(() => {
    const list = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
    try {
      list.unshift(new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: "TEFT Legion",
          uri: "https://teftlegion.com",
          icon: "/favicon.ico",
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: network,
      }));
    } catch {}
    return list;
  }, [network]);

  return (
    <SessionProvider>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </SessionProvider>
  );
}

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-10 w-32 bg-zinc-100 animate-pulse rounded-2xl" />;
  return (
    <div className="wallet-btn-wrapper">
      <WalletMultiButton className="!bg-black !rounded-2xl !text-[12px] !font-bold !h-10 !px-5 transition-all hover:opacity-80" />
    </div>
  );
}
