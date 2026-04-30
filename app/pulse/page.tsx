"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

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
  entry_market_cap: number | null;
  current_market_cap: number | null;
  current_liquidity: number | null;
  volume_m5: number | null;
  volume_h1: number | null;
  volume_h6: number | null;
  price_change_m5: number | null;
  price_change_h1: number | null;
  buys_5m: number | null;
  sells_5m: number | null;
  multiplier: number | null;
  dexscreener_url: string | null;
  wallet_address: string;
  wallet_label: string | null;
  wallet_count: number;
  is_migrated?: boolean;
  is_dex_paid?: boolean;
  has_twitter?: boolean;
  has_telegram?: boolean;
  has_website?: boolean;
  twitter_url?: string | null;
  telegram_url?: string | null;
  website_url?: string | null;
  buys_1h?: number | null;
  sells_1h?: number | null;
  buy_sell_ratio_5m?: number | null;
  buy_sell_ratio_1h?: number | null;
  makers_5m?: number | null;
  makers_1h?: number | null;
  sell_count?: number;
  holders_count?: number;
  volume_h24?: number | null;
  price_change_24h?: number | null;
};

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const RPC = "https://api.mainnet-beta.solana.com";

// ── Disclaimer Modal ──────────────────────────────────────────
function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#111", border: "1px solid #333", borderRadius: 16,
        padding: 32, maxWidth: 480, width: "100%",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
          Risk Disclaimer
        </h2>
        <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
          TEFT Pulse zeigt Aktivitäten von Smart Wallets — <strong style={{color:"#fff"}}>kein Finanzrat</strong>. 
          Trading mit Meme Coins ist hochriskant und kann zum Totalverlust führen.
        </p>
        <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
          Signale sind <strong style={{color:"#fff"}}>keine Kaufempfehlungen</strong>. 
          DYOR. Investiere nur was du bereit bist zu verlieren.
        </p>
        <p style={{ color: "#666", fontSize: 12, lineHeight: 1.6, marginBottom: 24 }}>
          Tokens auf Jupiter können mit "2 Warnings" markiert sein — das bedeutet der Token 
          ist nicht verifiziert. Prüfe immer die Contract Address bevor du kaufst.
        </p>
        <button
          onClick={onAccept}
          style={{
            width: "100%", background: "#4ade80", color: "#000",
            border: "none", borderRadius: 10, padding: "14px 0",
            fontSize: 15, fontWeight: 800, cursor: "pointer",
          }}
        >
          Verstanden — Pulse öffnen
        </button>
      </div>
    </div>
  );
}

// ── Token Gate ────────────────────────────────────────────────
function TokenGate({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) { setHasAccess(false); setChecked(false); return; }
    setChecking(true);
    const conn = new Connection(RPC);
    conn.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(TEFT_MINT) })
      .then(res => {
        const amount = res.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
        setHasAccess(amount >= 1);
        setChecked(true);
      })
      .catch(() => { setHasAccess(false); setChecked(true); })
      .finally(() => setChecking(false));
  }, [connected, publicKey]);

  if (!connected) return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>TEFT Pulse</h2>
      <p style={{ color: "#888", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
        Verbinde dein Wallet um zu prüfen ob du TEFT hältst.
      </p>
      <WalletMultiButton />
    </div>
  );

  if (checking) return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <p style={{ color: "#888" }}>Prüfe TEFT Balance...</p>
    </div>
  );

  if (checked && !hasAccess) return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>Kein Zugang</h2>
      <p style={{ color: "#888", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
        Du benötigst mindestens <strong style={{color:"#fff"}}>1 TEFT</strong> um Pulse zu nutzen.
      </p>
      <a
        href={`https://jup.ag/swap/SOL-${TEFT_MINT}`}
        target="_blank"
        style={{
          background: "#4ade80", color: "#000", borderRadius: 10,
          padding: "12px 28px", fontWeight: 800, fontSize: 14,
          textDecoration: "none",
        }}
      >
        TEFT kaufen
      </a>
      <WalletMultiButton />
    </div>
  );

  return <>{children}</>;
}

