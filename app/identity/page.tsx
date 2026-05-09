"use client";
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

export default function IdentityPage() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<any>(null);
  const [xHandle, setXHandle] = useState<string | null>(null);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const loadIdentity = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const rpc = window.location.origin + "/api/rpc";
      const conn = new Connection(rpc);
      const accounts = await conn.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(TEFT_MINT),
      });
      const balance = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;

      const { data } = await supabase
        .from("legion_stats")
        .select("*")
        .eq("wallet_address", publicKey.toBase58())
        .single();

      setCardData({
        wallet: publicKey.toBase58(),
        balance,
        rank: data?.rank || "GHOST",
        legionSize: data?.legion_size || 0,
        xHandle: data?.x_handle || null,
        xVerified: !!data?.x_verified_at,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [publicKey, supabase]);

  useEffect(() => {
    loadIdentity();
  }, [loadIdentity]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.provider_token) {
        const handle = session.user.user_metadata.user_name;
        setXHandle(handle);
        if (publicKey && handle) {
          supabase
            .from("legion_members")
            .upsert({
              wallet_address: publicKey.toBase58(),
              x_handle: handle,
              x_verified_at: new Date().toISOString(),
            })
            .then(() => loadIdentity());
        }
      }
    });
  }, [publicKey, supabase, loadIdentity]);

  const connectX = async () => {
    if (!publicKey) return;
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: window.location.origin + "/identity",
      },
    });
  };

  if (!publicKey) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Connect Wallet</h1>
          <p style={{ color: "#888", marginBottom: 24 }}>Connect your wallet to view your TEFT Identity</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #333", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#888" }}>Loading your identity...</p>
        </div>
      </div>
    );
  }

  if (cardData && cardData.balance < 1) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Access Denied</h1>
          <p style={{ color: "#888", marginBottom: 24 }}>You need at least 1 TEFT to access Identity</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32, textAlign: "center" }}>Your Identity</h1>
        
        {/* Identity Card */}
        <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, background: "#222", borderRadius: 12 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{cardData?.rank || "GHOST"}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{cardData?.balance?.toLocaleString()} TEFT</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #222", paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Wallet</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", color: "#fff" }}>{cardData?.wallet.slice(0, 8)}...{cardData?.wallet.slice(-8)}</div>
          </div>

          {cardData?.xHandle && (
            <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>X Handle</div>
              <div style={{ fontSize: 14, color: "#fff" }}>@{cardData.xHandle} {cardData.xVerified && "✓"}</div>
            </div>
          )}

          <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>Legion Size</div>
            <div style={{ fontSize: 14, color: "#fff" }}>{cardData?.legionSize || 0} members</div>
          </div>
        </div>

        {/* Connect X */}
        {!cardData?.xHandle && (
          <button
            onClick={connectX}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "#000",
              border: "1px solid #333",
              borderRadius: 12,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Connect X Account
          </button>
        )}
      </div>
    </div>
  );
}
