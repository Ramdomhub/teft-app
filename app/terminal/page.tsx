"use client";
import React, { useEffect, useState } from "react";

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


function Tooltip({ text }: { text: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, borderRadius: "50%",
          border: "1px solid #444", color: "#444", fontSize: 9,
          fontWeight: 900, cursor: "pointer", marginLeft: 4, flexShrink: 0,
        }}
      >!
      </span>
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)", background: "#1a1a1a",
          border: "1px solid #333", borderRadius: 8, padding: "8px 10px",
          fontSize: 10, color: "#ccc", whiteSpace: "nowrap", zIndex: 100,
          maxWidth: 220, whiteSpace: "normal", lineHeight: 1.4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}


export default function TerminalPage() {
  const [teft, setTeft] = useState<any>(null);
  const [sol, setSol] = useState<any>(null);
  const [btc, setBtc] = useState<any>(null);
  const [fg, setFg] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [holders, setHolders] = useState<number | null>(null);
  const [treasury, setTreasury] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState("");
  const [globalMcap, setGlobalMcap] = useState<any>(null);
  const [solTps, setSolTps] = useState<number | null>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [heatmapOpen, setHeatmapOpen] = useState(false);

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
        setTreasury(data.treasury || null);
        setHolders(data.holders || null);
        setGlobalMcap(data.globalMcap || null);

      } catch (e) { console.error(e); }
      finally {
        setLoading(false);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    }
    load();
    const interval = setInterval(load, 60_000);

    // Heatmap separat laden
    async function loadHeatmap() {
      try {
        const res = await fetch("/api/terminal/heatmap");
        const data = await res.json();
        setHeatmap(data.heatmap || []);
      } catch {}
    }
    loadHeatmap();
    const heatmapInterval = setInterval(loadHeatmap, 120_000);

    // TPS separat laden - alle 5 Minuten
    async function loadTps() {
      try {
        const res = await fetch("/api/terminal/tps");
        const data = await res.json();
        if (data.tps) setSolTps(data.tps);
      } catch {}
    }
    loadTps();
    const tpsInterval = setInterval(loadTps, 5 * 60 * 1000);

    return () => { clearInterval(interval); clearInterval(heatmapInterval); clearInterval(tpsInterval); };
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <img src="https://dd.dexscreener.com/ds-data/tokens/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump.png" alt="TEFT" style={{ width: 16, height: 16, borderRadius: "50%" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>$TEFT · SOLANA</div>
          </div>
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
            { label: "SOLANA", data: sol, color: "#fff", logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" },
            { label: "BITCOIN", data: btc, color: "#fff", logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
          ].map(({ label, data, color, logo }: any) => (
            <div key={label} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                {logo && <img src={logo} alt={label} style={{ width: 16, height: 16, borderRadius: "50%" }} />}
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>{label}</div>
              </div>
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

        {/* Global Market Cap */}
        {globalMcap && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🌐</span>
              <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>GLOBAL CRYPTO MARKET CAP</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{fmt(globalMcap.usd)}</div>
            <div style={{ fontSize: 11, marginBottom: 16 }}>{pct(globalMcap.change)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>BTC DOMINANCE</div>
                  <Tooltip text="Bitcoin's share of the total crypto market. Above 60% = Altcoins underperforming. Below 50% = Altcoin Season." />
                </div>
                  
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#f7931a", marginTop: 2 }}>{globalMcap.btcDominance?.toFixed(1)}%</div>
              </div>
              <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>SOL TPS</div>
                  <Tooltip text="Transactions per Second on Solana. Normal: 1000-3000 TPS. Above 4000 = network under load. Low = quiet market." />
                </div>
                  
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#9945ff", marginTop: 2 }}>{solTps ?? "—"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Fear & Greed */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>FEAR & GREED INDEX</div>
            <Tooltip text="Measures market sentiment from 0 (Extreme Fear) to 100 (Extreme Greed). Below 25 = potential buy zone. Above 75 = caution advised." />
          </div>
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

        {/* Treasury Card */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>TEFT TREASURY · NFT STAKING REWARDS</div>
          {treasury ? <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
              {[
                { label: "TREASURY BALANCE", value: (treasury.balance / 1_000_000).toFixed(1) + "M TEFT" },
                { label: "DAILY PER NFT", value: treasury.dailyDistribution + " TEFT" },
                { label: "DAYS REMAINING", value: treasury.balance > 0 ? Math.floor(treasury.balance / (treasury.dailyDistribution * 100)).toString() + "+ days" : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#0d0d0d", padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
            <a href="https://www.solsuite.io/teftsupreme" target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 14px", textDecoration: "none" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>Stake TEFT NFTs on Solsuite</div>
                <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>Earn 500 TEFT per NFT per day</div>
              </div>
              <span style={{ fontSize: 11, color: "#444" }}>↗</span>
            </a>
          </> : <div style={{ color: "#333", fontSize: 12 }}>Loading...</div>}
        </div>

        {/* Quick Links */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>QUICK LINKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Buy TEFT on Jupiter", url: `https://jup.ag/swap/SOL-8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump?referral=7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere&feeBps=50`, icon: "https://jup.ag/favicon.ico" },
              { label: "DexScreener Chart", url: `https://dexscreener.com/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump`, icon: "https://dexscreener.com/favicon.ico" },
              { label: "X / Twitter", url: "https://x.com/TEFTofficial", icon: "https://abs.twimg.com/favicons/twitter.3.ico" },
              { label: "Telegram", url: "https://t.me/teftlegionofficial", icon: "https://telegram.org/favicon.ico" },
              { label: "NFT Staking", url: "https://www.solsuite.io/teftsupreme", icon: "https://www.solsuite.io/favicon.ico" },
            ].map(({ label, url, icon }: any) => (
              <a key={label} href={url} target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 14px", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={icon} alt={label} style={{ width: 16, height: 16, borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>{label}</span>
                </div>
                <span style={{ fontSize: 11, color: "#444" }}>↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* Smart Money Heatmap - Coming Soon */}
        {false && (
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
            <div onClick={() => setHeatmapOpen(!heatmapOpen)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: heatmapOpen ? 16 : 0, cursor: "pointer" }}>
              <span style={{ fontSize: 16 }}>🧠</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>SMART MONEY HEATMAP · LAST 24H</div>
                <Tooltip text="Shows which tokens our 25 verified Smart Money wallets bought in the last 24h. More wallets (W) = stronger signal." />
              </div>
                
              </div>
            </div>
            {heatmapOpen && <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ background: "#f97316", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 900, color: "#000" }}>5W+</div>
                <span style={{ fontSize: 9, color: "#555" }}>HOT</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ background: "#eab308", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 900, color: "#000" }}>3W+</div>
                <span style={{ fontSize: 9, color: "#555" }}>WARM</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ background: "#4ade80", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 900, color: "#000" }}>1W+</div>
                <span style={{ fontSize: 9, color: "#555" }}>SIGNAL</span>
              </div>
              <span style={{ fontSize: 9, color: "#333", marginLeft: "auto" }}>🔒 Full details on Pulse →</span>
            </div>}
            
            {heatmapOpen && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                {heatmap.map((token: any) => {
                  const heat = token.wallet_count >= 5 ? "#f97316" : token.wallet_count >= 3 ? "#eab308" : "#4ade80";
                  const fmtVol = (v: number) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : `$${(v/1000).toFixed(0)}K`;
                  const h1Color = token.volume_h1 > 0 && token.volume_h6 > 0 ? (token.volume_h1 > token.volume_h6/6 ? "#4ade80" : "#f87171") : "#555";
                  return (
                    <a key={token.token_address} href={`https://dexscreener.com/solana/${token.token_address}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <div style={{ background: "#111", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ background: heat, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 900, color: "#000" }}>{token.wallet_count}W</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{token.token_symbol || token.token_name?.slice(0, 12) || "Unknown"}</div>
                            <div style={{ fontSize: 9, color: "#555", marginTop: 1 }}>{token.avg_win_rate ? `⚡ ${token.avg_win_rate}% win-rate` : ""}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{token.market_cap >= 1000000 ? `$${(token.market_cap/1000000).toFixed(1)}M` : `$${(token.market_cap/1000).toFixed(0)}K`}</div>
                          <div style={{ fontSize: 9, marginTop: 2, display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            {token.volume_m5 > 0 && <span style={{ color: "#555" }}>5m {fmtVol(token.volume_m5)}</span>}
                            {token.volume_h1 > 0 && <span style={{ color: h1Color }}>1h {fmtVol(token.volume_h1)}</span>}
                            {token.volume_24h > 0 && <span style={{ color: "#555" }}>24h {fmtVol(token.volume_24h)}</span>}
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TEFT Tools */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>TEFT TOOLS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "TEFT Pulse", desc: "Smart wallet signals", url: "/pulse", icon: "⚡" },
              { label: "TEFT Identity", desc: "Your on-chain rank", url: "/identity", icon: "🎖️" },
              { label: "Dust Remover", desc: "Recover SOL from empty accounts", url: "/terminal/dust", icon: "🧹" },
              { label: "Memo Sender", desc: "Send on-chain messages with SOL", url: "/terminal/memo", icon: "📨" },
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
