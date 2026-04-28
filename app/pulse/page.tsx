"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Zap, AlertTriangle } from "lucide-react";

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
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatSol(n: number): string {
  return n.toFixed(2) + " SOL";
}

function formatUsd(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}

function strengthLabel(count: number): { label: string; color: string } {
  if (count >= 3) return { label: "STRONG", color: "#22c55e" };
  if (count === 2) return { label: "WATCH", color: "#f59e0b" };
  return { label: "WEAK", color: "#6b7280" };
}

// ─────────────────────────────────────────────
// Signal Card
// ─────────────────────────────────────────────

function SignalCard({ signal }: { signal: Signal }) {
  const strength = strengthLabel(signal.wallet_count);
  const dexLabel = signal.dex_id?.replace("pumpfun", "Pump.fun").replace("raydium", "Raydium").replace("pumpswap", "PumpSwap") || "DEX";

  return (
    <div style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {signal.token_image_url ? (
          <img
            src={signal.token_image_url}
            alt={signal.token_symbol}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#222", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, color: "#666"
          }}>
            {signal.token_symbol?.slice(0, 2).toUpperCase() || "?"}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
              {signal.token_name}
            </span>
            <span style={{ color: "#555", fontSize: 11, fontWeight: 700 }}>
              {signal.token_symbol}
            </span>
          </div>
          <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>
            {dexLabel} · {timeAgo(signal.detected_at)}
          </div>
        </div>

        {/* Strength Badge */}
        <div style={{
          background: strength.color + "20",
          border: `1px solid ${strength.color}40`,
          borderRadius: 8,
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          <span style={{ color: strength.color, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em" }}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        {[
          { label: "SMART WALLETS", value: `${signal.wallet_count}x` },
          { label: "LIQUIDITY", value: formatUsd(signal.liquidity_usd) },
          { label: "MCAP", value: formatUsd(signal.market_cap) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "#0a0a0a",
            borderRadius: 10,
            padding: "8px 10px",
            textAlign: "center",
          }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>{label}</div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 800, marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Buy Button */}
      {signal.token_address && (
        
          href={`https://jup.ag/swap/SOL-${signal.token_address}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            background: "#fff",
            color: "#000",
            borderRadius: 12,
            padding: "12px",
            textAlign: "center",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.15em",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Buy on Jupiter ↗
        </a>
      )}

      {/* DexScreener Link */}
      {signal.dexscreener_url && (
        
          href={signal.dexscreener_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#444",
            fontSize: 10,
            textAlign: "center",
            textDecoration: "none",
            letterSpacing: "0.1em",
          }}
        >
          VIEW ON DEXSCREENER ↗
        </a>
      )}
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
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/signals");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      setSignals(data.signals || []);
      setLastUpdate(data.updatedAt);
      setError(null);
    } catch (e) {
      setError("Failed to load signals");
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
      fontFamily: "'Inter', sans-serif",
      padding: "0 0 80px 0",
    }}>
      {/* Hero */}
      <div style={{
        position: "relative",
        height: 220,
        background: "linear-gradient(180deg, #1a1a1a 0%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 20px 20px",
        overflow: "hidden",
      }}>
        {/* Back */}
        <Link href="/" style={{
          position: "absolute", top: 20, left: 20,
          display: "flex", alignItems: "center", gap: 6,
          color: "#666", textDecoration: "none", fontSize: 11,
          fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
        }}>
          <ArrowLeft size={12} strokeWidth={3} /> Back
        </Link>

        {/* Title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Zap size={20} color="#fff" strokeWidth={3} />
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
              TEFT Pulse
            </h1>
          </div>
          <p style={{ margin: 0, color: "#555", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" }}>
            SEE WHAT OTHERS DON'T.
          </p>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchSignals}
          style={{
            position: "absolute", top: 16, right: 20,
            background: "#111", border: "1px solid #222",
            borderRadius: 10, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 6,
            color: "#666", fontSize: 11, fontWeight: 800,
            letterSpacing: "0.1em", cursor: "pointer",
          }}
        >
          <RefreshCw size={11} strokeWidth={3} />
          REFRESH
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 0" }}>

        {/* Status Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: loading ? "#555" : "#22c55e",
            }} />
            <span style={{ color: "#444", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>
              {loading ? "LOADING..." : `LIVE · ${signals.length} SIGNALS`}
            </span>
          </div>
          {lastUpdate && (
            <span style={{ color: "#333", fontSize: 10 }}>
              Updated {timeAgo(lastUpdate)}
            </span>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 20,
        }}>
          <AlertTriangle size={12} color="#555" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ margin: 0, color: "#444", fontSize: 10, lineHeight: 1.5 }}>
            High risk. Many tokens will fail. This is not financial advice. DYOR before buying anything.
          </p>
        </div>

        {/* Signals */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em" }}>SCANNING...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
            <div style={{ fontSize: 12 }}>{error}</div>
          </div>
        ) : signals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ color: "#222", fontSize: 40, marginBottom: 16 }}>⚡</div>
            <div style={{ color: "#333", fontSize: 12, fontWeight: 800, letterSpacing: "0.2em" }}>
              NO SIGNALS YET
            </div>
            <div style={{ color: "#222", fontSize: 11, marginTop: 8 }}>
              Watching 24 smart wallets on-chain
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
