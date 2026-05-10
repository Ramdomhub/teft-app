import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TIER_COLORS: Record<string, { color: string; border: string; glow: string; bg: string }> = {
  gold:   { color: "#FFD700", border: "#FFD700", glow: "#FFD70066", bg: "#1a1400" },
  silver: { color: "#C0C0C0", border: "#C0C0C0", glow: "#C0C0C066", bg: "#141414" },
  bronze: { color: "#cd7f32", border: "#cd7f32", glow: "#cd7f3266", bg: "#1a1100" },
  white:  { color: "#e2e8f0", border: "#ffffff33", glow: "transparent", bg: "#111318" },
};

const RANKS = [
  { name: "SHADOWCORE", min: 1,          tier: "white",  tagline: "Not visible. Still present.",          badge: "○" },
  { name: "IRONVEIL",   min: 5_000_000,  tier: "white",  tagline: "Steel without noise.",                 badge: "○" },
  { name: "TITANCORE",  min: 10_000_000, tier: "white",  tagline: "Weight becomes power.",                badge: "○" },
  { name: "VOIDWALKER", min: 20_000_000, tier: "bronze", tagline: "They walk where signals disappear.",   badge: "◈" },
  { name: "ASCENDANT",  min: 30_000_000, tier: "silver", tagline: "No longer followers. No longer human.", badge: "◈" },
  { name: "NULLCORE",   min: 40_000_000, tier: "gold",   tagline: "The center of inevitability.",         badge: "◆" },
];

function getRank(balance: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (balance >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

function formatBalance(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") || "";
  const balance = parseFloat(searchParams.get("balance") || "0");
  const power = parseFloat(searchParams.get("power") || "0");
  const xHandle = searchParams.get("x") || "";
  const referrals = parseInt(searchParams.get("refs") || "0");

  const rank = getRank(balance);
  const tc = TIER_COLORS[rank.tier];
  const shortWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-6)}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#000",
          display: "flex",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: 0, right: 0,
          width: "600px", height: "600px",
          background: `radial-gradient(circle at 100% 0%, ${tc.glow} 0%, transparent 60%)`,
          display: "flex",
        }} />

        {/* Left side */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          flex: 1,
        }}>
          {/* Top: TEFT Legion label */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              background: "#C084FC22",
              border: "1px solid #c084fc44",
              borderRadius: "6px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 900,
              color: "#C084FC",
              letterSpacing: "0.1em",
              display: "flex",
            }}>TEFT LEGION IDENTITY</div>
          </div>

          {/* Middle: Rank + info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              fontSize: "56px",
              fontWeight: 900,
              color: tc.color,
              letterSpacing: "0.05em",
              display: "flex",
            }}>{rank.name}</div>

            <div style={{
              fontSize: "20px",
              color: "#555",
              fontStyle: "italic",
              display: "flex",
            }}>"{rank.tagline}"</div>

            <div style={{ display: "flex", gap: "40px", marginTop: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "12px", color: "#444", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>TEFT BALANCE</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#fff", display: "flex" }}>{formatBalance(balance)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "12px", color: "#444", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>⚡ LEGION POWER</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: tc.color, display: "flex" }}>{formatBalance(power)}</div>
              </div>
              {referrals > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "12px", color: "#444", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>LEGION</div>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: "#fff", display: "flex" }}>{referrals}</div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: wallet + handle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {xHandle && (
              <div style={{ fontSize: "18px", color: "#4ade80", fontWeight: 700, display: "flex" }}>@{xHandle} — verified</div>
            )}
            {shortWallet && (
              <div style={{ fontSize: "14px", color: "#333", fontFamily: "monospace", display: "flex" }}>{shortWallet}</div>
            )}
            <div style={{ fontSize: "14px", color: "#333", display: "flex" }}>teftlegion.com/identity</div>
          </div>
        </div>

        {/* Right side: Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "380px",
          padding: "60px",
        }}>
          <div style={{
            width: "240px",
            height: "240px",
            background: tc.bg,
            border: `3px solid ${tc.border}`,
            borderRadius: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: `0 0 60px ${tc.glow}`,
          }}>
            <div style={{ fontSize: "64px", fontWeight: 900, color: tc.color, display: "flex" }}>{rank.name.slice(0, 1)}</div>
            <div style={{
              fontSize: "14px",
              fontWeight: 900,
              color: tc.color,
              letterSpacing: "0.1em",
              display: "flex",
            }}>{rank.name}</div>
          </div>
        </div>

        {/* Bottom border line */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "3px",
          background: `linear-gradient(90deg, transparent, ${tc.color}, transparent)`,
          display: "flex",
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
