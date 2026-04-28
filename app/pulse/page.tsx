"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Shield, ShieldCheck, Twitter, Globe } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Signal = {
  id: string;
  detected_at: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_image_url: string | null;
  amount_sol: number;
  dex_id: string | null;
  liquidity_usd: number | null;
  market_cap: number | null;
  dexscreener_url: string | null;
  wallet_address: string;
  wallet_label: string | null;
  wallet_count: number;
};

type ApiResponse = {
  signals: Signal[];
  updatedAt: string;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h`;
}

function formatUsd(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "k";
  return "$" + n.toFixed(0);
}

function signalBadge(count: number): { label: string; bg: string; color: string } {
  if (count >= 3) return { label: "Strong", bg: "#1a3a2a", color: "#4ade80" };
  if (count === 2) return { label: "Watch", bg: "#3a2a10", color: "#fbbf24" };
  return { label: "Weak", bg: "#1a1a1a", color: "#6b7280" };
}

function dexLabel(dexId: string | null): string {
  if (!dexId) return "DEX";
  if (dexId.includes("pump")) return "Pump.fun";
  if (dexId.includes("raydium")) return "Raydium";
  if (dexId.includes("orca")) return "Orca";
  return dexId;
}

// ─────────────────────────────────────────────
// Signal Card
// ─────────────────────────────────────────────

function SignalCard({ signal }: { signal: Signal }) {
  const badge = signalBadge(signal.wallet_count);

  return (
    <div style={{
      background: "#0d0d0d",
      border: "1px solid #1e1e1e",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 12,
    }}>
      {/* Card Header */}
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        {/* Token Image */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#1a1a1a", overflow: "hidden", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {signal.token_image_url ? (
            <img src={signal.token_image_url} alt={signal.token_symbol}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
          ) : (
            <span style={{ color: "#444", fontSize: 14, fontWeight: 800 }}>
              {signal.token_symbol?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Token Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              {signal.token_name}
            </span>
            <span style={{ color: "#444", fontSize: 11, fontWeight: 700 }}>
              {signal.token_symbol}
            </span>
          </div>
          <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>
            {dexLabel(signal.dex_id)} · {timeAgo(signal.detected_at)}
          </div>
        </div>

        {/* Signal Badge */}
        <div style={{
          background: badge.bg,
          borderRadius: 20,
          padding: "5px 12px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: badge.color, fontSize: 11, fontWeight: 900 }}>
            {badge.label}
          </span>
          <span style={{
            background: badge.color + "30",
            color: badge.color,
            borderRadius: "50%",
            width: 20, height: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900,
          }}>
            {signal.wallet_count * 10 + 60}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 1, background: "#111", margin: "0 16px",
        borderRadius: 12, overflow: "hidden",
      }}>
        {[
          { label: "Smart Wallets", value: `${signal.wallet_count}x` },
          { label: "Liquidity", value: formatUsd(signal.liquidity_usd) },
          { label: "MCap", value: formatUsd(signal.market_cap) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "#0d0d0d", padding: "10px 8px", textAlign: "center",
          }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {label}
            </div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 900, marginTop: 3 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Safety + Links */}
      <div style={{
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 8,
        flexWrap: "wrap",
      }}>
        <div style={{
          background: "#0a2a1a", borderRadius: 8,
          padding: "4px 10px", display: "flex", alignItems: "center", gap: 4,
        }}>
          <ShieldCheck size={10} color="#4ade80" />
          <span style={{ color: "#4ade80", fontSize: 9, fontWeight: 800 }}>
            Freeze: Clear
          </span>
        </div>
        {signal.dexscreener_url && (
          <a href={signal.dexscreener_url} target="_blank" rel="noopener noreferrer"
            style={{
              background: "#1a1a1a", borderRadius: 8,
              padding: "4px 10px", color: "#666",
              fontSize: 9, fontWeight: 800, textDecoration: "none",
            }}>
            CHART ↗
          </a>
        )}
      </div>

      {/* Buy Button */}
      <div style={{ padding: "0 16px 16px" }}>
        <button
          onClick={() => window.open('https://jup.ag/swap/SOL-' + signal.token_address, '_blank')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, width: '100%',
            background: '#fff', color: '#000',
            borderRadius: 14, padding: '13px',
            fontWeight: 900, fontSize: 13,
            letterSpacing: '0.1em', border: 'none',
            cursor: 'pointer', textTransform: 'uppercase',
          }}
        >
          Buy 0.1 SOL
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function PulsePage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [gateway, setGateway] = useState(false);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/signals");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      setSignals((data.signals || []).filter(s => s.token_symbol !== "USDC" && s.token_symbol !== "USDT"));
      setLastUpdate(data.updatedAt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 30_000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      fontFamily: "'Inter', -apple-system, sans-serif",
      maxWidth: 480,
      margin: "0 auto",
    }}>
      {/* Hero */}
      <div style={{
        position: "relative",
        height: 320,
        overflow: "hidden",
      }}>
        {/* Background Image */}
        <img src="/teft.png" alt="TEFT Pulse"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            opacity: 0.7,
          }}
        />
        {/* Gradient Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%)",
        }} />

        {/* Top Bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
            fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
          }}>
            <ArrowLeft size={12} strokeWidth={3} />
            BACK
          </Link>
          <div style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 9, fontWeight: 900,
            letterSpacing: "0.2em", color: "rgba(255,255,255,0.8)",
          }}>
            PRECISION MODE
          </div>
        </div>

        {/* Gateway Button */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <button
            onClick={() => setGateway(true)}
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 16,
              padding: "14px 32px",
              color: "#fff", fontSize: 14, fontWeight: 800,
              cursor: "pointer", letterSpacing: "0.05em",
            }}
          >
            Enter Gateway
          </button>
        </div>

        {/* Bottom Info */}
        <div style={{
          position: "absolute", bottom: 20, left: 20, right: 20,
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em" }}>
              TEFT Pulse
            </h1>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 }}>
              See what others don't.
            </p>
          </div>
          <button
            onClick={fetchSignals}
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: "8px 14px",
              display: "flex", alignItems: "center", gap: 6,
              color: "rgba(255,255,255,0.7)", fontSize: 10,
              fontWeight: 800, cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            <RefreshCw size={10} strokeWidth={3} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 80px" }}>

        {/* Status Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: loading ? "#444" : "#22c55e",
              boxShadow: loading ? "none" : "0 0 6px #22c55e",
            }} />
            <span style={{ color: "#555", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>
              {loading ? "SCANNING..." : `LIVE · ${signals.length} SIGNALS`}
            </span>
          </div>
          {lastUpdate && (
            <span style={{ color: "#333", fontSize: 10 }}>
              Updated {timeAgo(lastUpdate)}
            </span>
          )}
        </div>

        {/* Filter Bar */}
        <div style={{
          background: "#0d0d0d",
          border: "1px solid #1e1e1e",
          borderRadius: 14,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 10, color: "#444",
          fontWeight: 700,
          letterSpacing: "0.05em",
          lineHeight: 1.6,
        }}>
          Prime filter: smart wallets ≥ 2 · liquidity ≥ $1,500 · freeze clear
        </div>

        {/* Disclaimer */}
        <div style={{
          background: "#080808",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: "10px 14px",
          marginBottom: 16,
          color: "#333", fontSize: 10, lineHeight: 1.6,
        }}>
          ⚠️ High risk. Many tokens will fail. Not financial advice. DYOR.
        </div>

        {/* Signals */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: "#222", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em" }}>
              SCANNING SMART WALLETS...
            </div>
          </div>
        ) : signals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <div style={{ color: "#333", fontSize: 12, fontWeight: 800, letterSpacing: "0.2em" }}>
              NO SIGNALS RIGHT NOW
            </div>
            <div style={{ color: "#222", fontSize: 11, marginTop: 8 }}>
              Watching {24} smart wallets on-chain
            </div>
          </div>
        ) : (
          signals.map(signal => <SignalCard key={signal.id} signal={signal} />)
        )}
      </div>
    </main>
  );
}
