"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navigation from "@/app/components/Navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function CreatorJoin() {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setDisplayName(session.user.user_metadata.full_name || session.user.user_metadata.user_name || "");
      }
    };
    checkUser();
  }, []);

  const handleXLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: window.location.origin + '/creators/join' }
    });
  };

  const handleComplete = async () => {
    if (!connected || !user) return;
    const { error } = await supabase.from("creators").upsert({
      wallet_address: publicKey?.toString(),
      display_name: displayName,
      username: user.user_metadata.user_name,
      avatar_url: user.user_metadata.avatar_url,
      is_verified: true
    });
    if (!error) {
      alert("LEGION ACCESS GRANTED");
      window.location.href = "/creators";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased">
      <Navigation />
      <main className="flex flex-col items-center justify-center pt-40 pb-20 px-6">
        <div className="bg-white rounded-[4rem] p-12 max-w-lg w-full shadow-sm border border-black/[0.01]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-[900] uppercase tracking-tighter mb-2">Identity Link</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">X-Verified Creator Access</p>
          </div>

          <div className="space-y-4">
            <div className={`p-8 rounded-[2.5rem] border transition-all ${connected ? 'bg-green-50/50 border-green-100' : 'bg-zinc-50 border-zinc-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-[900] uppercase tracking-widest text-zinc-400">Step 1: Wallet</p>
                {connected && <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Linked</span>}
              </div>
              {!connected ? (
                <div className="mt-2 wallet-adapter-custom">
                   <WalletMultiButton className="!bg-black !rounded-2xl !text-[10px] !font-black !uppercase !w-full !justify-center !h-14" />
                </div>
              ) : (
                <h3 className="text-sm font-black uppercase tracking-tight truncate">{publicKey?.toString()}</h3>
              )}
            </div>

            <div className={`p-8 rounded-[2.5rem] border transition-all ${user ? 'bg-green-50/50 border-green-100' : 'bg-zinc-50 border-zinc-100'}`}>
              <p className="text-[10px] font-[900] uppercase tracking-widest mb-2 text-zinc-400">Step 2: X Identity</p>
              {!user ? (
                <button onClick={handleXLogin} className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-2">Verify with X</button>
              ) : (
                <div className="flex items-center gap-4 mt-2">
                  <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-full" />
                  <h3 className="text-sm font-black uppercase tracking-tight">@{user.user_metadata.user_name}</h3>
                </div>
              )}
            </div>

            <div className="p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] font-[900] uppercase tracking-widest mb-2 text-zinc-400">Display Name</p>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="YOUR NAME" className="w-full bg-transparent border-none p-0 text-xl font-black uppercase placeholder:text-zinc-200 focus:ring-0" />
            </div>

            <button disabled={!connected || !user} onClick={handleComplete} className={`w-full py-7 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all mt-8 ${connected && user ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}>
              {connected && user ? "Complete Mission" : "Connect Wallet & X"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
