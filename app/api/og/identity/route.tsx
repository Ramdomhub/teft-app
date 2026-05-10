import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TIER_COLORS: Record<string, { color: string; border: string; glow: string; bg: string }> = {
  gold:   { color: "#FFD700", border: "#FFD700", glow: "#FFD70066", bg: "#1a1400" },
  silver: { color: "#C0C0C0", border: "#C0C0C0", glow: "#C0C0C044", bg: "#141414" },
  bronze: { color: "#cd7f32", border: "#cd7f32", glow: "#cd7f3244", bg: "#1a1100" },
  white:  { color: "#94a3b8", border: "#ffffff22", glow: "#ffffff08", bg: "#0f1117" },
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

function GoldEmblem({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="55" fill="none" stroke={color} stroke-width="1.5" opacity="0.3"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke={color} stroke-width="1" opacity="0.5"/>
      <circle cx="60" cy="60" r="22" fill={color} opacity="0.1"/>
      <circle cx="60" cy="60" r="10" fill={color} opacity="0.9"/>
      <line x1="60" y1="5" x2="60" y2="32" stroke={color} stroke-width="1.5" opacity="0.5"/>
      <line x1="60" y1="88" x2="60" y2="115" stroke={color} stroke-width="1.5" opacity="0.5"/>
      <line x1="5" y1="60" x2="32" y2="60" stroke={color} stroke-width="1.5" opacity="0.5"/>
      <line x1="88" y1="60" x2="115" y2="60" stroke={color} stroke-width="1.5" opacity="0.5"/>
    </svg>
  );
}

function SilverEmblem({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <polygon points="60,8 112,92 8,92" fill="none" stroke={color} stroke-width="1.5" opacity="0.4"/>
      <polygon points="60,28 92,82 28,82" fill="none" stroke={color} stroke-width="1" opacity="0.6"/>
      <circle cx="60" cy="62" r="10" fill={color} opacity="0.9"/>
    </svg>
  );
}

function BronzeEmblem({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <rect x="10" y="10" width="100" height="100" rx="8" fill="none" stroke={color} stroke-width="1.5" opacity="0.4"/>
      <rect x="28" y="28" width="64" height="64" rx="4" fill="none" stroke={color} stroke-width="1" opacity="0.6"/>
      <circle cx="60" cy="60" r="10" fill={color} opacity="0.9"/>
    </svg>
  );
}

function WhiteEmblem({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="50" fill="none" stroke={color} stroke-width="1" opacity="0.3"/>
      <circle cx="60" cy="60" r="10" fill={color} opacity="0.6"/>
    </svg>
  );
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
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
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

  const Emblem = rank.tier === "gold" ? GoldEmblem :
                 rank.tier === "silver" ? SilverEmblem :
                 rank.tier === "bronze" ? BronzeEmblem : WhiteEmblem;

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", background: "#000", display: "flex", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>

        {/* Background glow */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "600px", height: "600px", background: `radial-gradient(circle, ${tc.glow} 0%, transparent 65%)`, display: "flex" }} />

        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 60px", flex: 1 }}>

          {/* Top label */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: tc.color, display: "flex" }} />
            <div style={{ fontSize: "11px", fontWeight: 900, color: tc.color, letterSpacing: "0.25em", display: "flex" }}>TEFT IDENTITY UNLOCKED</div>
          </div>

          {/* Rank name + tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "72px", fontWeight: 900, color: tc.color, letterSpacing: "0.04em", lineHeight: "1", display: "flex" }}>{rank.name}</div>
            <div style={{ fontSize: "18px", color: "#555", fontStyle: "italic", display: "flex" }}>"{rank.tagline}"</div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "48px", marginTop: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>TEFT BALANCE</div>
                <div style={{ fontSize: "30px", fontWeight: 900, color: "#fff", display: "flex" }}>{formatBalance(balance)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>POWER SCORE</div>
                <div style={{ fontSize: "30px", fontWeight: 900, color: tc.color, display: "flex" }}>{formatBalance(power)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "10px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>STATUS</div>
                <div style={{ fontSize: "30px", fontWeight: 900, color: xVerified ? "#4ade80" : "#888", display: "flex" }}>{xVerified ? "VERIFIED" : "HOLDER"}</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {xHandle && <div style={{ fontSize: "15px", color: "#4ade80", fontWeight: 700, display: "flex" }}>@{xHandle}</div>}
            <div style={{ fontSize: "12px", color: "#333", fontFamily: "monospace", display: "flex" }}>{shortWallet}</div>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              <div style={{ fontSize: "13px", color: "#444", display: "flex" }}>Reveal yours —</div>
              <div style={{ fontSize: "13px", color: tc.color, display: "flex" }}>teftlegion.com/identity</div>
            </div>
          </div>
        </div>

        {/* Right: Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "340px", padding: "52px 48px" }}>
          <div style={{
            width: "236px", height: "236px", background: tc.bg,
            border: `2px solid ${tc.border}`, borderRadius: "24px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "16px", boxShadow: `0 0 80px ${tc.glow}`, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${tc.color}88, transparent)`, display: "flex" }} />
            <Emblem color={tc.color} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: tc.color, letterSpacing: "0.12em", display: "flex" }}>{rank.name}</div>
              <div style={{ fontSize: "9px", color: "#444", fontWeight: 800, letterSpacing: "0.15em", display: "flex" }}>VERIFIED HOLDER</div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${tc.color}, transparent)`, display: "flex" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
