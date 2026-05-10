"use client";
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

const WalletButton = dynamic(() => Promise.resolve(({ style }: { style?: React.CSSProperties }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <WalletMultiButton style={style} />;
}), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

const RANKS = [
  { name: "SHADOWCORE", min: 1,          max: 4_999_999,  color: "#94a3b8", bg: "#0f1117", tier: "white",  tagline: "Not visible. Still present.",          desc: "Beobachter im Schatten." },
  { name: "IRONVEIL",   min: 5_000_000,  max: 9_999_999,  color: "#cbd5e1", bg: "#111318", tier: "white",  tagline: "Steel without noise.",                 desc: "Disziplinierte Legionäre." },
  { name: "TITANCORE",  min: 10_000_000, max: 19_999_999, color: "#e2e8f0", bg: "#111318", tier: "white",  tagline: "Weight becomes power.",                desc: "Veteranen der Legion." },
  { name: "VOIDWALKER", min: 20_000_000, max: 29_999_999, color: "#cd7f32", bg: "#1a1100", tier: "bronze", tagline: "They walk where signals disappear.",    desc: "Mystische Elite." },
  { name: "ASCENDANT",  min: 30_000_000, max: 39_999_999, color: "#C0C0C0", bg: "#141414", tier: "silver", tagline: "No longer followers. No longer human.", desc: "Legionäre, die Teil der Mythologie werden." },
  { name: "NULLCORE",   min: 40_000_000, max: Infinity,   color: "#FFD700", bg: "#1a1400", tier: "gold",   tagline: "The center of inevitability.",          desc: "Der Kern der Legion." },
];

const TIER_STYLES: Record<string, { border: string; glow: string; badge: string }> = {
  white:  { border: "#ffffff22", glow: "none",                        badge: "⚪" },
  bronze: { border: "#cd7f32",   glow: "0 0 20px #cd7f3244",          badge: "🥉" },
  silver: { border: "#C0C0C0",   glow: "0 0 20px #C0C0C044",          badge: "🥈" },
  gold:   { border: "#FFD700",   glow: "0 0 28px #FFD70066",          badge: "🥇" },
};

function getRank(balance: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (balance >= RANKS[i].min) return { ...RANKS[i], index: i };
  }
  return null;
}

function getProgress(balance: number, rank: typeof RANKS[0] & { index: number }) {
  if (rank.max === Infinity) return 100;
  return Math.min(100, Math.max(0, ((balance - rank.min) / (rank.max - rank.min)) * 100));
}

function calcScore(balance: number, referrals: number) {
  return Math.round(balance * (1 + referrals * 0.25));
}

