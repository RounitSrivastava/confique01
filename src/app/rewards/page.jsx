"use client";
import React, { useState, useEffect } from "react";
import { Gift, Copy, Check, Users, Trophy, Sparkles, Shield, Medal, Crown, Zap } from "lucide-react";

export default function RewardsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (user?.referralCode) {
      // window.location.origin automatically gives:
      //   http://localhost:3000  (dev)
      //   https://confique.com   (production)
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setInviteLink(`${origin}/auth/register?ref=${user.referralCode}`);
    }
  }, [user?.referralCode]);

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c084fc] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-text-1 p-6 text-center">
        <Gift className="w-16 h-16 text-[#c084fc] mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Please log in</h2>
        <p className="text-text-3">You need to log in to view your rewards and invite links.</p>
      </div>
    );
  }

  const rank = user.points >= 5000 ? "Legend" : user.points >= 1500 ? "Ambassador" : user.points >= 500 ? "Pioneer" : "Scout";
  
  let rankColor = "text-text-2 font-medium"; // Scout
  if (rank === "Legend") rankColor = "text-yellow-400 font-extrabold tracking-wide drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
  if (rank === "Ambassador") rankColor = "text-[#c084fc] font-bold";
  if (rank === "Pioneer") rankColor = "text-cyan-400 font-semibold";

  const getBadgeUI = (rankName) => {
    switch(rankName) {
      case "Scout":
        return (
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-[3px] border-gray-500 shadow-[0_0_15px_rgba(156,163,175,0.2)] mb-3">
            <Medal className="w-10 h-10 text-gray-200 drop-shadow-md" />
          </div>
        );
      case "Pioneer":
        return (
          <div className="w-20 h-20 p-1 bg-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-3 flex items-center justify-center relative" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center relative z-10" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
              <Shield className="w-10 h-10 text-text-1 drop-shadow-md" />
            </div>
          </div>
        );
      case "Ambassador":
        return (
          <div className="w-20 h-20 p-[3px] bg-fuchsia-300 shadow-[0_0_25px_rgba(192,132,252,0.5)] mb-3 flex items-center justify-center relative" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            <div className="w-full h-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center relative z-10" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
              <Zap className="w-9 h-9 text-text-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
        );
      case "Legend":
        return (
          <div className="w-24 h-24 p-1.5 bg-yellow-300 shadow-[0_0_35px_rgba(251,191,36,0.6)] mb-3 flex items-center justify-center relative animate-pulse" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center relative z-10" style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}>
              <Crown className="w-11 h-11 text-yellow-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        );
      default:
        return <Trophy className="w-8 h-8 text-text-4 mb-3" />;
    }
  };

  return (
    <div className="min-h-screen text-text-1 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border-2 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#c084fc]/10 rounded-xl">
              <Gift className="w-6 h-6 text-[#c084fc]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Invite & Earn Rewards</h1>
              <p className="text-sm text-text-3">Invite your friends and earn points convertible to real money.</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-2 border border-border-2 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-[#c084fc] mb-3" />
            <h3 className="text-3xl font-bold text-text-1 mb-1">{user.points || 0}</h3>
            <p className="text-sm text-text-3">Total Points</p>
          </div>

          <div className="bg-bg-2 border border-border-2 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-3xl font-bold text-text-1 mb-1">{user.totalReferrals || 0}</h3>
            <p className="text-sm text-text-3">Friends Invited</p>
          </div>

          <div className="bg-bg-2 border border-border-2 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            {getBadgeUI(rank)}
            <h3 className={`text-2xl mb-1 ${rankColor}`}>{rank}</h3>
            <p className="text-sm text-text-3">Current Rank</p>
          </div>
        </div>

        {/* Invite Link Section */}
        <div className="bg-bg-2 border border-border-2 rounded-2xl p-6 md:p-8 mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Gift className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-text-1 mb-2">Share your Invite Link</h3>
            <p className="text-sm text-text-3 mb-6 max-w-xl">
              When your friends join Confique using this link, they get a <span className="text-green-400 font-semibold">75 points</span> sign-up bonus, and you earn <span className="text-[#c084fc] font-semibold">150 points</span> instantly!
            </p>

            {user.referralCode ? (
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full max-w-2xl">
                <div className="flex-1 bg-bg-1 border border-border-1 rounded-xl px-4 py-3 font-mono text-sm text-text-2 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                  {inviteLink}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#c084fc] hover:bg-[#a855f7] text-text-1 font-medium flex items-center justify-center gap-2 transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            ) : (
              <div className="text-sm text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 inline-block">
                Referral system was just enabled. Please contact support or re-login to generate your code.
              </div>
            )}
          </div>
        </div>
        
        {/* Info Box */}
        <div className="bg-bg-4 border border-border-2 rounded-2xl p-6 text-sm text-text-3 leading-relaxed">
          <h4 className="font-semibold text-text-2 mb-2">How do rewards work?</h4>
          <p>
            Every time a new user registers using your unique invite link, your points will automatically increase. We are currently working on a feature that will allow you to redeem these points directly into money or exclusive platform prizes. Stay tuned!
          </p>
        </div>

      </div>
    </div>
  );
}
