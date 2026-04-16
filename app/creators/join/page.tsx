"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useSearchParams } from "next/navigation";

function JoinContent() {
  const { publicKey } = useWallet();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const referredBy = searchParams.get("ref");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { 
        redirectTo: window.location.origin + '/creators/join'
      }
    });
    if (error) console.error("Login error:", error.message);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setDisplayName(data.user.user_metadata.full_name || "");
      }
    });
  }, []);

  const canApply = publicKey && user && displayName.length > 2;

  const handleCreateProfile = async () => {
    if (!canApply) return;
    const username = user.user_metadata.user_name || user.user_metadata.name;
    const { error } = await supabase.from("creators").insert({
      wallet_address: publicKey.toBase58(),
      username: username.toLowerCase().replace(/\s+/g, ''),
      display_name: displayName,
      avatar_url: user.user_metadata.avatar_url,
      referred_by: referredBy,
      status: 'pending'
    });

    if (error) alert("This wallet or X account is already registered.");
    else {
      alert("Verification request sent to the Legion!");
      router.push('/creators');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col items-center pt-40 px-4 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-[440px] bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-black/[0.02] border border-white text-center">
        <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase leading-none">Identity Link</h1>
        <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12">X-Verified Creator Access</p>
        
        <div className="space-y-6 text-left">
          
          {/* STEP 1: WALLET */}
          <div className={`p-6 rounded-3xl border transition-all ${publicKey ? 'bg-green-50 border-green-100' : 'bg-[#f5f5f7] border-black/[0.01]'}`}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">Step 1: Wallet</p>
              {publicKey && <span className="text-[10px] font-black text-green-600 uppercase">Linked</span>}
            </div>
            {publicKey ? (
              <p className="font-black text-[11px] truncate text-green-700">{publicKey.toBase58()}</p>
            ) : (
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest italic">Connect via Header</p>
            )}
          </div>

          {/* STEP 2: X IDENTITY */}
          <div className={`p-6 rounded-3xl border transition-all ${user ? 'bg-green-50 border-green-100' : 'bg-[#f5f5f7] border-black/[0.01]'}`}>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-4">Step 2: X Identity</p>
            
            {user ? (
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-black/[0.03] animate-in fade-in zoom-in-95">
                <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                <div className="overflow-hidden">
                  <p className="font-black text-xs truncate">@{user.user_metadata.user_name}</p>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">X Verified</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin} 
                className="w-full py-5 bg-black text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Verify with X
              </button>
            )}
          </div>

          {/* FINAL STEP: APPLY */}
          <div className="pt-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-300 mb-4 ml-2">Display Name</p>
            <input 
              className="w-full p-6 bg-[#f5f5f7] rounded-3xl border-none outline-none font-black text-sm mb-6 focus:ring-2 ring-black/5 transition-all uppercase" 
              placeholder="Your Name" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
            />
            <button 
              onClick={handleCreateProfile} 
              disabled={!canApply}
              className={`w-full py-7 font-black rounded-[2.2rem] text-[11px] shadow-2xl transition-all uppercase tracking-[0.3em] ${canApply ? 'bg-black text-white shadow-black/20 hover:scale-[1.02] active:scale-95' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
            >
              {canApply ? 'Apply to Legion' : 'Complete Steps 1 & 2'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return <Suspense><JoinContent /></Suspense>;
}
