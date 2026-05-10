import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TIER_COLORS: Record<string, { color: string; border: string; glow: string; bg: string }> = {
  gold:   { color: "#FFD700", border: "#FFD700", glow: "#FFD70055", bg: "#0d0d00" },
  silver: { color: "#C0C0C0", border: "#C0C0C0", glow: "#C0C0C044", bg: "#0d0d0d" },
  bronze: { color: "#cd7f32", border: "#cd7f32", glow: "#cd7f3244", bg: "#0d0800" },
  white:  { color: "#94a3b8", border: "#ffffff18", glow: "#ffffff05", bg: "#0d0d0d" },
};

const RANKS = [
  { name: "SHADOWCORE", min: 1,          tier: "white",  tagline: "Not visible. Still present." },
  { name: "IRONVEIL",   min: 5_000_000,  tier: "white",  tagline: "Steel without noise." },
  { name: "TITANCORE",  min: 10_000_000, tier: "white",  tagline: "Weight becomes power." },
  { name: "VOIDWALKER", min: 20_000_000, tier: "bronze", tagline: "They walk where signals disappear." },
  { name: "ASCENDANT",  min: 30_000_000, tier: "silver", tagline: "No longer followers. No longer human." },
  { name: "NULLCORE",   min: 40_000_000, tier: "gold",   tagline: "The center of inevitability." },
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

  let balance = 0;
  let power = 0;
  let xHandle = "";
  let xVerified = false;

  if (wallet) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/legion_stats?wallet_address=eq.${wallet}&select=teft_balance,score,x_handle,x_verified_at`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
        }
      );
      const data = await res.json();
      if (data?.[0]) {
        balance = data[0].teft_balance || 0;
        power = data[0].score || 0;
        xHandle = data[0].x_handle || "";
        xVerified = !!data[0].x_verified_at;
      }
    } catch (e) {}
  }

  const rank = getRank(balance);
  const tc = TIER_COLORS[rank.tier];
  const shortWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";

  return new ImageResponse(
    (
      <div style={{
        width: "1200px", height: "630px",
        background: "#000",
        display: "flex", position: "relative", overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Gold/color glow top right */}
        <div style={{
          position: "absolute", top: "-150px", right: "-150px",
          width: "700px", height: "700px",
          background: `radial-gradient(circle, ${tc.glow} 0%, transparent 60%)`,
          display: "flex",
        }} />

        {/* Subtle bottom left glow */}
        <div style={{
          position: "absolute", bottom: "-200px", left: "-100px",
          width: "400px", height: "400px",
          background: `radial-gradient(circle, ${tc.color}08 0%, transparent 65%)`,
          display: "flex",
        }} />

        {/* Left border accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "3px",
          background: `linear-gradient(180deg, transparent, ${tc.color}88, transparent)`,
          display: "flex",
        }} />

        {/* LEFT CONTENT */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px", flex: 1,
        }}>
          {/* TOP LABEL */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: tc.color,
              boxShadow: `0 0 10px ${tc.color}`,
              display: "flex",
            }} />
            <div style={{
              fontSize: "10px", fontWeight: 900, color: tc.color,
              letterSpacing: "0.3em", display: "flex",
            }}>TEFT IDENTITY UNLOCKED</div>
          </div>

          {/* RANK NAME */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{
              fontSize: "76px", fontWeight: 900, color: tc.color,
              letterSpacing: "0.03em", lineHeight: "1",
              display: "flex",
            }}>{rank.name}</div>

            <div style={{
              fontSize: "17px", color: "#444",
              fontStyle: "italic", display: "flex",
            }}>"{rank.tagline}"</div>

            {/* STATS ROW */}
            <div style={{ display: "flex", gap: "0px", marginTop: "20px" }}>
              {/* Balance */}
              <div style={{
                display: "flex", flexDirection: "column", gap: "6px",
                paddingRight: "40px",
                borderRight: "1px solid #1a1a1a",
              }}>
                <div style={{ fontSize: "9px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>TEFT BALANCE</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#fff", display: "flex" }}>{formatBalance(balance)}</div>
              </div>

              {/* Power */}
              <div style={{
                display: "flex", flexDirection: "column", gap: "6px",
                paddingLeft: "40px", paddingRight: "40px",
                borderRight: "1px solid #1a1a1a",
              }}>
                <div style={{ fontSize: "9px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>POWER SCORE</div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: tc.color, display: "flex" }}>{formatBalance(power)}</div>
              </div>

              {/* Status */}
              <div style={{
                display: "flex", flexDirection: "column", gap: "6px",
                paddingLeft: "40px",
              }}>
                <div style={{ fontSize: "9px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>STATUS</div>
                <div style={{
                  fontSize: "32px", fontWeight: 900,
                  color: xVerified ? "#4ade80" : "#555",
                  display: "flex",
                }}>{xVerified ? "VERIFIED" : "HOLDER"}</div>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {xHandle && (
              <div style={{ fontSize: "14px", color: "#4ade80", fontWeight: 700, display: "flex" }}>
                @{xHandle}
              </div>
            )}
            <div style={{ fontSize: "11px", color: "#333", fontFamily: "monospace", display: "flex" }}>{shortWallet}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <div style={{ fontSize: "12px", color: "#333", display: "flex" }}>Reveal yours —</div>
              <div style={{ fontSize: "12px", color: tc.color, fontWeight: 700, display: "flex" }}>teftlegion.com/identity</div>
            </div>
          </div>
        </div>

        {/* RIGHT: BADGE */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "320px", padding: "56px 48px",
        }}>
          <div style={{
            width: "224px", height: "224px",
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            borderRadius: "20px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "14px",
            boxShadow: `0 0 60px ${tc.glow}, 0 0 120px ${tc.glow}`,
            position: "relative", overflow: "hidden",
          }}>
            {/* Top shine */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: `linear-gradient(90deg, transparent, ${tc.color}cc, transparent)`,
              display: "flex",
            }} />

            {/* Core symbol - text based */}
            <div style={{
              fontSize: "52px", fontWeight: 900,
              color: tc.color,
              letterSpacing: "-0.05em",
              lineHeight: "1",
              display: "flex",
              textShadow: `0 0 30px ${tc.color}`,
            }}>
              {rank.tier === "gold" ? "◈" : rank.tier === "silver" ? "◆" : rank.tier === "bronze" ? "◇" : "○"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                fontSize: "11px", fontWeight: 900,
                color: tc.color, letterSpacing: "0.12em",
                display: "flex",
              }}>{rank.name}</div>
              <div style={{
                fontSize: "8px", color: "#333",
                fontWeight: 800, letterSpacing: "0.15em",
                display: "flex",
              }}>VERIFIED HOLDER</div>
            </div>
          </div>
        </div>

        {/* BOTTOM LINE */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${tc.color}cc, transparent)`,
          display: "flex",
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