// ── Legend Modal ──────────────────────────────────────────────
function LegendModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: "#111", border: "1px solid #333", borderRadius: 16,
        padding: 28, maxWidth: 480, width: "100%",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Legende & Erklärung</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {[
          { label: "🟢 Strong", desc: "≥3 Smart Wallets haben diesen Token gekauft" },
          { label: "🟡 Watch", desc: "2 Smart Wallets haben gekauft — beobachten" },
          { label: "⚫ Weak", desc: "1 Smart Wallet — schwaches Signal" },
          { label: "💀 Rugged", desc: "Liquidität unter $1.500 — Token vermutlich gerugged" },
          { label: "B/S Ratio", desc: "Käufe ÷ Verkäufe. >2x = starke Kaufaktivität" },
          { label: "MCap", desc: "Aktuelle Market Capitalization des Tokens" },
          { label: "Vol", desc: "Handelsvolumen in den letzten 5min / 1h" },
          { label: "Multiplier", desc: "Preisentwicklung seit Signal-Erkennung" },
          { label: "Smart Wallet", desc: "Wallet mit nachgewiesener Trading-Performance" },
        ].map(({ label, desc }) => (
          <div key={label} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #222" }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{label}</div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{desc}</div>
          </div>
        ))}

        <p style={{ color: "#555", fontSize: 11, marginTop: 8 }}>
          ⚠️ Kein Finanzrat. DYOR. Nur für Infozwecke.
        </p>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h`;
}

function formatUsd(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "k";
  return "$" + n.toFixed(0);
}

function formatPct(n: number | null): string {
  if (n === null || n === undefined) return "—";
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(1) + "%";
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

function MultiplierBadge({ multiplier }: { multiplier: number | null }) {
  if (!multiplier) return null;
  const isUp = multiplier >= 1;
  const color = isUp ? "#4ade80" : "#f87171";
  const bg = isUp ? "#0a2a1a" : "#2a0a0a";
  const label = multiplier >= 1
    ? `${multiplier.toFixed(2)}x`
    : `-${((1 - multiplier) * 100).toFixed(0)}%`;

  return (
    <span style={{
      background: bg, color, borderRadius: 6,
      padding: "2px 7px", fontSize: 11, fontWeight: 900,
    }}>
      {label}
    </span>
  );
}

function openJupiter(tokenAddress: string, amount: number) {
  const referrer = "7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere";
  window.open(`https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=${tokenAddress}&amount=${amount}&referral=${referrer}&feeBps=50`, "_blank");
}

function ShareLink({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      {children}
    </a>
  );
}

function buildShareUrl(signal: Signal): string {
  const base = "https://teftlegion.com/pulse";
  const params = new URLSearchParams({
    name: signal.token_name || "",
    symbol: signal.token_symbol || "",
    w: String(signal.wallet_count),
    ...(signal.multiplier ? { mx: signal.multiplier.toFixed(2) } : {}),
    ...(signal.entry_market_cap ? { em: formatUsd(signal.entry_market_cap) } : {}),
    ...(signal.current_market_cap ? { cm: formatUsd(signal.current_market_cap) } : {}),
    ...(signal.volume_h24 ? { v24: formatUsd(signal.volume_h24) } : {}),
    ...(signal.buy_sell_ratio_1h ? { bs: String(signal.buy_sell_ratio_1h) } : {}),
    ...(signal.token_image_url ? { img: signal.token_image_url } : {}),
  });
  return `https://teftlegion.com/api/og/${signal.token_address}?${params.toString()}`;
}

