"use client";
import "./globals.css";
import AppWalletProvider from "./AppWalletProvider";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>TEFT Legion — See What Others Don't</title>
        <meta name="description" content="TEFT Legion — Token-gated tools for TEFT holders. Smart wallet signals, on-chain identity, and legion building on Solana." />
        <meta name="theme-color" content="#000000" />
        <meta property="og:title" content="TEFT Legion" />
        <meta property="og:description" content="Token-gated tools for TEFT holders. Smart wallet signals, on-chain identity, and legion building on Solana." />
        <meta property="og:url" content="https://teftlegion.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://teftlegion.com/og.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TEFT Legion" />
        <meta name="twitter:description" content="Token-gated tools for TEFT holders. Smart wallet signals, on-chain identity, and legion building on Solana." />
        <meta name="twitter:image" content="https://teftlegion.com/og.svg" />
        <link rel="icon" href="/favicon.ico" />
        <Script src="https://terminal.jup.ag/main-v3.js" strategy="afterInteractive" />
      </head>
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