function formatBalance(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

function RankBadge({ rank, size = "md" }: { rank: NonNullable<ReturnType<typeof getRank>>; size?: "sm" | "md" | "lg" }) {
  const s = { sm: 44, md: 80, lg: 100 }[size];
  const ts = TIER_STYLES[rank.tier];
  const emojiSize = { sm: 16, md: 30, lg: 38 }[size];
  const fontSize = { sm: 6, md: 8, lg: 9 }[size];
  return (
    <div style={{ width: s, height: s, background: rank.bg, border: `2px solid ${ts.border}`, borderRadius: 16, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow: ts.glow, position: "relative", overflow: "hidden" }}>
      {rank.tier !== "white" && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${rank.color}22 0%, transparent 70%)` }} />}
      <span style={{ fontSize: emojiSize }}>{ts.badge}</span>
      <span style={{ color: rank.color, fontSize, fontWeight: 900, letterSpacing: "0.04em", lineHeight: 1, textAlign: "center", padding: "0 4px" }}>{rank.name.split(" ")[0]}</span>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) return <span style={{ fontSize: 18 }}>🥇</span>;
  if (position === 2) return <span style={{ fontSize: 18 }}>🥈</span>;
  if (position === 3) return <span style={{ fontSize: 18 }}>🥉</span>;
  return <span style={{ color: "#444", fontSize: 12, fontWeight: 900, width: 24, textAlign: "center" }}>#{position}</span>;
}

export default function IdentityPage() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<any>(null);
  const [xSession, setXSession] = useState<{ handle: string; avatar?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(true);

  const loadIdentity = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const conn = new Connection(window.location.origin + "/api/rpc");
      const accounts = await conn.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(TEFT_MINT) });
      const balance = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
      const urlParams = new URLSearchParams(window.location.search);
      const referredBy = urlParams.get("ref");
      await fetch("/api/identity/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toBase58(), balance, ...(referredBy ? { referredBy } : {}) }),
      });
      const { data } = await supabase.from("legion_stats").select("*").eq("wallet_address", publicKey.toBase58()).single();
      setCardData({
        wallet: publicKey.toBase58(), balance,
        legionSize: data?.referral_count_live || 0,
        xHandle: data?.x_handle || null,
        referralCode: data?.referral_code || publicKey.toBase58().slice(0, 8),
        score: data?.score || calcScore(balance, 0),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [publicKey]);

  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (e) { console.error(e); }
    finally { setLbLoading(false); }
  }, []);

  useEffect(() => {
    if (publicKey) { loadIdentity(); loadLeaderboard(); }
    else { setLoading(false); loadLeaderboard(); }
  }, [publicKey, loadIdentity, loadLeaderboard]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata?.user_name)
        setXSession({ handle: session.user.user_metadata.user_name, avatar: session.user.user_metadata.avatar_url });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.user_name) {
        const handle = session.user.user_metadata.user_name;
        setXSession({ handle, avatar: session.user.user_metadata.avatar_url });
        if (publicKey) {
          supabase.from("legion_members").upsert({ wallet_address: publicKey.toBase58(), x_handle: handle, x_verified_at: new Date().toISOString() }).then(() => loadIdentity());
        }
      }
      if (event === "SIGNED_OUT") setXSession(null);
    });
    return () => subscription.unsubscribe();
  }, [publicKey, loadIdentity]);

  const connectX = async () => {
    if (!publicKey) return;
    await supabase.auth.signInWithOAuth({ provider: "x" as any, options: { redirectTo: window.location.origin + "/auth/callback" } });
  };

  const disconnectX = async () => {
    await supabase.auth.signOut();
    if (publicKey) await supabase.from("legion_members").update({ x_handle: null, x_verified_at: null }).eq("wallet_address", publicKey.toBase58());
    setXSession(null);
    await loadIdentity();
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://teftlegion.com/identity?ref=${cardData?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnX = () => {
    const rank = getRank(cardData?.balance || 0);
    const refLink = `https://teftlegion.com/identity?ref=${cardData?.referralCode}`;
    const rankLine = rank ? `${TIER_STYLES[rank.tier].badge} ${rank.name} — "${rank.tagline}"` : "";
    const text = `TEFT Legion Identity\n\n${rankLine}\n${formatBalance(cardData?.balance || 0)} TEFT · ${cardData?.legionSize || 0} Legion members\n\nJoin my Legion 👇\n${refLink}\n\n#TEFT #Solana #TEFTLegion`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  // NO WALLET CONNECTED
  if (!publicKey) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .wallet-adapter-button{background:#fff!important;color:#000!important;border-radius:12px!important;font-weight:900!important;font-size:13px!important;height:48px!important;padding:0 28px!important;}`}</style>
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
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 32, marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, margin: "0 0 8px" }}>Connect Wallet</h2>
          <p style={{ color: "#444", fontSize: 13, marginBottom: 24 }}>Connect your Phantom or Solflare wallet to access your TEFT Identity.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <WalletButton />
          </div>
        </div>

        {/* Show leaderboard even without wallet */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>LEGION LEADERBOARD</div>
          {lbLoading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#333", fontSize: 11 }}>Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#333", fontSize: 11 }}>No members yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {leaderboard.slice(0, 10).map((member: any) => {
                const memberRank = getRank(member.balance);
                const mts = memberRank ? TIER_STYLES[memberRank.tier] : null;
                return (
                  <div key={member.wallet} style={{ display: "flex", alignItems: "center", gap: 10, background: "#0a0a0a", border: "1px solid #111", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ width: 28, display: "flex", justifyContent: "center", flexShrink: 0 }}><PositionBadge position={member.position} /></div>
                    <div style={{ width: 28, height: 28, background: memberRank?.bg || "#111", border: `1px solid ${mts?.border || "#222"}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{mts?.badge || "•"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.xHandle ? `@${member.xHandle}` : `${member.wallet.slice(0, 4)}...${member.wallet.slice(-4)}`}
                      </div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{formatBalance(member.balance)} TEFT · {member.referrals} referrals</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: memberRank?.color || "#fff" }}>{formatBalance(member.score)}</div>
                      <div style={{ fontSize: 9, color: "#444" }}>score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #222", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#444", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em" }}>LOADING IDENTITY...</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!cardData || cardData.balance < 1) return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`.wallet-adapter-button{background:#fff!important;color:#000!important;border-radius:12px!important;font-weight:900!important;}`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>No Access</h1>
        <p style={{ color: "#444", fontSize: 13, marginBottom: 24 }}>You need at least 1 TEFT to access Identity.</p>
        <a href={`https://jup.ag/swap/SOL-${TEFT_MINT}`} target="_blank" style={{ background: "#4ade80", color: "#000", borderRadius: 12, padding: "12px 28px", fontWeight: 900, fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 16 }}>Buy TEFT</a>
        <br />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <WalletButton />
        </div>
      </div>
    </div>
  );

  const rank = getRank(cardData.balance);
  const nextRank = rank ? RANKS[rank.index + 1] : null;
  const progress = rank ? getProgress(cardData.balance, rank) : 0;
  const connectedHandle = cardData?.xHandle || xSession?.handle;
  const ts = rank ? TIER_STYLES[rank.tier] : null;
  const myPosition = leaderboard.findIndex((m: any) => m.wallet === cardData.wallet) + 1;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .wallet-adapter-button{background:#1a1a1a!important;color:#fff!important;border-radius:10px!important;font-weight:800!important;font-size:11px!important;height:36px!important;padding:0 16px!important;}`}</style>

      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src="/teft.png" alt="TEFT" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 100%)" }} />
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#888", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← TEFT</a>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ background: "#C084FC22", border: "1px solid #c084fc44", borderRadius: 6, padding: "3px 10px", fontSize: 9, fontWeight: 800, color: "#C084FC", letterSpacing: "0.1em" }}>IDENTITY</span>
            <WalletButton />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Your Identity</h1>
          <p style={{ margin: "2px 0 0", color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>ON-CHAIN PROFILE</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

        <div style={{ background: "#0d0d0d", border: `1px solid ${rank && ts ? ts.border : "#222"}`, borderRadius: 20, padding: 20, marginBottom: 12, position: "relative", overflow: "hidden", boxShadow: rank && ts ? ts.glow : "none" }}>
          {rank && rank.tier !== "white" && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 100% 0%, ${rank.color}0d 0%, transparent 60%)`, pointerEvents: "none" }} />}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            {rank && <RankBadge rank={rank} size="lg" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              {rank && <>
                <div style={{ fontSize: 18, fontWeight: 900, color: rank.color, letterSpacing: "0.05em", marginBottom: 2 }}>{rank.name}</div>
                <div style={{ fontSize: 11, color: "#555", fontStyle: "italic", marginBottom: 8 }}>"{rank.tagline}"</div>
              </>}
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>
                {formatBalance(cardData.balance)} <span style={{ fontSize: 13, color: "#444", fontWeight: 700 }}>TEFT</span>
              </div>
              <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{cardData.wallet.slice(0, 6)}...{cardData.wallet.slice(-6)}</div>
            </div>
          </div>

          {rank && ts && <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>RANK PROGRESS</span>
              <span style={{ fontSize: 9, color: rank.color, fontWeight: 800 }}>{rank.max === Infinity ? "🥇 MAX RANK" : `Next: ${nextRank?.name} (${formatBalance(nextRank?.min)} TEFT)`}</span>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 99, height: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${progress}%`, transition: "width 1s ease", background: rank.tier === "gold" ? "linear-gradient(90deg, #b8860b, #FFD700)" : rank.tier === "silver" ? "linear-gradient(90deg, #999, #C0C0C0)" : rank.tier === "bronze" ? "linear-gradient(90deg, #8b4513, #cd7f32)" : `linear-gradient(90deg, ${rank.color}44, ${rank.color}88)`, boxShadow: ts.glow !== "none" ? `0 0 6px ${rank.color}66` : "none" }} />
            </div>
            <div style={{ fontSize: 9, color: "#333", marginTop: 4, textAlign: "right" }}>{progress.toFixed(1)}%</div>
          </div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden" }}>
            {[
              { label: "TIER", value: rank ? `${rank.index + 1}/6` : "—" },
              { label: "SCORE", value: formatBalance(cardData.score) },
              { label: "LEGION", value: `${cardData.legionSize}` },
              { label: "RANK", value: myPosition > 0 ? `#${myPosition}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#0d0d0d", padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>X ACCOUNT</div>
          {connectedHandle ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {xSession?.avatar ? <img src={xSession.avatar} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #333" }} /> : <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1a1a1a", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>𝕏</div>}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>@{connectedHandle}</div>
                <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, marginTop: 2 }}>✓ Verified</div>
              </div>
              <button onClick={disconnectX} style={{ background: "transparent", border: "1px solid #2a1a1a", borderRadius: 10, padding: "8px 14px", color: "#f87171", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>DISCONNECT</button>
            </div>
          ) : (
            <button onClick={connectX} style={{ width: "100%", background: "#000", border: "1px solid #333", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Connect X Account →</button>
          )}
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>LEGION REFERRAL</div>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>teftlegion.com/identity?ref={cardData.referralCode}</span>
            <button onClick={copyReferral} style={{ background: copied ? "#0a2a1a" : "#1a1a1a", border: `1px solid ${copied ? "#4ade80" : "#333"}`, borderRadius: 8, padding: "6px 12px", color: copied ? "#4ade80" : "#888", fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
              {copied ? "COPIED ✓" : "COPY"}
            </button>
          </div>
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em", marginBottom: 4 }}>SCORE FORMULA</div>
            <div style={{ fontSize: 11, color: "#555" }}>Score = TEFT × (1 + Referrals × 0.25)</div>
            <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4 }}>Each referral = +25% score boost</div>
          </div>
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>RANK LADDER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {RANKS.slice().reverse().map((r) => {
              const isCurrentRank = rank?.name === r.name;
              const rts = TIER_STYLES[r.tier];
              return (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, background: isCurrentRank ? `${r.color}0d` : "transparent", border: `1px solid ${isCurrentRank ? rts.border : "#1a1a1a"}`, borderRadius: 12, padding: "12px 14px", boxShadow: isCurrentRank ? rts.glow : "none" }}>
                  <span style={{ fontSize: 16 }}>{rts.badge}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: isCurrentRank ? r.color : "#555", letterSpacing: "0.05em" }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: "#444", fontStyle: "italic", marginTop: 1 }}>"{r.tagline}"</div>
                    <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>{r.max === Infinity ? `${formatBalance(r.min)}+ TEFT` : `${formatBalance(r.min)} – ${formatBalance(r.max)} TEFT`}</div>
                  </div>
                  {isCurrentRank && <span style={{ fontSize: 9, color: r.color, fontWeight: 900, flexShrink: 0 }}>YOU ARE HERE</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>LEGION LEADERBOARD</div>
            <div style={{ fontSize: 9, color: "#333" }}>TEFT × (1 + refs × 0.25)</div>
          </div>
          {lbLoading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#333", fontSize: 11 }}>Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#333", fontSize: 11 }}>No members yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {leaderboard.slice(0, 20).map((member: any) => {
                const isMe = member.wallet === cardData?.wallet;
                const memberRank = getRank(member.balance);
                const mts = memberRank ? TIER_STYLES[memberRank.tier] : null;
                return (
                  <div key={member.wallet} style={{ display: "flex", alignItems: "center", gap: 10, background: isMe ? "#0a1a0a" : "#0a0a0a", border: `1px solid ${isMe ? "#4ade8044" : "#111"}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ width: 28, display: "flex", justifyContent: "center", flexShrink: 0 }}><PositionBadge position={member.position} /></div>
                    <div style={{ width: 28, height: 28, background: memberRank?.bg || "#111", border: `1px solid ${mts?.border || "#222"}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{mts?.badge || "•"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: isMe ? "#4ade80" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.xHandle ? `@${member.xHandle}` : `${member.wallet.slice(0, 4)}...${member.wallet.slice(-4)}`}
                        {isMe && <span style={{ color: "#4ade80", fontSize: 9, marginLeft: 6 }}>YOU</span>}
                      </div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{formatBalance(member.balance)} TEFT · {member.referrals} referrals</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: memberRank?.color || "#fff" }}>{formatBalance(member.score)}</div>
                      <div style={{ fontSize: 9, color: "#444" }}>score</div>
                    </div>
                  </div>
                );
              })}
              {myPosition > 20 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0a1a0a", border: "1px solid #4ade8044", borderRadius: 10, padding: "10px 12px", marginTop: 4 }}>
                  <div style={{ width: 28, textAlign: "center", color: "#4ade80", fontSize: 12, fontWeight: 900 }}>#{myPosition}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80" }}>You</div>
                    <div style={{ fontSize: 9, color: "#444" }}>{formatBalance(cardData.balance)} TEFT · {cardData.legionSize} referrals</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#4ade80" }}>{formatBalance(cardData.score)}</div>
                    <div style={{ fontSize: 9, color: "#444" }}>score</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={shareOnX} style={{ width: "100%", background: "transparent", border: "1px solid #1e3a5f", borderRadius: 12, padding: "14px", color: "#60a5fa", fontSize: 11, fontWeight: 800, cursor: "pointer", letterSpacing: "0.1em" }}>
          SHARE IDENTITY ON X ↗
        </button>
      </div>
    </div>
  );
}