function buildTweetUrl(signal: Signal): string {
  const multiplierStr = signal.multiplier ? `+${((signal.multiplier - 1) * 100).toFixed(0)}%` : "";
  const tweetParams = new URLSearchParams({
    name: signal.token_name || "",
    symbol: signal.token_symbol || "",
    w: String(signal.wallet_count),
    ...(signal.multiplier ? { mx: signal.multiplier.toFixed(2) } : {}),
    ...(signal.entry_market_cap ? { em: formatUsd(signal.entry_market_cap) } : {}),
    ...(signal.current_market_cap ? { cm: formatUsd(signal.current_market_cap) } : {}),
    ...(signal.volume_h24 ? { v24: formatUsd(signal.volume_h24) } : {}),
    ...(signal.buy_sell_ratio_1h ? { bs: String(signal.buy_sell_ratio_1h) } : {}),
  });
  const signalUrl = `https://teftlegion.com/pulse/signal/${signal.token_address}?${tweetParams.toString()}`;
  const text = `⚡ TEFT Pulse Signal\n\n${signal.token_name} (${signal.token_symbol}) ${multiplierStr} | ${signal.wallet_count}x Smart Wallets bought\nEntry MCap: ${formatUsd(signal.entry_market_cap)} → Now: ${formatUsd(signal.current_market_cap)}\n\nSee what others don't 👇\n\n#Solana #TEFTPulse`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(signalUrl)}`;
}

function SignalCard({ signal }: { signal: Signal }) {
  const isRugged = signal.multiplier !== null && signal.multiplier < 0.4;
  const badge = isRugged 
    ? { label: 'RUGGED', bg: '#2a0a0a', color: '#f87171' }
    : signalBadge(signal.wallet_count);
  const showScore = !isRugged;
  const mcapUp = signal.current_market_cap && signal.entry_market_cap
    ? signal.current_market_cap >= signal.entry_market_cap
    : null;

  return (
    <div style={{
      background: "#0d0d0d", border: isRugged ? "1px solid #5a1a1a" : "1px solid #1e1e1e",
      borderRadius: 20, overflow: "hidden", marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#1a1a1a", overflow: "hidden", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {signal.token_image_url ? (
            <img src={signal.token_image_url} alt={signal.token_symbol}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#444", fontSize: 14, fontWeight: 800 }}>
              {signal.token_symbol?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
              {signal.token_name}
            </span>
            <span style={{ color: "#444", fontSize: 10, fontWeight: 700 }}>
              {signal.token_symbol}
            </span>
            <MultiplierBadge multiplier={signal.multiplier} />
          </div>
          <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>
            {dexLabel(signal.dex_id)} · {timeAgo(signal.detected_at)}
          </div>
        </div>

        <div style={{
          background: badge.bg, borderRadius: 20,
          padding: "5px 12px", display: "flex", alignItems: "center", gap: 6,
          flexShrink: 0,
        }}>
          <span style={{ color: badge.color, fontSize: 11, fontWeight: 900 }}>
            {badge.label}
          </span>
          <span style={{
            background: badge.color + "30", color: badge.color,
            borderRadius: "50%", width: 20, height: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900,
          }}>
            {[3,4,5,6,7,8,9,10].includes(signal.wallet_count) ? [60,70,78,84,88,92,96,100][signal.wallet_count-3] : signal.wallet_count > 10 ? 100 : 50}
          </span>
        </div>
      </div>

      {/* MCap Row: Entry vs Current */}
      <div style={{
        margin: "0 16px 10px",
        background: "#111", borderRadius: 12,
        padding: "10px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
            MCAP AT SIGNAL
          </div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 900, marginTop: 2 }}>
            {formatUsd(signal.entry_market_cap || signal.market_cap)}
          </div>
        </div>
        <div style={{ color: "#333", fontSize: 16 }}>→</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
            CURRENT MCAP
          </div>
          <div style={{
            color: mcapUp === null ? "#fff" : mcapUp ? "#4ade80" : "#f87171",
            fontSize: 14, fontWeight: 900, marginTop: 2,
          }}>
            {formatUsd(signal.current_market_cap)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 1, background: "#111",
        margin: "0 16px 10px", borderRadius: 12, overflow: "hidden",
      }}>
        {[
          { label: "Bought", value: `${signal.wallet_count}x`, color: "#fff" },
          { label: "Sold", value: signal.sell_count !== undefined ? `${signal.sell_count}x` : "0x", color: signal.sell_count && signal.sell_count > 0 ? "#f87171" : "#666" },
          { label: "Holding", value: signal.holders_count !== undefined ? `${signal.holders_count}x` : `${signal.wallet_count}x`, color: "#4ade80" },
          { label: "Liquidity", value: formatUsd(signal.current_liquidity || signal.liquidity_usd), color: "#fff" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "#0d0d0d", padding: "10px 8px", textAlign: "center",
          }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {label}
            </div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 900, marginTop: 3 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Volume Row */}
      <div style={{
        margin: "0 16px 10px",
        background: "#111", borderRadius: 12,
        padding: "10px 14px",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 6,
      }}>
        {[
          { label: "Vol 5m", value: formatUsd(signal.volume_m5), pct: signal.price_change_m5 },
          { label: "Vol 1h", value: formatUsd(signal.volume_h1), pct: signal.price_change_h1 },
          { label: "Vol 6h", value: formatUsd(signal.volume_h6), pct: null },
          { label: "Vol 24h", value: formatUsd(signal.volume_h24 ?? null), pct: signal.price_change_24h ?? null },
        ].map(({ label, value, pct }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
              {label}
            </div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, marginTop: 2 }}>
              {value}
            </div>
            {pct !== null && pct !== undefined && (
              <div style={{
                color: pct >= 0 ? "#4ade80" : "#f87171",
                fontSize: 10, fontWeight: 800,
              }}>
                {formatPct(pct)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Row: Socials + Badges */}
      <div style={{
        padding: "0 16px 10px",
        display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
      }}>
        {signal.is_migrated && (
          <div style={{ background: "#1a1a3a", borderRadius: 8, padding: "4px 10px" }}>
            <span style={{ color: "#60a5fa", fontSize: 9, fontWeight: 800 }}>MIGRATED</span>
          </div>
        )}
        {signal.is_dex_paid && (
          <div style={{ background: "#2a1a3a", borderRadius: 8, padding: "4px 10px" }}>
            <span style={{ color: "#c084fc", fontSize: 9, fontWeight: 800 }}>DEX PAID</span>
          </div>
        )}
        {signal.has_twitter && signal.twitter_url && (
          <a href={signal.twitter_url} target="_blank" rel="noopener noreferrer"
            style={{ background: "#1a1a2a", borderRadius: 8, padding: "4px 10px", textDecoration: "none" }}>
            <span style={{ color: "#60a5fa", fontSize: 9, fontWeight: 800 }}>X</span>
          </a>
        )}
        {signal.has_telegram && signal.telegram_url && (
          <a href={signal.telegram_url} target="_blank" rel="noopener noreferrer"
            style={{ background: "#1a2a3a", borderRadius: 8, padding: "4px 10px", textDecoration: "none" }}>
            <span style={{ color: "#38bdf8", fontSize: 9, fontWeight: 800 }}>TG</span>
          </a>
        )}
        {signal.has_website && signal.website_url && (
          <a href={signal.website_url} target="_blank" rel="noopener noreferrer"
            style={{ background: "#1a1a1a", borderRadius: 8, padding: "4px 10px", textDecoration: "none" }}>
            <span style={{ color: "#888", fontSize: 9, fontWeight: 800 }}>WEB</span>
          </a>
        )}
        {signal.dexscreener_url && (
          <a href={signal.dexscreener_url} target="_blank" rel="noopener noreferrer"
            style={{ background: "#1a1a1a", borderRadius: 8, padding: "4px 10px", textDecoration: "none" }}>
            <span style={{ color: "#666", fontSize: 9, fontWeight: 800 }}>CHART</span>
          </a>
        )}
      </div>

      {/* Buy/Sell Ratio Row */}
      <div style={{
        margin: "0 16px 10px",
        background: "#111", borderRadius: 12,
        padding: "10px 14px",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        {[
          {
            label: "B/S 5m",
            value: signal.buy_sell_ratio_5m ? signal.buy_sell_ratio_5m + "x" : "—",
            color: signal.buy_sell_ratio_5m && signal.buy_sell_ratio_5m >= 2 ? "#4ade80" :
                   signal.buy_sell_ratio_5m && signal.buy_sell_ratio_5m < 1 ? "#f87171" : "#fff"
          },
          {
            label: "B/S 1h",
            value: signal.buy_sell_ratio_1h ? signal.buy_sell_ratio_1h + "x" : "—",
            color: signal.buy_sell_ratio_1h && signal.buy_sell_ratio_1h >= 2 ? "#4ade80" :
                   signal.buy_sell_ratio_1h && signal.buy_sell_ratio_1h < 1 ? "#f87171" : "#fff"
          },
          {
            label: "Makers 5m",
            value: signal.makers_5m ? signal.makers_5m.toString() : "—",
            color: "#fff"
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "#444", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
              {label}
            </div>
            <div style={{ color, fontSize: 13, fontWeight: 900, marginTop: 3 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Share Button */}
      <div style={{ padding: "0 16px 8px" }}>
        <ShareLink
          href={buildTweetUrl(signal)}
          style={{
            display: "block", textAlign: "center",
            background: "transparent",
            border: "1px solid #1e3a5f", borderRadius: 12,
            padding: "10px", color: "#60a5fa",
            fontSize: 10, fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase", textDecoration: "none",
          }}
        >
          Share Signal on X
        </ShareLink>
      </div>

      {/* Buy Buttons */}
      <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
        {["0.01", "0.05", "0.1"].map((amount) => (
          <button
            key={amount}
            onClick={() => openJupiter(signal.token_address, amount)}
            style={{
              flex: 1,
              background: amount === "0.1" ? "#fff" : "#1a1a1a",
              color: amount === "0.1" ? "#000" : "#fff",
              border: amount === "0.1" ? "none" : "1px solid #333",
              borderRadius: 12, padding: "12px 4px",
              fontWeight: 900, fontSize: 11,
              letterSpacing: "0.05em", cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {amount} SOL
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PulsePage() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('teft_disclaimer_accepted');
  });
  const [showLegend, setShowLegend] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [showWeak, setShowWeak] = useState(false);
  const [showWatch, setShowWatch] = useState(false);
  const [showRugged, setShowRugged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSignals = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch("/api/signals", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSignals(data.signals || []);
      setLastUpdate(data.updatedAt);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    intervalRef.current = setInterval(() => fetchSignals(), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchSignals]);

  const handleRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    fetchSignals(true);
    intervalRef.current = setInterval(() => fetchSignals(), 30_000);
  };

  return (
    <TokenGate>
    {showDisclaimer && (
      <DisclaimerModal onAccept={() => {
        localStorage.setItem('teft_disclaimer_accepted', '1');
        setShowDisclaimer(false);
      }} />
    )}
    {showLegend && <LegendModal onClose={() => setShowLegend(false)} />}
    <main style={{
      minHeight: "100vh", background: "#000", color: "#fff",
      fontFamily: "'Inter', -apple-system, sans-serif",
      maxWidth: 480, margin: "0 auto",
    }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <img src="/teft.png" alt="TEFT Pulse" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center top", opacity: 0.7,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%)",
        }} />

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
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20,
            padding: "5px 14px", fontSize: 9, fontWeight: 900,
            letterSpacing: "0.2em", color: "rgba(255,255,255,0.8)",
          }}>
            PRECISION MODE
          </div>
        </div>

        <div style={{
          position: "absolute", top: "45%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <button style={{
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16,
            padding: "14px 32px", color: "#fff", fontSize: 14, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.05em",
          }}>
            Enter Gateway
          </button>
        </div>

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
          <button onClick={handleRefresh} style={{
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
            padding: "8px 14px", display: "flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.7)", fontSize: 10,
            fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em",
          }}>
            <button
              onClick={() => setShowLegend(true)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none",
                borderRadius: 8, padding: "6px 12px", color: "#fff",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              ? Legende
            </button>
            <RefreshCw size={10} strokeWidth={3}
              style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            {refreshing ? "LOADING..." : "REFRESH"}
          </button>
        </div>
      </div>

      {/* CSS for spin */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Content */}
      <div style={{ padding: "16px 16px 80px" }}>
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
              {loading ? "SCANNING..." : `LIVE · ${signals.filter(s => s.wallet_count >= 3 && !(
    (s.multiplier !== null && s.multiplier !== undefined && s.multiplier < 0.4) ||
    (s.current_market_cap !== null && s.current_market_cap !== undefined && s.current_market_cap < 5000) ||
    (s.current_liquidity !== null && s.current_liquidity !== undefined && s.current_liquidity < 500)
  )).length} SIGNALS`}
            </span>
          </div>
          {lastUpdate && (
            <span style={{ color: "#333", fontSize: 10 }}>
              Auto-refresh 30s
            </span>
          )}
        </div>

        <div style={{
          background: "#0d0d0d", border: "1px solid #1e1e1e",
          borderRadius: 14, padding: "10px 14px", marginBottom: 16,
          fontSize: 10, color: "#444", fontWeight: 700, letterSpacing: "0.05em",
        }}>
          Smart wallets ≥ 2 · liquidity ≥ $1,500 · freeze clear · signals expire after 2h
        </div>

        <div style={{
          background: "#080808", border: "1px solid #1a1a1a",
          borderRadius: 12, padding: "10px 14px", marginBottom: 16,
          color: "#333", fontSize: 10, lineHeight: 1.6,
        }}>
          High risk. Many tokens will fail. Not financial advice. DYOR.
        </div>

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
              Watching 24 smart wallets on-chain
            </div>
          </div>
        ) : (() => {
          const rugged = signals.filter(s => 
    (s.multiplier !== null && s.multiplier !== undefined && s.multiplier < 0.4) ||
    (s.current_market_cap !== null && s.current_market_cap !== undefined && s.current_market_cap < 5000) ||
    (s.current_liquidity !== null && s.current_liquidity !== undefined && s.current_liquidity < 500)
  );
          const ruggedAddresses = new Set(rugged.map(s => s.token_address));
          const active = signals.filter(s => !ruggedAddresses.has(s.token_address));
          const strong = active.filter(s => s.wallet_count >= 3);
          const watch = active.filter(s => s.wallet_count === 2);
          const weak = active.filter(s => s.wallet_count < 2);
          return (
            <>
              {strong.length === 0 && !showWeak && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
                  <div style={{ color: "#333", fontSize: 12, fontWeight: 800, letterSpacing: "0.2em" }}>
                    NO STRONG SIGNALS RIGHT NOW
                  </div>
                  <div style={{ color: "#222", fontSize: 11, marginTop: 8 }}>
                    Watching 24 smart wallets — waiting for 2+ to agree
                  </div>
                </div>
              )}
              {strong.map(signal => <SignalCard key={signal.id} signal={signal} />)}
              {watch.length > 0 && (
                <>
                  <button
                    onClick={() => setShowWatch(!showWatch)}
                    style={{
                      width: "100%", background: "transparent",
                      border: "1px solid #3a2a10", borderRadius: 12,
                      padding: "12px", color: "#fbbf24",
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: "0.1em", cursor: "pointer",
                      marginTop: 8,
                    }}
                  >
                    {showWatch ? "HIDE" : "SHOW"} {watch.length} WATCH SIGNAL{watch.length > 1 ? "S" : ""} (2x wallets)
                  </button>
                  {showWatch && watch.map(signal => <SignalCard key={signal.id} signal={signal} />)}
                </>
              )}
              {rugged.length > 0 && (
                <>
                  <button
                    onClick={() => setShowRugged(!showRugged)}
                    style={{
                      width: "100%", background: "transparent",
                      border: "1px solid #3a1a1a", borderRadius: 12,
                      padding: "12px", color: "#f87171",
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: "0.1em", cursor: "pointer",
                      marginTop: 8,
                    }}
                  >
                    {showRugged ? "HIDE" : "SHOW"} {rugged.length} RUGGED TOKEN{rugged.length > 1 ? "S" : ""}
                  </button>
                  {showRugged && rugged.map(signal => <SignalCard key={signal.id} signal={signal} />)}
                </>
              )}
              {weak.length > 0 && (
                <button
                  onClick={() => setShowWeak(!showWeak)}
                  style={{
                    width: "100%", background: "transparent",
                    border: "1px solid #222", borderRadius: 12,
                    padding: "12px", color: "#444",
                    fontSize: 10, fontWeight: 800,
                    letterSpacing: "0.1em", cursor: "pointer",
                    marginTop: 8,
                  }}
                >
                  {showWeak ? "HIDE" : "SHOW"} {weak.length} WEAK SIGNAL{weak.length > 1 ? "S" : ""} (1x wallet)
                </button>
              )}
              {showWeak && weak.map(signal => <SignalCard key={signal.id} signal={signal} />)}
            </>
          );
        })()}
      </div>
    {/* Jupiter Terminal Mount Point */}
      <div id="jupiter-terminal" />
        </main>
    </TokenGate>
  );
}
