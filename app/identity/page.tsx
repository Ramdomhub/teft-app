"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Connection } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import NavHeader from "../components/NavHeader";

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const RPC = typeof window !== "undefined" ? window.location.origin + "/api/rpc" : "https://teftlegion.com/api/rpc";
const JUPITER_REF = "7A9fc8QBgvEKLvqoXfAhyfKuo2vHzUrjre6jbbGorere";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

type RankInfo = { name: string; color: string; minTeft: number; minLegion: number };
const RANKS: RankInfo[] = [
  { name: "GHOST",             color: "#64748B", minTeft: 1,         minLegion: 0  },
  { name: "SOLDIER",           color: "#94A3B8", minTeft: 10000,     minLegion: 0  },
  { name: "SENTINEL",          color: "#60A5FA", minTeft: 100000,    minLegion: 0  },
  { name: "VETERAN",           color: "#818CF8", minTeft: 500000,    minLegion: 0  },
  { name: "COMMANDER",         color: "#A78BFA", minTeft: 0,         minLegion: 5  },
  { name: "PHANTOM",           color: "#C084FC", minTeft: 1000000,   minLegion: 0  },
  { name: "PHANTOM COMMANDER", color: "#E879F9", minTeft: 1000000,   minLegion: 10 },
  { name: "LEGION ELITE",      color: "#F0ABFC", minTeft: 5000000,   minLegion: 10 },
];

function getRank(teft: number, legion: number): RankInfo {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (teft >= r.minTeft && legion >= r.minLegion) rank = r;
  }
  return rank;
}

type Badge = { id: string; label: string; emoji: string; desc: string };
function getBadges(teft: number, legion: number, joinedAt: string, xVerified: boolean): Badge[] {
  const badges: Badge[] = [];
  const days = (Date.now() - new Date(joinedAt).getTime()) / 86400000;
  if (teft >= 1)         badges.push({ id:"holder",    label:"TEFT Holder",     emoji:"🪙", desc:"Holds at least 1 TEFT" });
  if (teft >= 1000000)   badges.push({ id:"whale",     label:"Whale",            emoji:"🐋", desc:"Holds 1M+ TEFT" });
  if (days <= 14)        badges.push({ id:"early",     label:"Early Adopter",    emoji:"⚡", desc:"Joined in the first 2 weeks" });
  if (days >= 30)        badges.push({ id:"diamond",   label:"Diamond Hands",    emoji:"💎", desc:"Holding for 30+ days" });
  if (legion >= 1)       badges.push({ id:"recruiter", label:"Recruiter",        emoji:"📡", desc:"Invited at least 1 soldier" });
  if (legion >= 5)       badges.push({ id:"commander", label:"Legion Commander", emoji:"🎖️", desc:"5+ soldiers in your legion" });
  if (xVerified)         badges.push({ id:"verified",  label:"X Verified",       emoji:"✓",  desc:"X account linked" });
  return badges;
}

function WalletAvatar({ address, size = 64 }: { address: string; size?: number }) {
  const seed = address.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue1 = (seed * 137) % 360;
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 180) % 360;
  const pattern = seed % 4;
  const c1 = `hsl(${hue1},70%,55%)`;
  const c2 = `hsl(${hue2},65%,45%)`;
  const c3 = `hsl(${hue3},75%,60%)`;
  const chars = address.replace(/[^a-zA-Z0-9]/g, "");
  const cells = Array.from({ length: 9 }, (_, i) => chars.charCodeAt(i % chars.length) % 3);
  const cellColors = ["#0a0a0a", c2, c1];
  const s = size;
  const cell = s / 3;
  const id = `cl-${address.slice(0,6)}`;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ borderRadius:"50%", display:"block" }}>
      <defs><clipPath id={id}><circle cx={s/2} cy={s/2} r={s/2}/></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect width={s} height={s} fill="#0a0a0a"/>
        {cells.map((v, i) => (
          <rect key={i} x={(i%3)*cell} y={Math.floor(i/3)*cell} width={cell} height={cell} fill={cellColors[v]} opacity={0.9}/>
        ))}
        {pattern === 0 && <circle cx={s/2} cy={s/2} r={s/3} fill="none" stroke={c3} strokeWidth={2} opacity={0.6}/>}
        {pattern === 1 && <line x1={0} y1={s/2} x2={s} y2={s/2} stroke={c3} strokeWidth={2} opacity={0.4}/>}
        {pattern === 2 && <polygon points={`${s/2},${s*0.1} ${s*0.9},${s*0.9} ${s*0.1},${s*0.9}`} fill="none" stroke={c3} strokeWidth={2} opacity={0.5}/>}
        {pattern === 3 && <rect x={s*0.2} y={s*0.2} width={s*0.6} height={s*0.6} fill="none" stroke={c3} strokeWidth={2} opacity={0.5}/>}
        <circle cx={s/2} cy={s/2} r={4} fill={c1} opacity={0.9}/>
      </g>
    </svg>
  );
}

