"use client";
import "./globals.css";

function FeedbackButton() {
  return (
    <a
      href="mailto:support@teftlegion.io?subject=Feedback%20TEFT%20Legion"
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, padding: "8px 14px", color: "#888", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
    >
      <span style={{ fontSize: 13 }}>💬</span> Feedback
    </a>
  );
}
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
        <meta property="og:image" content="https://teftlegion.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TEFT Legion" />
        <meta name="twitter:description" content="Token-gated tools for TEFT holders. Smart wallet signals, on-chain identity, and legion building on Solana." />
        <meta name="twitter:image" content="https://teftlegion.com/og.png" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <Script src="https://terminal.jup.ag/main-v3.js" strategy="afterInteractive" />
      </head>
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
        <FeedbackButton />
      </body>
    </html>
  );
}
