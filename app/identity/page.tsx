"use client";
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

const RANKS = [
  { name: "GHOST",            min: 0,           max: 999,          color: "#444",    bg: "#111",    emoji: "👻" },
  { name: "RECRUIT",          min: 1_000,        max: 9_999,        color: "#6b7280", bg: "#1a1a1a", emoji: "🪖" },
  { name: "SOLDIER",          min: 10_000,       max: 99_999,       color: "#60a5fa", bg: "#1a1a3a", emoji: "⚔️" },
  { name: "VETERAN",          min: 100_000,      max: 499_999,      color: "#34d399", bg: "#0a2a1a", emoji: "🛡️" },
  { name: "ELITE",            min: 500_000,      max: 1_999_999,    color: "#fbbf24", bg: "#2a1a00", emoji: "🌟" },
  { name: "COMMANDER",        min: 2_000_000,    max: 9_999_999,    color: "#f97316", bg: "#2a1000", emoji: "🔥" },
  { name: "WARLORD",          min: 10_000_000,   max: 49_999_999,   color: "#c084fc", bg: "#1a0a2a", emoji: "⚡" },
  { name: "LEGION COMMANDER", min: 50_000_000,   max: Infinity,     color: "#4ade80", bg: "#0a2a0a", emoji: "👑" },
];

