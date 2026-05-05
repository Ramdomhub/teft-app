export default function TermsPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#000", color:"#fff", fontFamily:"'DM Mono',monospace", padding:"60px 24px", maxWidth:640, margin:"0 auto" }}>
      <a href="/" style={{ color:"#444", textDecoration:"none", fontSize:11, letterSpacing:2 }}>← TEFTLEGION</a>
      <h1 style={{ fontSize:28, fontWeight:900, margin:"24px 0 8px", letterSpacing:-1 }}>Terms of Service</h1>
      <p style={{ color:"#444", fontSize:11, marginBottom:40 }}>Last updated: May 2026</p>

      {[
        ["1. Acceptance", "By accessing teftlegion.com, you agree to these terms. If you do not agree, do not use the platform."],
        ["2. Description", "TEFT Legion provides token-gated tools for TEFT holders on Solana, including TEFT Pulse (smart wallet signals) and TEFT Identity (on-chain profiles)."],
        ["3. No Financial Advice", "Nothing on this platform constitutes financial advice. TEFT Pulse signals are for informational purposes only. Always do your own research (DYOR). Crypto assets are high risk and many tokens will fail."],
        ["4. Token Gate", "Access to certain features requires holding TEFT tokens. We reserve the right to change minimum holding requirements at any time."],
        ["5. No Guarantees", "We do not guarantee accuracy, uptime, or profitability of any signals or data provided. Use at your own risk."],
        ["6. X Authentication", "When you connect your X account, we store only your X handle to display on your TEFT Identity card. We do not post on your behalf."],
        ["7. Changes", "We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms."],
        ["8. Contact", "For questions, reach us on X @TEFTofficial or Telegram t.me/teftlegionofficial"],
      ].map(([title, text]) => (
        <div key={title as string} style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:1 }}>{title}</h2>
          <p style={{ fontSize:12, color:"#555", lineHeight:1.8 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}
