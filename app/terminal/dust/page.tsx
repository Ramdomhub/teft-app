"use client";
import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";

const WalletButton = dynamic(() => Promise.resolve(({ style }: { style?: React.CSSProperties }) => {
  const [mounted, setMounted] = useState(false);
  if (typeof window !== "undefined" && !mounted) setMounted(true);
  if (!mounted) return null;
  return <WalletMultiButton style={style} />;
}), { ssr: false });

interface DustAccount {
  pubkey: string;
  mint: string;
  balance: number;
  decimals: number;
  rentLamports: number;
  selected: boolean;
}

export default function DustRemoverPage() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [accounts, setAccounts] = useState<DustAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const scan = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    setDone(null);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
      const dust: DustAccount[] = [];
      for (const { pubkey, account } of tokenAccounts.value) {
        const parsed = account.data.parsed.info;
        const balance = parsed.tokenAmount.uiAmount || 0;
        const rentLamports = account.lamports;
        // Show zero-balance accounts and very small balances
        if (balance === 0) {
          dust.push({
            pubkey: pubkey.toBase58(),
            mint: parsed.mint,
            balance,
            decimals: parsed.tokenAmount.decimals,
            rentLamports,
            selected: true,
          });
        }
      }
      setAccounts(dust);
      setScanned(true);
    } catch (e: any) {
      setError("Failed to scan: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  const toggleAll = (val: boolean) => {
    setAccounts(prev => prev.map(a => ({ ...a, selected: val })));
  };

  const toggle = (pubkey: string) => {
    setAccounts(prev => prev.map(a => a.pubkey === pubkey ? { ...a, selected: !a.selected } : a));
  };

  const closeSelected = useCallback(async () => {
    if (!publicKey) return;
    const selected = accounts.filter(a => a.selected);
    if (selected.length === 0) return;
    setShowConfirm(false);
    setClosing(true);
    setError(null);
    setDone(null);
    try {
      // Max 20 per transaction
      const chunks: DustAccount[][] = [];
      for (let i = 0; i < selected.length; i += 20) chunks.push(selected.slice(i, i + 20));

      let totalSig = "";
      for (const chunk of chunks) {
        const tx = new Transaction();
        for (const acc of chunk) {
          tx.add(createCloseAccountInstruction(
            new PublicKey(acc.pubkey),
            publicKey,
            publicKey,
          ));
        }
        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
        totalSig = sig;
      }

      const totalSol = selected.reduce((sum, a) => sum + a.rentLamports, 0) / 1e9;
      setDone(`✅ Closed ${selected.length} accounts — recovered ~${totalSol.toFixed(4)} SOL`);
      setAccounts(prev => prev.filter(a => !a.selected));
    } catch (e: any) {
      setError("Transaction failed: " + e.message);
    } finally {
      setClosing(false);
    }
  }, [publicKey, accounts, sendTransaction, connection]);

  const selectedCount = accounts.filter(a => a.selected).length;
  const totalRecoverable = accounts.filter(a => a.selected).reduce((sum, a) => sum + a.rentLamports, 0) / 1e9;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .wallet-adapter-button{background:#1a1a1a!important;color:#fff!important;border-radius:10px!important;font-weight:800!important;font-size:11px!important;height:36px!important;padding:0 16px!important;}`}</style>

      {/* Header */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src="/teft.png" alt="TEFT" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 100%)" }} />
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/terminal" style={{ color: "#888", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← Terminal</a>
          <WalletButton style={{ background: "#1a1a1a", borderRadius: 10, fontSize: 11, fontWeight: 800, height: 36, padding: "0 16px" }} />
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Dust Remover</h1>
          <p style={{ margin: "2px 0 0", color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>RECOVER SOL FROM EMPTY TOKEN ACCOUNTS</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Info Card */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>HOW IT WORKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "🔍", text: "Scan your wallet for empty token accounts" },
              { icon: "✅", text: "Select which accounts to close" },
              { icon: "💰", text: "Recover ~0.002 SOL rent per account" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 12, color: "#888" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {!publicKey ? (
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Connect your wallet</div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 20 }}>to scan for dust accounts</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <WalletButton />
            </div>
          </div>
        ) : (
          <>
            {/* Scan Button */}
            {!scanned && (
              <button onClick={scan} disabled={loading} style={{ width: "100%", background: loading ? "#111" : "#fff", color: loading ? "#444" : "#000", border: "none", borderRadius: 16, padding: 16, fontSize: 13, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? (
                  <><div style={{ width: 16, height: 16, border: "2px solid #333", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> Scanning...</>
                ) : "🔍 Scan Wallet"}
              </button>
            )}

            {/* Results */}
            {scanned && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em" }}>
                    {accounts.length === 0 ? "NO DUST FOUND" : `${accounts.length} EMPTY ACCOUNTS FOUND`}
                  </div>
                  {accounts.length > 0 && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleAll(true)} style={{ background: "transparent", border: "1px solid #222", borderRadius: 6, padding: "3px 8px", color: "#888", fontSize: 10, cursor: "pointer" }}>All</button>
                      <button onClick={() => toggleAll(false)} style={{ background: "transparent", border: "1px solid #222", borderRadius: 6, padding: "3px 8px", color: "#888", fontSize: 10, cursor: "pointer" }}>None</button>
                      <button onClick={scan} style={{ background: "transparent", border: "1px solid #222", borderRadius: 6, padding: "3px 8px", color: "#888", fontSize: 10, cursor: "pointer" }}>↺</button>
                    </div>
                  )}
                </div>

                {accounts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#333", fontSize: 12 }}>Your wallet is clean! No dust found.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {accounts.map(acc => (
                      <div key={acc.pubkey} onClick={() => toggle(acc.pubkey)} style={{ display: "flex", alignItems: "center", gap: 10, background: acc.selected ? "#0a1a0a" : "#111", border: `1px solid ${acc.selected ? "#4ade8044" : "#1a1a1a"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${acc.selected ? "#4ade80" : "#333"}`, background: acc.selected ? "#4ade8022" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {acc.selected && <div style={{ width: 8, height: 8, background: "#4ade80", borderRadius: 2 }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {acc.mint.slice(0, 8)}...{acc.mint.slice(-6)}
                          </div>
                          <div style={{ fontSize: 9, color: "#333", marginTop: 1 }}>Balance: {acc.balance} · Rent: {(acc.rentLamports / 1e9).toFixed(4)} SOL</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Summary + Close Button */}
            {scanned && accounts.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#1a1a1a", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ background: "#0d0d0d", padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>SELECTED</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 2 }}>{selectedCount}</div>
                  </div>
                  <div style={{ background: "#0d0d0d", padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>RECOVERABLE</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#4ade80", marginTop: 2 }}>~{totalRecoverable.toFixed(4)} SOL</div>
                  </div>
                </div>
                <button onClick={() => setShowConfirm(true)} disabled={closing || selectedCount === 0} style={{ width: "100%", background: selectedCount === 0 ? "#111" : "#4ade80", color: selectedCount === 0 ? "#444" : "#000", border: "none", borderRadius: 14, padding: 16, fontSize: 13, fontWeight: 900, cursor: selectedCount === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {closing ? (
                    <><div style={{ width: 16, height: 16, border: "2px solid #000", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> Closing accounts...</>
                  ) : `Close ${selectedCount} accounts & recover SOL`}
                </button>
              </div>
            )}

            {/* Success */}
            {done && (
              <div style={{ background: "#0a2a0a", border: "1px solid #4ade8044", borderRadius: 16, padding: 16, marginBottom: 12, fontSize: 13, color: "#4ade80", fontWeight: 700, textAlign: "center" }}>
                {done}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: "#2a0a0a", border: "1px solid #f8717144", borderRadius: 16, padding: 16, marginBottom: 12, fontSize: 12, color: "#f87171", textAlign: "center" }}>
                {error}
              </div>
            )}
          </>
        )}

        {/* Confirm Modal */}
        {showConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#111", border: "1px solid #f8717144", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%" }}>
              <div style={{ fontSize: 24, marginBottom: 12, textAlign: "center" }}>⚠️</div>
              <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>Are you sure?</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 20, textAlign: "center", lineHeight: 1.6 }}>
                You are about to close <strong style={{ color: "#fff" }}>{selectedCount} token accounts</strong> and recover <strong style={{ color: "#4ade80" }}>~{totalRecoverable.toFixed(4)} SOL</strong>.<br /><br />
                This action is <strong style={{ color: "#f87171" }}>irreversible</strong>. Make sure these accounts are no longer needed.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex: 1, background: "transparent", border: "1px solid #333", borderRadius: 12, padding: 14, color: "#888", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                <button onClick={closeSelected} style={{ flex: 1, background: "#4ade80", border: "none", borderRadius: 12, padding: 14, color: "#000", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>Confirm & Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div style={{ background: "#1a0f00", border: "1px solid #f59e0b44", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 800, marginBottom: 6 }}>⚠️ Important</div>
          <div style={{ fontSize: 10, color: "#888", lineHeight: 1.7 }}>
            Only empty token accounts (0 balance) are shown. Closing an account is <strong style={{ color: "#fff" }}>irreversible</strong> — you will lose access to that token account permanently. You recover the SOL rent deposit (~0.002 SOL per account).<br /><br />
            TEFT Legion is not responsible for any loss. By using this tool you agree to our <a href="/terms" style={{ color: "#f59e0b", textDecoration: "underline" }}>Terms of Service</a>.<br /><br />
            <strong style={{ color: "#f59e0b" }}>Note:</strong> Closing accounts may disqualify you from future airdrops that target existing token account holders.
          </div>
        </div>

      </div>
    </div>
  );
}