function getRank(balance: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (balance >= RANKS[i].min) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

function getProgress(balance: number, rank: typeof RANKS[0] & { index: number }) {
  if (rank.max === Infinity) return 100;
  const range = rank.max - rank.min;
  const progress = balance - rank.min;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

function formatBalance(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

function RankBadge({ rank, size = "md" }: { rank: ReturnType<typeof getRank>; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: { box: 48, emoji: 20, font: 8 }, md: { box: 72, emoji: 28, font: 9 }, lg: { box: 96, emoji: 36, font: 10 } };
  const s = sizes[size];
  const isTop = rank.index >= 6;
  return (
    <div style={{
      width: s.box, height: s.box,
      background: rank.bg,
      border: `2px solid ${rank.color}${isTop ? "" : "66"}`,
      borderRadius: 16,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 2,
      boxShadow: isTop ? `0 0 20px ${rank.color}44` : "none",
      position: "relative", overflow: "hidden",
      flexShrink: 0,
    }}>
      {isTop && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${rank.color}22 0%, transparent 70%)`,
        }} />
      )}
      <span style={{ fontSize: s.emoji }}>{rank.emoji}</span>
      <span style={{ color: rank.color, fontSize: s.font, fontWeight: 900, letterSpacing: "0.05em", lineHeight: 1 }}>
        {rank.name.split(" ")[0]}
      </span>
    </div>
  );
}

export default function IdentityPage() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<any>(null);
  const [xSession, setXSession] = useState<{ handle: string; avatar?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadIdentity = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const conn = new Connection(window.location.origin + "/api/rpc");
      const accounts = await conn.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(TEFT_MINT),
      });
      const balance = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
      const { data } = await supabase
        .from("legion_stats").select("*")
        .eq("wallet_address", publicKey.toBase58()).single();
      setCardData({
        wallet: publicKey.toBase58(),
        balance,
        legionSize: data?.legion_size || 0,
        xHandle: data?.x_handle || null,
        xVerified: !!data?.x_verified_at,
        joinDate: data?.created_at || null,
        referralCode: data?.referral_code || publicKey.toBase58().slice(0, 8),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => { loadIdentity(); }, [loadIdentity]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.user_name) {
        setXSession({
          handle: session.user.user_metadata.user_name,
          avatar: session.user.user_metadata.avatar_url,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.user_name) {
        const handle = session.user.user_metadata.user_name;
        const avatar = session.user.user_metadata.avatar_url;
        setXSession({ handle, avatar });
        if (publicKey) {
          supabase.from("legion_members").upsert({
            wallet_address: publicKey.toBase58(),
            x_handle: handle,
            x_verified_at: new Date().toISOString(),
          }).then(() => loadIdentity());
        }
      }
      if (event === "SIGNED_OUT") setXSession(null);
    });
    return () => subscription.unsubscribe();
  }, [publicKey, loadIdentity]);

  const connectX = async () => {
    if (!publicKey) return;
    await supabase.auth.signInWithOAuth({
      provider: "x" as any,
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
  };

  const disconnectX = async () => {
    await supabase.auth.signOut();
    if (publicKey) {
      await supabase.from("legion_members")
        .update({ x_handle: null, x_verified_at: null })
        .eq("wallet_address", publicKey.toBase58());
      await loadIdentity();
    }
    setXSession(null);
  };

  const copyReferral = () => {
    const link = `https://teftlegion.com/identity?ref=${cardData?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnX = () => {
    const rank = getRank(cardData?.balance || 0);
    const text = `My TEFT Legion Identity\n\n${rank.emoji} Rank: ${rank.name}\n💎 Holdings: ${formatBalance(cardData?.balance || 0)} TEFT\n⚔️ Legion: ${cardData?.legionSize || 0} members\n\nJoin the Legion 👇\nhttps://teftlegion.com/identity?ref=${cardData?.referralCode}\n\n#TEFT #Solana #TEFTLegion`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!publicKey) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.02em" }}>TEFT Identity</h1>
        <p style={{ color: "#444", fontSize: 13 }}>Connect your wallet to access your on-chain identity.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #222", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#444", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>LOADING IDENTITY...</p>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  if (cardData?.balance < 1) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>No Access</h1>
        <p style={{ color: "#444", fontSize: 13, marginBottom: 24 }}>You need at least 1 TEFT to access Identity.</p>
        <a href={`https://jup.ag/swap/SOL-${TEFT_MINT}`} target="_blank"
          style={{ background: "#4ade80", color: "#000", borderRadius: 12, padding: "12px 28px", fontWeight: 900, fontSize: 13, textDecoration: "none", display: "inline-block" }}>
          Buy TEFT
        </a>
      </div>
    </div>
  );

  const rank = getRank(cardData.balance);
  const nextRank = RANKS[rank.index + 1];
  const progress = getProgress(cardData.balance, rank);
  const connectedHandle = cardData?.xHandle || xSession?.handle;
  const avatar = xSession?.avatar;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {/* Hero */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src="/teft.png" alt="TEFT" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 100%)" }} />
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#888", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← TEFT</a>
          <span style={{ background: "#C084FC22", border: "1px solid #c084fc44", borderRadius: 6, padding: "3px 10px", fontSize: 9, fontWeight: 800, color: "#C084FC", letterSpacing: "0.1em" }}>IDENTITY</span>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Your Identity</h1>
          <p style={{ margin: "2px 0 0", color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>ON-CHAIN PROFILE</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Identity Card */}
        <div style={{ background: "#0d0d0d", border: `1px solid ${rank.color}33`, borderRadius: 20, padding: 20, marginBottom: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 100% 0%, ${rank.color}11 0%, transparent 60%)`, pointerEvents: "none" }} />

          {/* Top row: Badge + Info */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <RankBadge rank={rank} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: rank.color, letterSpacing: "-0.01em" }}>{rank.name}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>
                {formatBalance(cardData.balance)} <span style={{ fontSize: 13, color: "#444", fontWeight: 700 }}>TEFT</span>
              </div>
              <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>
                {cardData.wallet.slice(0, 6)}...{cardData.wallet.slice(-6)}
              </div>
            </div>
          </div>

          {/* Rank Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>RANK PROGRESS</span>
              <span style={{ fontSize: 9, color: rank.color, fontWeight: 800 }}>
                {rank.max === Infinity ? "MAX RANK" : `Next: ${nextRank?.name} (${formatBalance(nextRank?.min)} TEFT)`}
              </span>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 99, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
                width: `${progress}%`,
                transition: "width 1s ease",
                boxShadow: `0 0 8px ${rank.color}66`,
              }} />
            </div>
            <div style={{ fontSize: 9, color: "#333", marginTop: 4, textAlign: "right" }}>
              {progress.toFixed(1)}%
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
            {[
              { label: "RANK", value: `#${rank.index + 1}` },
              { label: "LEGION", value: `${cardData.legionSize}` },
              { label: "TIER", value: `${rank.index + 1}/8` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#0d0d0d", padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* X Account */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>X ACCOUNT</div>
          {connectedHandle ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {avatar ? (
                <img src={avatar} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #333" }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1a1a1a", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🐦</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>@{connectedHandle}</div>
                <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, marginTop: 2 }}>✓ Verified</div>
              </div>
              <button onClick={disconnectX} style={{
                background: "transparent", border: "1px solid #2a1a1a",
                borderRadius: 10, padding: "8px 14px", color: "#f87171",
                fontSize: 10, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em",
              }}>DISCONNECT</button>
            </div>
          ) : (
            <button onClick={connectX} style={{
              width: "100%", background: "#000", border: "1px solid #333",
              borderRadius: 12, padding: "14px", color: "#fff",
              fontSize: 12, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em",
            }}>
              Connect X Account →
            </button>
          )}
        </div>

        {/* Referral */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>LEGION REFERRAL</div>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              teftlegion.com/identity?ref={cardData.referralCode}
            </span>
            <button onClick={copyReferral} style={{
              background: copied ? "#0a2a1a" : "#1a1a1a", border: `1px solid ${copied ? "#4ade80" : "#333"}`,
              borderRadius: 8, padding: "6px 12px", color: copied ? "#4ade80" : "#888",
              fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0, letterSpacing: "0.05em",
            }}>
              {copied ? "COPIED ✓" : "COPY"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
            {[
              { label: "REFERRED", value: cardData.legionSize },
              { label: "LEGION SIZE", value: cardData.legionSize },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#0d0d0d", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rank Ladder */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>RANK LADDER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {RANKS.slice().reverse().map((r, i) => {
              const isCurrentRank = r.name === rank.name;
              return (
                <div key={r.name} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: isCurrentRank ? `${r.color}11` : "transparent",
                  border: `1px solid ${isCurrentRank ? r.color + "44" : "#1a1a1a"}`,
                  borderRadius: 12, padding: "10px 14px",
                }}>
                  <span style={{ fontSize: 16 }}>{r.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: isCurrentRank ? r.color : "#888" }}>{r.name}</div>
                    <div style={{ fontSize: 9, color: "#444", fontWeight: 700, marginTop: 1 }}>
                      {r.max === Infinity ? `${formatBalance(r.min)}+` : `${formatBalance(r.min)} – ${formatBalance(r.max)}`} TEFT
                    </div>
                  </div>
                  {isCurrentRank && (
                    <span style={{ fontSize: 9, color: r.color, fontWeight: 900, letterSpacing: "0.05em" }}>YOU ARE HERE</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Share Button */}
        <button onClick={shareOnX} style={{
          width: "100%", background: "transparent",
          border: "1px solid #1e3a5f", borderRadius: 12,
          padding: "14px", color: "#60a5fa",
          fontSize: 11, fontWeight: 800, cursor: "pointer",
          letterSpacing: "0.1em", textTransform: "uppercase" as const,
        }}>
          Share Identity on X ↗
        </button>

      </div>
    </div>
  );
}
