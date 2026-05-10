"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

function fmt(n: number) {
  if (!n || n === 0) return "—";
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(2) + "K";
  return "$" + n.toFixed(2);
}

function pct(n: number) {
  const color = n >= 0 ? "#4ade80" : "#f87171";
  const sign = n >= 0 ? "+" : "";
  return <span style={{ color, fontWeight: 800 }}>{sign}{n.toFixed(2)}%</span>;
}

function StatBox({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div style={{ background: "#111", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{value}</div>
    </div>
  );
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

  const card = (children: React.ReactNode, border = "#1e1e1e", glow = "none") => (
    <div style={{ background: "#0d0d0d", border: `1px solid ${border}`, borderRadius: 16, padding: 20, boxShadow: glow }}>
      {children}
    </div>
  );

  const label = (text: string) => (
    <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>{text}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #111", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "#444", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← Back</Link>
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "0.08em" }}>TEFT TERMINAL</span>
          <span style={{ background: "#4ade8022", border: "1px solid #4ade8044", borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: "#4ade80", animation: "pulse 2s infinite" }}>LIVE</span>
        </div>
        <div style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>Updated: {lastUpdate}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ROW 1 — Price Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

          {/* TEFT */}
          {card(<>
            {label("$TEFT · SOLANA")}
            {loading ? <div style={{ color: "#333", fontSize: 12 }}>Loading...</div> : teft ? <>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#FFD700", marginBottom: 4, fontFamily: "monospace" }}>
                ${Number(teft.priceUsd || 0).toFixed(8)}
              </div>
              <div style={{ fontSize: 11, marginBottom: 16 }}>{pct(Number(teft.priceChange?.h24 || 0))} <span style={{ color: "#444" }}>24h</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <StatBox label="MCAP" value={fmt(teft.marketCap || teft.fdv || 0)} />
                <StatBox label="LIQUIDITY" value={fmt(teft.liquidity?.usd || 0)} />
                <StatBox label="VOL 24H" value={fmt(teft.volume?.h24 || 0)} />
                <StatBox label="VOL 1H" value={fmt(teft.volume?.h1 || 0)} />
              </div>
            </> : <div style={{ color: "#333", fontSize: 12 }}>No data</div>}
          </>, "#FFD70033", "0 0 20px #FFD70011")}

          {/* SOL */}
          {card(<>
            {label("SOLANA")}
            {sol ? <>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: "monospace" }}>${sol.usd.toFixed(2)}</div>
              <div style={{ fontSize: 11, marginBottom: 16 }}>{pct(sol.usd_24h_change)} <span style={{ color: "#444" }}>24h</span></div>
              <StatBox label="MCAP" value={fmt(sol.usd_market_cap)} />
            </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
          </>)}

          {/* BTC */}
          {card(<>
            {label("BITCOIN")}
            {btc ? <>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4, fontFamily: "monospace" }}>${btc.usd.toLocaleString()}</div>
              <div style={{ fontSize: 11, marginBottom: 16 }}>{pct(btc.usd_24h_change)} <span style={{ color: "#444" }}>24h</span></div>
              <StatBox label="MCAP" value={fmt(btc.usd_market_cap)} />
            </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
          </>)}
        </div>

        {/* ROW 2 — F&G + Links + Tools */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

          {/* Fear & Greed */}
          {card(<>
            {label("FEAR & GREED INDEX")}
            {fg ? <>
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: fgColor, lineHeight: 1, fontFamily: "monospace" }}>{fg.value}</div>
                <div style={{ fontSize: 11, color: fgColor, fontWeight: 800, marginTop: 8, letterSpacing: "0.1em" }}>{fg.value_classification?.toUpperCase()}</div>
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: 99, height: 5, marginTop: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${fg.value}%`, background: "linear-gradient(90deg, #f87171, #fb923c, #a3e635, #4ade80)", borderRadius: 99, transition: "width 1s ease" }} />
              </div>
            </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
          </>)}

          {/* Quick Links */}
          {card(<>
            {label("QUICK LINKS")}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Buy on Jupiter", url: `https://jup.ag/swap/SOL-${TEFT_MINT}?referral=7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere&feeBps=50` },
                { label: "DexScreener", url: `https://dexscreener.com/solana/${TEFT_MINT}` },
                { label: "X / Twitter", url: "https://x.com/TEFTofficial" },
                { label: "Telegram", url: "https://t.me/teftlegionofficial" },
                { label: "NFT Staking", url: "https://www.solsuite.io/teftsupreme" },
              ].map(({ label, url }) => (
                <a key={label} href={url} target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", borderRadius: 8, padding: "9px 12px", textDecoration: "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>{label}</span>
                  <span style={{ fontSize: 11, color: "#333", fontWeight: 900 }}>↗</span>
                </a>
              ))}
            </div>
          </>)}

          {/* TEFT Tools */}
          {card(<>
            {label("TEFT TOOLS")}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "TEFT Pulse", desc: "Smart wallet signals", url: "/pulse" },
                { label: "TEFT Identity", desc: "Your on-chain rank", url: "/identity" },
                { label: "NFT Marketplace", desc: "Get TEFT NFTs", url: "/nft-marketplace" },
              ].map(({ label, desc, url }) => (
                <Link key={label} href={url} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", borderRadius: 8, padding: "9px 12px", textDecoration: "none" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{label}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#333", fontWeight: 900 }}>→</span>
                </Link>
              ))}
            </div>
          </>)}
        </div>

        {/* ROW 3 — News */}
        {card(<>
          {label("CRYPTO NEWS")}
          {news.length === 0 ? (
            <div style={{ color: "#333", fontSize: 12 }}>Loading news...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {news.map((item, i) => (
                <a key={i} href={item.link} target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < news.length - 1 ? "1px solid #111" : "none", textDecoration: "none", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>{item.source} · {new Date(item.pubDate).toLocaleTimeString()}</div>
                  </div>
                  <span style={{ color: "#333", fontSize: 11, flexShrink: 0 }}>↗</span>
                </a>
              ))}
            </div>
          )}
        </>)}
      </div>
    </div>
  );
}
