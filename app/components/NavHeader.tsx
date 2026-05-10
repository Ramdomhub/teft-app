"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NavHeader({ backHref = "/", maxWidth = 440 }: { backHref?: string; maxWidth?: number }) {
  return (
    <div style={{
      maxWidth, margin: "0 auto 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      width: "100%",
    }}>
      <Link href={backHref} style={{
        display: "flex", alignItems: "center", gap: 6,
        color: "rgba(255,255,255,0.7)", textDecoration: "none",
        fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
        transition: "color 0.2s",
      }}>
        <ArrowLeft size={12} strokeWidth={3} />
        BACK
      </Link>
      <WalletMultiButton style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: "5px 14px",
        fontSize: 9,
        fontWeight: 900,
        height: "auto",
        letterSpacing: "0.1em",
        color: "rgba(255,255,255,0.7)",
        lineHeight: 1.6,
      }}/>
    </div>
  );
}
