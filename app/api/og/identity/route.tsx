import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const TIER_COLORS: Record<string, { color: string; border: string; glow: string; bg: string; label: string }> = {
  gold:   { color: "#FFD700", border: "#FFD700", glow: "#FFD70088", bg: "#1a1400", label: "NULLCORE" },
  silver: { color: "#C0C0C0", border: "#C0C0C0", glow: "#C0C0C066", bg: "#141414", label: "ASCENDANT" },
  bronze: { color: "#cd7f32", border: "#cd7f32", glow: "#cd7f3266", bg: "#1a1100", label: "VOIDWALKER" },
  white:  { color: "#94a3b8", border: "#ffffff22", glow: "#ffffff11", bg: "#0f1117", label: "" },
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

  // Server-side verification — fetch from Supabase
  let balance = 0;
  let power = 0;
  let xHandle = "";
  let xVerified = false;
  let referrals = 0;

  if (wallet) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await supabase
        .from("legion_stats")
        .select("teft_balance, score, x_handle, x_verified_at, referral_count_live")
        .eq("wallet_address", wallet)
        .single();

      if (data) {
        balance = data.teft_balance || 0;
        power = data.score || 0;
        xHandle = data.x_handle || "";
        xVerified = !!data.x_verified_at;
        referrals = data.referral_count_live || 0;
      }
    } catch (e) {}
  }

  const rank = getRank(balance);
  const tc = TIER_COLORS[rank.tier];
  const shortWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";

  // Custom SVG emblem per tier
  const emblemSvg = rank.tier === "gold" ? `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="none" stroke="${tc.color}" stroke-width="2" opacity="0.4"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke="${tc.color}" stroke-width="1.5" opacity="0.6"/>
      <circle cx="60" cy="60" r="24" fill="${tc.color}" opacity="0.15"/>
      <circle cx="60" cy="60" r="10" fill="${tc.color}" opacity="0.9"/>
      <line x1="60" y1="5" x2="60" y2="30" stroke="${tc.color}" stroke-width="2" opacity="0.5"/>
      <line x1="60" y1="90" x2="60" y2="115" stroke="${tc.color}" stroke-width="2" opacity="0.5"/>
      <line x1="5" y1="60" x2="30" y2="60" stroke="${tc.color}" stroke-width="2" opacity="0.5"/>
      <line x1="90" y1="60" x2="115" y2="60" stroke="${tc.color}" stroke-width="2" opacity="0.5"/>
    </svg>
  ` : rank.tier === "silver" ? `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,5 115,95 5,95" fill="none" stroke="${tc.color}" stroke-width="2" opacity="0.4"/>
      <polygon points="60,25 95,85 25,85" fill="none" stroke="${tc.color}" stroke-width="1.5" opacity="0.6"/>
      <polygon points="60,45 80,75 40,75" fill="${tc.color}" opacity="0.2"/>
      <circle cx="60" cy="60" r="8" fill="${tc.color}" opacity="0.9"/>
    </svg>
  ` : rank.tier === "bronze" ? `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="100" height="100" rx="8" fill="none" stroke="${tc.color}" stroke-width="2" opacity="0.4"/>
      <rect x="25" y="25" width="70" height="70" rx="4" fill="none" stroke="${tc.color}" stroke-width="1.5" opacity="0.6"/>
      <rect x="42" y="42" width="36" height="36" fill="${tc.color}" opacity="0.15"/>
      <circle cx="60" cy="60" r="8" fill="${tc.color}" opacity="0.9"/>
    </svg>
  ` : `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="none" stroke="${tc.color}" stroke-width="1.5" opacity="0.3"/>
      <circle cx="60" cy="60" r="8" fill="${tc.color}" opacity="0.6"/>
    </svg>
  `;

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", background: "#000", display: "flex", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>

        {/* Background glow */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "600px", height: "600px", background: `radial-gradient(circle, ${tc.glow} 0%, transparent 65%)`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: "-200px", left: "-100px", width: "400px", height: "400px", background: `radial-gradient(circle, ${tc.color}11 0%, transparent 65%)`, display: "flex" }} />

        {/* Subtle grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${tc.color}08 1px, transparent 1px), linear-gradient(90deg, ${tc.color}08 1px, transparent 1px)`, backgroundSize: "60px 60px", display: "flex" }} />

        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 60px", flex: 1 }}>

          {/* Top label */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: tc.color, boxShadow: `0 0 8px ${tc.color}`, display: "flex" }} />
              <div style={{ fontSize: "11px", fontWeight: 900, color: tc.color, letterSpacing: "0.25em", display: "flex" }}>TEFT IDENTITY UNLOCKED</div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "68px", fontWeight: 900, color: tc.color, letterSpacing: "0.04em", lineHeight: 1, display: "flex" }}>{rank.name}</div>
            <div style={{ fontSize: "18px", color: "#666", fontStyle: "italic", display: "flex" }}>"{rank.tagline}"</div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "48px", marginTop: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>TEFT BALANCE</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff", display: "flex" }}>{formatBalance(balance)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>POWER SCORE</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: tc.color, display: "flex" }}>{formatBalance(power)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>STATUS</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: xVerified ? "#4ade80" : "#555", display: "flex" }}>{xVerified ? "VERIFIED" : "HOLDER"}</div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {xHandle && (
              <div style={{ fontSize: "16px", color: "#4ade80", fontWeight: 700, display: "flex" }}>@{xHandle}</div>
            )}
            <div style={{ fontSize: "13px", color: "#333", fontFamily: "monospace", display: "flex" }}>{shortWallet}</div>
            <div style={{ fontSize: "14px", color: "#555", display: "flex", marginTop: "4px" }}>
              Reveal yours — <span style={{ color: tc.color, marginLeft: "6px", display: "flex" }}>teftlegion.com/identity</span>
            </div>
          </div>
        </div>

        {/* Right: Emblem */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "340px", padding: "52px 48px" }}>
          <div style={{
            width: "236px", height: "236px",
            background: tc.bg,
            border: `2px solid ${tc.border}`,
            borderRadius: "24px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "16px",
            boxShadow: `0 0 80px ${tc.glow}, inset 0 0 40px ${tc.color}08`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${tc.color}88, transparent)`, display: "flex" }} />
            <div style={{ display: "flex" }} dangerouslySetInnerHTML={{ __html: emblemSvg }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: tc.color, letterSpacing: "0.12em", display: "flex" }}>{rank.name}</div>
              <div style={{ fontSize: "9px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>VERIFIED HOLDER</div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${tc.color}, transparent)`, display: "flex" }} />
        {/* Left line */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${tc.color}44, transparent)`, display: "flex" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
