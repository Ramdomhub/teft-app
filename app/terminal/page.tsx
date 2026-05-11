"use client";
import { useEffect, useState } from "react";

function fmt(n: number) {
  if (!n || n === 0) return "—";
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(2) + "K";
  if (n >= 1) return "$" + n.toFixed(2);
  return "$" + n.toFixed(4);
}

function pct(n: number) {
  const color = n >= 0 ? "#4ade80" : "#f87171";
  const sign = n >= 0 ? "+" : "";
  return <span style={{ color, fontWeight: 800 }}>{sign}{n.toFixed(2)}%</span>;
}

export default function TerminalPage() {
  const [teft, setTeft] = useState<any>(null);
  const [sol, setSol] = useState<any>(null);
  const [btc, setBtc] = useState<any>(null);
  const [fg, setFg] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<number | null>(null);
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
        setHolders(data.holders || null);
        setHolders(data.holders || null);
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
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header — same as identity/pulse */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src="/teft.png" alt="TEFT" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 100%)" }} />
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#888", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← Back</a>
          <span style={{ background: "#4ade8022", border: "1px solid #4ade8044", borderRadius: 6, padding: "3px 10px", fontSize: 9, fontWeight: 800, color: "#4ade80", letterSpacing: "0.1em" }}>LIVE · {lastUpdate}</span>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>TEFT Terminal</h1>
          <p style={{ margin: "2px 0 0", color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>ALL SIGNALS. ONE SCREEN.</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* TEFT Card */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>$TEFT · SOLANA</div>
          {loading ? <div style={{ color: "#333", fontSize: 12 }}>Loading...</div> : teft ? <>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4 }}>${Number(teft.priceUsd || 0).toFixed(8)}</div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 16 }}>{pct(Number(teft.priceChange?.h24 || 0))} <span style={{ color: "#333" }}>24h change</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
              {[
                { label: "MCAP", value: fmt(teft.marketCap || teft.fdv || 0) },
                { label: "VOL 24H", value: fmt(teft.volume?.h24 || 0) },
                { label: "HOLDERS", value: holders ? holders.toString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#0d0d0d", padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
          </> : <div style={{ color: "#333", fontSize: 12 }}>No data</div>}
        </div>

        {/* SOL + BTC */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[
            { label: "SOLANA", data: sol, color: "#fff" },
            { label: "BITCOIN", data: btc, color: "#fff" },
          ].map(({ label, data, color }) => (
            <div key={label} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>{label}</div>
              {data ? <>
                <div style={{ fontSize: 20, fontWeight: 900, color, marginBottom: 4 }}>${data.usd.toLocaleString()}</div>
                <div style={{ fontSize: 11, marginBottom: 12 }}>{pct(data.usd_24h_change)}</div>
                <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>MCAP</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", marginTop: 2 }}>{fmt(data.usd_market_cap)}</div>
                </div>
              </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
            </div>
          ))}
        </div>

        {/* Fear & Greed */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>FEAR & GREED INDEX</div>
          {fg ? <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: fgColor, lineHeight: 1 }}>{fg.value}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: fgColor, letterSpacing: "0.05em" }}>{fg.value_classification?.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>Crypto market sentiment</div>
              </div>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 99, height: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${fg.value}%`, background: "linear-gradient(90deg, #f87171, #fb923c, #a3e635, #4ade80)", borderRadius: 99 }} />
            </div>
          </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
        </div>

        {/* Quick Links */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>QUICK LINKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Buy TEFT on Jupiter", url: `https://jup.ag/swap/SOL-8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump?referral=7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere&feeBps=50` },
              { label: "DexScreener Chart", url: `https://dexscreener.com/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump` },
              { label: "X / Twitter", url: "https://x.com/TEFTofficial" },
              { label: "Telegram", url: "https://t.me/teftlegionofficial" },
              { label: "NFT Staking", url: "https://www.solsuite.io/teftsupreme" },
            ].map(({ label, url }) => (
              <a key={label} href={url} target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 14px", textDecoration: "none" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>{label}</span>
                <span style={{ fontSize: 11, color: "#444" }}>↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* TEFT Tools */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>TEFT TOOLS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "TEFT Pulse", desc: "Smart wallet signals", url: "/pulse" },
              { label: "TEFT Identity", desc: "Your on-chain rank", url: "/identity" },
              { label: "Dust Remover", desc: "Recover SOL from empty accounts", url: "/terminal/dust" },
              { label: "Memo Sender", desc: "Send on-chain messages with SOL", url: "/terminal/memo" },
              { label: "NFT Marketplace", desc: "Get TEFT NFTs", url: "/nft-marketplace" },
            ].map(({ label, desc, url }) => (
              <a key={label} href={url} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 14px", textDecoration: "none" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{label}</div>
                  <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{desc}</div>
                </div>
                <span style={{ fontSize: 11, color: "#444" }}>→</span>
              </a>
            ))}
          </div>
        </div>

        {/* News */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>CRYPTO NEWS</div>
          {news.length === 0 ? (
            <div style={{ color: "#333", fontSize: 12 }}>Loading news...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {news.map((item, i) => (
                <a key={i} href={item.link} target="_blank" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: i < news.length - 1 ? "1px solid #111" : "none", textDecoration: "none", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{item.title}</div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>{item.source} · {new Date(item.pubDate).toLocaleTimeString()}</div>
                  </div>
                  <span style={{ color: "#333", fontSize: 11, flexShrink: 0, marginTop: 2 }}>↗</span>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