function fmt(n: number) {
  if (n >= 1000000000) return (n/1000000000).toFixed(1)+"B";
  if (n >= 1000000)    return (n/1000000).toFixed(1)+"M";
  if (n >= 1000)       return (n/1000).toFixed(1)+"K";
  return n.toLocaleString();
}
function short(a: string) { return a.slice(0,4)+"..."+a.slice(-4); }

type CardData = {
  wallet: string;
  teft: number;
  legion: number;
  joinedAt: string;
  referredBy: string | null;
  xHandle: string | null;
  xVerified: boolean;
};

function IdentityCard({ data }: { data: CardData }) {
  const rank = getRank(data.teft, data.legion);
  const badges = getBadges(data.teft, data.legion, data.joinedAt, data.xVerified);
  return (
    <div style={{ position:"relative", background:"linear-gradient(160deg,#0e0e0e 0%,#141414 60%,#0a0a0a 100%)", border:`1px solid ${rank.color}33`, borderRadius:20, padding:24, overflow:"hidden", boxShadow:`0 0 40px ${rank.color}15,inset 0 1px 0 ${rank.color}18`, fontFamily:"'DM Mono','Fira Mono',monospace", width:"100%" }}>
      <div style={{ position:"absolute", inset:0, opacity:0.025, backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 2px,${rank.color} 2px,${rank.color} 3px)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, background:`radial-gradient(circle,${rank.color}20 0%,transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:9, color:"#333", letterSpacing:4, textTransform:"uppercase" }}>TEFT · LEGION</div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:rank.color, padding:"3px 10px", border:`1px solid ${rank.color}44`, borderRadius:4, textTransform:"uppercase" }}>{rank.name}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ border:`2px solid ${rank.color}55`, borderRadius:"50%", padding:3, boxShadow:`0 0 16px ${rank.color}30`, flexShrink:0 }}>
          <WalletAvatar address={data.wallet} size={64}/>
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff", letterSpacing:-0.5 }}>{data.xHandle ? `@${data.xHandle}` : short(data.wallet)}</div>
          <div style={{ fontSize:10, color:data.xVerified ? rank.color : "#444", marginTop:2 }}>{data.xVerified ? "✓ X Verified" : short(data.wallet)}</div>
          <div style={{ fontSize:9, color:"#333", marginTop:5, letterSpacing:1 }}>MEMBER SINCE {new Date(data.joinedAt).toLocaleDateString("en-US",{month:"short",year:"numeric"}).toUpperCase()}</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
        {[
          { label:"TEFT HELD", value:fmt(data.teft),           color:"#C084FC" },
          { label:"LEGION",    value:data.legion+" soldiers",  color:rank.color },
          { label:"RANK",      value:rank.name,                color:rank.color },
        ].map(s => (
          <div key={s.label} style={{ background:"#0a0a0a", borderRadius:10, padding:"10px 12px", border:"1px solid #1a1a1a" }}>
            <div style={{ fontSize:8, color:"#444", letterSpacing:2, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:12, fontWeight:700, color:s.color, lineHeight:1.2 }}>{s.value}</div>
          </div>
        ))}
      </div>
      {badges.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:8, color:"#333", letterSpacing:3, marginBottom:8 }}>BADGES</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {badges.map(b => (
              <div key={b.id} title={b.desc} style={{ background:"#0f0f0f", border:`1px solid ${rank.color}33`, borderRadius:6, padding:"4px 10px", fontSize:11, color:"#aaa", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:12 }}>{b.emoji}</span>{b.label}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:9, color:"#333", letterSpacing:2, marginBottom:6 }}>RANK PROGRESS</div>
        <div style={{ height:2, background:"#1a1a1a", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${Math.min(100,(data.teft/5000000)*100)}%`, background:`linear-gradient(90deg,${rank.color}66,${rank.color})`, borderRadius:2 }}/>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid #111", fontSize:9, color:"#282828", letterSpacing:1 }}>
        <span>teftlegion.com/identity</span>
        <span>{data.wallet.slice(0,8)}...{data.wallet.slice(-4)}</span>
      </div>
    </div>
  );
}

