import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TIERS: Record<string, { color: string; border: string; glow: string; bg: string }> = {
  gold:   { color: "#FFD700", border: "#FFD700", glow: "#FFD70055", bg: "#1a1400" },
  silver: { color: "#C0C0C0", border: "#C0C0C0", glow: "#C0C0C044", bg: "#141414" },
  bronze: { color: "#cd7f32", border: "#cd7f32", glow: "#cd7f3244", bg: "#1a1100" },
  white:  { color: "#94a3b8", border: "#ffffff18", glow: "transparent", bg: "#0d0d0d" },
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
    if (balance >= RANKS[i].min) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") || "";

  let balance = 0, power = 0, xHandle = "", xVerified = false, referrals = 0;

  if (wallet) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/legion_stats?wallet_address=eq.${wallet}&select=teft_balance,score,x_handle,x_verified_at,referral_count`,
        { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` } }
      );
      const data = await res.json();
      if (data?.[0]) {
        balance = data[0].teft_balance || 0;
        power = data[0].score || 0;
        xHandle = data[0].x_handle || "";
        xVerified = !!data[0].x_verified_at;
        referrals = data[0].referral_count || 0;
      }
    } catch (e) {}
  }

  const rank = getRank(balance);
  const tc = TIERS[rank.tier];
  const shortWallet = wallet ? `${wallet.slice(0, 8)}...${wallet.slice(-6)}` : "";

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", background: "#000", display: "flex", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>

        {/* BG glow */}
        <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "700px", height: "700px", background: `radial-gradient(circle, ${tc.glow} 0%, transparent 60%)`, display: "flex" }} />

        {/* Left accent line */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: `linear-gradient(180deg, transparent, ${tc.color}88, transparent)`, display: "flex" }} />

        {/* MAIN CARD — mirrors identity page style */}
        <div style={{ display: "flex", flex: 1, padding: "48px 56px", flexDirection: "column", justifyContent: "space-between" }}>

          {/* TOP: label */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: tc.color, boxShadow: `0 0 8px ${tc.color}`, display: "flex" }} />
            <div style={{ fontSize: "10px", fontWeight: 900, color: tc.color, letterSpacing: "0.3em", display: "flex" }}>TEFT IDENTITY UNLOCKED</div>
            <div style={{ marginLeft: "auto", background: "#C084FC22", border: "1px solid #c084fc44", borderRadius: "6px", padding: "3px 10px", fontSize: "9px", fontWeight: 900, color: "#C084FC", letterSpacing: "0.1em", display: "flex" }}>IDENTITY</div>
          </div>

          {/* MIDDLE: identity card */}
          <div style={{
            background: "#0d0d0d",
            border: `1px solid ${tc.border}`,
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: `0 0 40px ${tc.glow}`,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* card bg glow */}
            <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "300px", background: `radial-gradient(circle at 100% 0%, ${tc.color}0d 0%, transparent 60%)`, display: "flex" }} />

            {/* rank row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
              {/* badge box */}
              <div style={{
                width: "88px", height: "88px",
                background: tc.bg,
                border: `2px solid ${tc.border}`,
                borderRadius: "16px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "4px",
                boxShadow: `0 0 20px ${tc.glow}`,
                flexShrink: 0,
              }}>
                <div style={{ fontSize: "32px", fontWeight: 900, color: tc.color, display: "flex" }}>N</div>
                <div style={{ fontSize: "7px", fontWeight: 900, color: tc.color, letterSpacing: "0.08em", display: "flex" }}>NULLCORE</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <div style={{ fontSize: "28px", fontWeight: 900, color: tc.color, letterSpacing: "0.04em", display: "flex" }}>{rank.name}</div>
                <div style={{ fontSize: "13px", color: "#555", fontStyle: "italic", display: "flex" }}>"{rank.tagline}"</div>
                <div style={{ fontSize: "26px", fontWeight: 900, color: "#fff", display: "flex", marginTop: "4px" }}>
                  {fmt(balance)} <span style={{ fontSize: "14px", color: "#444", marginLeft: "8px", marginTop: "8px", display: "flex" }}>TEFT</span>
                </div>
                <div style={{ fontSize: "11px", color: "#444", fontFamily: "monospace", display: "flex" }}>{shortWallet}</div>
              </div>
            </div>

            {/* progress bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "9px", color: "#444", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>RANK PROGRESS</div>
                <div style={{ fontSize: "9px", color: tc.color, fontWeight: 800, display: "flex" }}>MAX RANK</div>
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: "99px", height: "5px", display: "flex", overflow: "hidden" }}>
                <div style={{ width: "100%", borderRadius: "99px", background: `linear-gradient(90deg, ${tc.color}88, ${tc.color})`, display: "flex" }} />
              </div>
            </div>

            {/* stats row */}
            <div style={{ display: "flex", gap: "1px", background: "#1a1a1a", borderRadius: "12px", overflow: "hidden" }}>
              {[
                { label: "TIER", value: `${rank.index + 1}/6` },
                { label: "POWER", value: fmt(power) },
                { label: "LEGION", value: String(referrals) },
                { label: "STATUS", value: xVerified ? "VERIFIED" : "HOLDER" },
              ].map(({ label, value }) => (
                <div key={label} style={{ flex: 1, background: "#0d0d0d", padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <div style={{ fontSize: "8px", color: "#444", fontWeight: 800, letterSpacing: "0.08em", display: "flex" }}>{label}</div>
                  <div style={{ fontSize: "14px", fontWeight: 900, color: label === "STATUS" && xVerified ? "#4ade80" : "#fff", display: "flex" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {xHandle && <div style={{ fontSize: "14px", color: "#4ade80", fontWeight: 700, display: "flex" }}>@{xHandle}</div>}
              <div style={{ fontSize: "11px", color: "#333", display: "flex" }}>Reveal yours — <span style={{ color: tc.color, marginLeft: "6px", display: "flex" }}>teftlegion.com/identity</span></div>
            </div>
            <div style={{ fontSize: "11px", color: "#222", display: "flex" }}>$TEFT · Solana</div>
          </div>
        </div>

        {/* Bottom line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${tc.color}cc, transparent)`, display: "flex" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
