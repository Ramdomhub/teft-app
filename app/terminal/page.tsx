"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

function fmt(n: number, decimals = 2) {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(decimals) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(decimals) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(decimals) + "K";
  return "$" + n.toFixed(decimals);
}

function pct(n: number) {
  const color = n >= 0 ? "#4ade80" : "#f87171";
  const sign = n >= 0 ? "+" : "";
  return <span style={{ color }}>{sign}{n.toFixed(2)}%</span>;
}

export default function TerminalPage() {
  const [teft, setTeft] = useState<any>(null);
  const [sol, setSol] = useState<any>(null);
  const [btc, setBtc] = useState<any>(null);
  const [fg, setFg] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/terminal");
        const data = await res.json();
        setTeft(data.teft);
        setSol(data.cg?.solana || null);
        setBtc(data.cg?.bitcoin || null);
        setFg(data.fg);
        setNews(data.news || []);
      } catch (e) { console.error(e); }
      finally {
        setLoading(false);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const fgValue = parseInt(fg?.value || "0");
  const fgColor = fgValue >= 75 ? "#4ade80" : fgValue >= 50 ? "#a3e635" : fgValue >= 25 ? "#fb923c" : "#f87171";

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #111", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#444", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← Back</Link>
          <div>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.1em" }}>TEFT TERMINAL</span>
            <span style={{ marginLeft: 8, background: "#4ade8022", border: "1px solid #4ade8044", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#4ade80" }}>LIVE</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#333" }}>Updated: {lastUpdate}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

        {/* TOP ROW — TEFT + Market */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>

          {/* TEFT Card */}
          <div style={{ gridColumn: "1", background: "#0d0d0d", border: "1px solid #FFD70033", borderRadius: 16, padding: 20, boxShadow: "0 0 20px #FFD70011" }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>$TEFT · SOLANA</div>
            {loading ? <div style={{ color: "#333", fontSize: 12 }}>Loading...</div> : teft ? <>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", marginBottom: 4 }}>
                ${Number(teft.priceUsd || 0).toFixed(8)}
              </div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>{pct(Number(teft.priceChange?.h24 || 0))} 24h</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "MCAP", value: fmt(teft.marketCap || 0) },
                  { label: "LIQUIDITY", value: fmt(teft.liquidity?.usd || 0) },
                  { label: "VOL 24H", value: fmt(teft.volume?.h24 || 0) },
                  { label: "VOL 1H", value: fmt(teft.volume?.h1 || 0) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
            </> : <div style={{ color: "#333", fontSize: 12 }}>No data</div>}
          </div>

          {/* SOL Card */}
          <div style={{ background: "#0d0d0d", border: "1px solid #9945ff33", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>SOLANA</div>
            {sol ? <>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#9945ff", marginBottom: 4 }}>${sol.usd.toFixed(2)}</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>{pct(sol.usd_24h_change)}</div>
              <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>MCAP</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginTop: 2 }}>{fmt(sol.usd_market_cap)}</div>
              </div>
            </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
          </div>

          {/* BTC Card */}
          <div style={{ background: "#0d0d0d", border: "1px solid #f7931a33", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>BITCOIN</div>
            {btc ? <>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#f7931a", marginBottom: 4 }}>${btc.usd.toLocaleString()}</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>{pct(btc.usd_24h_change)}</div>
              <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>MCAP</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginTop: 2 }}>{fmt(btc.usd_market_cap)}</div>
              </div>
            </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
          </div>
        </div>

        {/* SECOND ROW — Fear & Greed + Links + Buy */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>

          {/* Fear & Greed */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>FEAR & GREED INDEX</div>
            {fg ? <>
              <div style={{ fontSize: 52, fontWeight: 900, color: fgColor, lineHeight: 1 }}>{fg.value}</div>
              <div style={{ fontSize: 12, color: fgColor, fontWeight: 800, marginTop: 6, letterSpacing: "0.05em" }}>{fg.value_classification?.toUpperCase()}</div>
              <div style={{ background: "#111", borderRadius: 99, height: 6, marginTop: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${fg.value}%`, background: `linear-gradient(90deg, #f87171, #fb923c, #a3e635, #4ade80)`, borderRadius: 99 }} />
              </div>
            </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
          </div>

          {/* TEFT Links */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>QUICK LINKS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Buy on Jupiter", url: `https://jup.ag/swap/SOL-${TEFT_MINT}?referral=7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere&feeBps=50`, color: "#4ade80" },
                { label: "DexScreener", url: `https://dexscreener.com/solana/${TEFT_MINT}`, color: "#FFD700" },
                { label: "X / Twitter", url: "https://x.com/TEFTofficial", color: "#1d9bf0" },
                { label: "Telegram", url: "https://t.me/teftlegionofficial", color: "#2AABEE" },
                { label: "NFT Staking", url: "https://www.solsuite.io/teftsupreme", color: "#c084fc" },
              ].map(({ label, url, color }) => (
                <a key={label} href={url} target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", borderRadius: 8, padding: "8px 12px", textDecoration: "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{label}</span>
                  <span style={{ fontSize: 11, color, fontWeight: 900 }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* TEFT Tools */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>TEFT TOOLS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "TEFT Pulse", desc: "Smart wallet signals", url: "/pulse", color: "#FFD700" },
                { label: "TEFT Identity", desc: "Your on-chain rank", url: "/identity", color: "#c084fc" },
                { label: "NFT Marketplace", desc: "Get TEFT NFTs", url: "/nft-marketplace", color: "#4ade80" },
              ].map(({ label, desc, url, color }) => (
                <Link key={label} href={url} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", borderRadius: 8, padding: "8px 12px", textDecoration: "none" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color }}>{label}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color, fontWeight: 900 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* NEWS */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>CRYPTO NEWS · SOLANA</div>
          {news.length === 0 ? (
            <div style={{ color: "#333", fontSize: 12 }}>Loading news...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {news.map((item: any, i) => (
                <a key={i} href={item.link} target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", borderRadius: 8, padding: "10px 14px", textDecoration: "none", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>CoinDesk · {new Date(item.pubDate).toLocaleTimeString()}</div>
                  </div>
                  <span style={{ color: "#333", fontSize: 11, flexShrink: 0 }}>↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