function TokenGate({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, signMessage } = useWallet();
  const [state, setState] = useState<"idle"|"signing"|"checking"|"ok"|"denied"|"error">("idle");
  const signed = useRef(false);

  useEffect(() => {
    if (!connected || !publicKey) { setState("idle"); signed.current = false; return; }
    if (signed.current) return;
    setState("signing");
    const msg = new TextEncoder().encode("TEFT Identity — verify wallet ownership.");
    const doSign = signMessage
      ? signMessage(msg).then(() => true).catch(() => false)
      : Promise.resolve(true);
    doSign.then(ok => {
      if (!ok) { setState("error"); return; }
      signed.current = true;
      setState("checking");
      new Connection(RPC).getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(TEFT_MINT) })
        .then(res => {
          const amount = res.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
          setState(amount >= 1 ? "ok" : "denied");
        }).catch(() => setState("error"));
    });
  }, [connected, publicKey]);

  const box: React.CSSProperties = {
    minHeight:"100vh", background:"#080808",
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    gap:16, fontFamily:"'DM Mono',monospace",
  };
  const spinner = <div style={{ width:36, height:36, border:"2px solid #C084FC", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>;

  if (!connected) return (
    <div style={box}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontSize:40}}>🪪</div>
      <div style={{color:"#fff",fontSize:18,fontWeight:800}}>TEFT Identity</div>
      <div style={{color:"#444",fontSize:12}}>Connect wallet to access your Identity</div>
      <WalletMultiButton style={{marginTop:8}}/>
    </div>
  );
  if (state==="signing") return (
    <div style={box}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {spinner}
      <div style={{color:"#555",fontSize:12}}>Sign to verify…</div>
    </div>
  );
  if (state==="checking") return (
    <div style={box}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {spinner}
      <div style={{color:"#555",fontSize:12}}>Checking TEFT balance…</div>
    </div>
  );
  if (state==="error") return (
    <div style={box}>
      <div style={{color:"#F87171",fontSize:13}}>Signing cancelled.</div>
      <button onClick={()=>{signed.current=false;setState("idle");}} style={{background:"#111",color:"#fff",border:"1px solid #333",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontSize:12}}>
        Try Again
      </button>
    </div>
  );
  if (state==="denied") return (
    <div style={box}>
      <div style={{fontSize:44}}>🚫</div>
      <div style={{color:"#fff",fontSize:18,fontWeight:800}}>No Access</div>
      <div style={{color:"#555",fontSize:12,textAlign:"center",maxWidth:260}}>
        You need at least <strong style={{color:"#fff"}}>1 TEFT</strong> to enter.
      </div>
      <a href={`https://jup.ag/swap/SOL-${TEFT_MINT}?referral=${JUPITER_REF}&feeBps=50`} target="_blank" rel="noreferrer"
        style={{background:"#4ADE80",color:"#000",borderRadius:10,padding:"12px 28px",fontWeight:800,fontSize:13,textDecoration:"none",marginTop:8}}>
        Buy TEFT on Jupiter ↗
      </a>
    </div>
  );
  return <>{children}</>;
}

