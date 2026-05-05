export default function PrivacyPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#000", color:"#fff", fontFamily:"'DM Mono',monospace", padding:"60px 24px", maxWidth:640, margin:"0 auto" }}>
      <a href="/" style={{ color:"#444", textDecoration:"none", fontSize:11, letterSpacing:2 }}>← TEFTLEGION</a>
      <h1 style={{ fontSize:28, fontWeight:900, margin:"24px 0 8px", letterSpacing:-1 }}>Privacy Policy</h1>
      <p style={{ color:"#444", fontSize:11, marginBottom:40 }}>Last updated: May 2026</p>

      {[
        ["1. Data We Collect", "We collect wallet addresses, TEFT token balances, and optionally X handles when you connect your X account. We also store referral relationships between wallets."],
        ["2. How We Use Data", "Wallet addresses and balances are used to display your TEFT Identity card and calculate your rank. X handles are displayed on your identity card if you choose to connect."],
        ["3. Data Storage", "Data is stored in Supabase (PostgreSQL). We do not sell or share your data with third parties."],
        ["4. X Authentication", "When connecting X, we receive your public X username only. We do not access your DMs, followers, or post on your behalf."],
        ["5. Cookies", "We use minimal session cookies required for X authentication via NextAuth. No tracking or advertising cookies are used."],
        ["6. Blockchain Data", "Wallet addresses and on-chain transactions are public by nature of the Solana blockchain. We only read this data, we do not modify it."],
        ["7. Data Deletion", "To delete your data, contact us on X @TEFTofficial. We will remove your record from our database within 7 days."],
        ["8. Contact", "For privacy questions, reach us on X @TEFTofficial or Telegram t.me/teftlegionofficial"],
      ].map(([title, text]) => (
        <div key={title as string} style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:1 }}>{title}</h2>
          <p style={{ fontSize:12, color:"#555", lineHeight:1.8 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}
