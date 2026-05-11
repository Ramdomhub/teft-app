"use client";
import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction, TransactionInstruction, PublicKey, SystemProgram } from "@solana/web3.js";
import dynamic from "next/dynamic";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const WalletButton = dynamic(() => Promise.resolve(({ style }: { style?: React.CSSProperties }) => {
  const [mounted, setMounted] = useState(false);
  if (typeof window !== "undefined" && !mounted) setMounted(true);
  if (!mounted) return null;
  return <WalletMultiButton style={style} />;
}), { ssr: false });

export default function MemoSenderPage() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const memoLength = new TextEncoder().encode(memo).length;
  const maxMemo = 566;

  const send = useCallback(async () => {
    if (!publicKey) return;
    setError(null);
    setDone(null);
    setSending(true);
    try {
      let recipientKey: PublicKey;
      try { recipientKey = new PublicKey(recipient); }
      catch { throw new Error("Invalid recipient address"); }

      const lamports = Math.floor(parseFloat(amount) * 1e9);
      if (isNaN(lamports) || lamports < 0) throw new Error("Invalid amount");

      const tx = new Transaction();

      // Add memo instruction if memo is provided
      if (memo.trim()) {
        tx.add(new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo, "utf8"),
        }));
      }

      // Add SOL transfer if amount > 0
      if (lamports > 0) {
        tx.add(SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientKey,
          lamports,
        }));
      }

      if (tx.instructions.length === 0) throw new Error("Add a memo or amount");

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setDone(`✅ Sent! Signature: ${sig.slice(0, 16)}...`);
      setRecipient("");
      setAmount("");
      setMemo("");
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  }, [publicKey, recipient, amount, memo, sendTransaction, connection]);

  const isValid = publicKey && recipient.length > 30 && (memo.trim().length > 0 || parseFloat(amount) > 0) && memoLength <= maxMemo;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} .wallet-adapter-button{background:#1a1a1a!important;color:#fff!important;border-radius:10px!important;font-weight:800!important;font-size:11px!important;height:36px!important;padding:0 16px!important;}`}</style>

      {/* Header */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src="/teft.png" alt="TEFT" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.5 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 100%)" }} />
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/terminal" style={{ color: "#888", fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.1em" }}>← Terminal</a>
          <WalletButton />
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Memo Sender</h1>
          <p style={{ margin: "2px 0 0", color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>SEND SOL WITH AN ON-CHAIN MESSAGE</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Info */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>HOW IT WORKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "📝", text: "Write a message (up to 566 characters)" },
              { icon: "💸", text: "Optionally send SOL with the message" },
              { icon: "⛓️", text: "Message is stored permanently on Solana" },
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
            <div style={{ fontSize: 11, color: "#444", marginBottom: 20 }}>to send memos on-chain</div>
            <div style={{ display: "flex", justifyContent: "center" }}><WalletButton /></div>
          </div>
        ) : (
          <>
            {/* Form */}
            <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>TRANSACTION</div>

              {/* Recipient */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em", marginBottom: 6 }}>RECIPIENT WALLET</div>
                <input
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="Solana wallet address..."
                  style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em", marginBottom: 6 }}>AMOUNT (SOL) — OPTIONAL</div>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.001"
                  style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Memo */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: "#444", fontWeight: 800, letterSpacing: "0.08em" }}>MEMO MESSAGE</div>
                  <div style={{ fontSize: 9, color: memoLength > maxMemo ? "#f87171" : "#444" }}>{memoLength}/{maxMemo}</div>
                </div>
                <textarea
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="Write your on-chain message here..."
                  rows={4}
                  style={{ width: "100%", background: "#111", border: `1px solid ${memoLength > maxMemo ? "#f8717144" : "#222"}`, borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>

            {/* Send Button */}
            <button onClick={send} disabled={!isValid || sending} style={{ width: "100%", background: !isValid ? "#111" : "#fff", color: !isValid ? "#444" : "#000", border: "none", borderRadius: 16, padding: 16, fontSize: 13, fontWeight: 900, cursor: !isValid ? "not-allowed" : "pointer", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {sending ? (
                <><div style={{ width: 16, height: 16, border: "2px solid #333", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> Sending...</>
              ) : "Send on-chain ↗"}
            </button>

            {done && (
              <div style={{ background: "#0a2a0a", border: "1px solid #4ade8044", borderRadius: 16, padding: 16, marginBottom: 12, fontSize: 12, color: "#4ade80", fontWeight: 700, textAlign: "center" }}>
                {done}
              </div>
            )}
            {error && (
              <div style={{ background: "#2a0a0a", border: "1px solid #f8717144", borderRadius: 16, padding: 16, marginBottom: 12, fontSize: 12, color: "#f87171", textAlign: "center" }}>
                {error}
              </div>
            )}
          </>
        )}

        <div style={{ background: "#1a0f00", border: "1px solid #f59e0b44", borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 800, marginBottom: 6 }}>⚠️ Important</div>
          <div style={{ fontSize: 10, color: "#888", lineHeight: 1.7 }}>
            Messages are stored <strong style={{ color: "#fff" }}>permanently</strong> on the Solana blockchain and <strong style={{ color: "#fff" }}>cannot be deleted</strong>. Do not send sensitive, private, or illegal content. A small network fee (~0.000005 SOL) applies.<br /><br />
            TEFT Legion is not responsible for the content of messages sent. By using this tool you agree to our <a href="/terms" style={{ color: "#f59e0b", textDecoration: "underline" }}>Terms of Service</a>.
          </div>
        </div>

      </div>
    </div>
  );
}