export default function IdentityPage() {
  const { publicKey } = useWallet();
  const [cardData, setCardData] = useState<CardData|null>(null);
  const [loading, setLoading] = useState(false);
  const [refLink, setRefLink] = useState("");
  const [copied, setCopied] = useState(false);

  const refParam = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("ref")
    : null;

  const loadIdentity = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    const wallet = publicKey.toBase58();
    try {
      const conn = new Connection(RPC);
      const res = await conn.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(TEFT_MINT) });
      const teft = res.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      const { data: existing } = await supabase.from("legion_members").select("*").eq("wallet_address", wallet).single();
      if (!existing) {
        await supabase.from("legion_members").insert({ wallet_address: wallet, referred_by: refParam ?? null, teft_balance: teft });
      } else {
        await supabase.from("legion_members").update({ teft_balance: teft, last_seen: new Date().toISOString() }).eq("wallet_address", wallet);
      }
      const { data: stats } = await supabase.from("legion_stats").select("*").eq("wallet_address", wallet).single();
      setCardData({
        wallet,
        teft,
        legion: stats?.legion_size ?? 0,
        joinedAt: existing?.joined_at ?? new Date().toISOString(),
        referredBy: existing?.referred_by ?? refParam ?? null,
        xHandle: stats?.x_handle ?? null,
        xVerified: !!stats?.x_verified_at,
      });
      setRefLink(`${window.location.origin}/identity?ref=${wallet}`);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [publicKey, refParam]);

  useEffect(() => { loadIdentity(); }, [loadIdentity]);

  const shareToX = () => {
    if (!cardData) return;
    const rank = getRank(cardData.teft, cardData.legion);
    const text = encodeURIComponent(
      `🪪 My TEFT Identity\n\nRank: ${rank.name}\n${fmt(cardData.teft)} $TEFT held\nLegion: ${cardData.legion} soldiers\n\nGet yours → ${refLink}`
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  };

  const copyRef = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TokenGate>
      <div style={{ minHeight:"100vh", background:"#080808", fontFamily:"'DM Mono',monospace", padding:"20px 16px 80px" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <NavHeader maxWidth={440} />
        <div style={{ maxWidth:440, margin:"0 auto" }}>
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:9, color:"#333", letterSpacing:4 }}>TEFT · IDENTITY</div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#fff", margin:"6px 0 4px", letterSpacing:-1 }}>Your Identity</h1>
            <p style={{ fontSize:11, color:"#333", margin:0 }}>On-chain profile for TEFT Holders</p>
          </div>
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:60 }}>
              <div style={{ width:36, height:36, border:"2px solid #C084FC", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              <div style={{ color:"#444", fontSize:12 }}>Building your identity…</div>
            </div>
          )}
          {!loading && cardData && (
            <>
              <IdentityCard data={cardData}/>
              <div style={{ marginTop:20, background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:14, padding:18 }}>
                <div style={{ fontSize:9, color:"#333", letterSpacing:3, marginBottom:10 }}>YOUR LEGION LINK</div>
                <div style={{ fontSize:11, color:"#444", marginBottom:12, lineHeight:1.6 }}>Share this link. Everyone who joins through it becomes part of your Legion and boosts your rank.</div>
                <div style={{ background:"#080808", border:"1px solid #222", borderRadius:8, padding:"10px 12px", fontSize:11, color:"#555", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                  <span style={{ flex:1, wordBreak:"break-all" }}>{refLink||"Loading…"}</span>
                  <button onClick={copyRef} style={{ background:copied?"#1a2a1a":"#1a1a1a", color:copied?"#4ADE80":"#666", border:"1px solid #222", borderRadius:6, padding:"6px 12px", fontSize:10, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.2s" }}>
                    {copied?"Copied!":"Copy"}
                  </button>
                </div>
                {cardData.legion > 0 && (
                  <div style={{ marginTop:10, fontSize:11, color:"#4ADE80" }}>
                    👥 {cardData.legion} soldier{cardData.legion!==1?"s":""} in your Legion
                  </div>
                )}
              </div>
              <div style={{ marginTop:12, background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:14, padding:18, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#555" }}>Connect X Account</div>
                  <div style={{ fontSize:10, color:"#333", marginTop:3 }}>Unlock Verified badge + handle on card</div>
                </div>
                <div style={{ fontSize:9, color:"#444", border:"1px solid #222", borderRadius:4, padding:"4px 8px", letterSpacing:1 }}>SOON</div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button onClick={shareToX} style={{ flex:1, background:"#0a0a0a", color:"#fff", border:"1px solid #222", borderRadius:12, padding:"14px 0", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  𝕏 Share Identity
                </button>
                <button onClick={loadIdentity} style={{ background:"#0a0a0a", color:"#444", border:"1px solid #1a1a1a", borderRadius:12, padding:"14px 18px", fontSize:14, cursor:"pointer" }}>↻</button>
              </div>

            </>
          )}
        </div>
      </div>
    </TokenGate>
  );
}
