"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function LeaderboardClient({ initialQuiz, initialSorted }) {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(initialQuiz);
  const [sorted, setSorted] = useState(initialSorted || []);
  const [userName, setUserName] = useState(null);
  const previousRanks = useRef({});

  /* ---------------- LOCK BODY SCROLL ---------------- */

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  /* ---------------- FETCH CURRENT USER ---------------- */

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();

      if (data?.user) {
        setUserName(data.user.username);
      }
    };

    loadUser();
  }, []);

  /* ---------------- FETCH QUIZ + AUTO REFRESH ---------------- */

  useEffect(() => {
    if (!quizId) return;

    const loadQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, {
          cache: "no-store",
        });

        const data = await res.json();
        if (!data) return;

        const locked = data.closeAt && Date.now() > data.closeAt;

        setQuiz({ ...data, locked });

        const leaderboard = data.leaderboard || [];

        const sortedData = [...leaderboard].sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (a.timeTaken !== b.timeTaken)
            return a.timeTaken - b.timeTaken;
          return a.submittedAt - b.submittedAt;
        });

        // 🎉 Confetti if current user becomes #1
        if (
          sortedData.length > 0 &&
          sortedData[0].userName === userName &&
          previousRanks.current[userName] !== 0
        ) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        const newRanks = {};
        sortedData.forEach((p, i) => {
          newRanks[p.userName] = i;
        });

        previousRanks.current = newRanks;
        setSorted(sortedData);
      } catch (err) {
        console.error("Failed to load leaderboard");
      }
    };

    loadQuiz();
    const interval = setInterval(loadQuiz, 3000);

    return () => clearInterval(interval);
  }, [quizId, userName]);

  if (!quiz) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8f9fc] dark:bg-gradient-to-br dark:from-[#0b1d3a] dark:via-[#142850] dark:to-[#0b1d3a] z-[9999]">
        <div className="w-12 h-12 border-4 border-[#a22df6] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(162,45,246,0.5)]"></div>
      </div>
    );
  }

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-y-auto bg-[#f8f9fc] dark:bg-gradient-to-br dark:from-[#0b1d3a] dark:via-[#142850] dark:to-[#0b1d3a] text-gray-900 dark:text-white z-[9999] font-sans">

      {/* Back Button */}
      <button
        onClick={() => router.push("/quizzes")}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition font-medium text-sm sm:text-base"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-8 sm:pt-20 sm:pb-10">

        <div className="relative w-full max-w-[650px] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_50px_rgba(162,45,246,0.15)] bg-white dark:bg-[#0a1326]">

          {/* Title */}
          <div className="flex justify-center mb-6 sm:mb-10">
            <div className="relative px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#142850] text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.18em] sm:tracking-[0.28em] shadow-sm">
              <div className="relative z-10 text-gray-900 dark:text-white">
                LEADERBOARD
              </div>
            </div>
          </div>

          {/* Locked Message */}
          {quiz.locked && (
            <div className="text-center text-red-400 mb-6 font-semibold">
              🔒 Quiz Ended — Leaderboard Locked
            </div>
          )}

          {/* Players */}
          <div className="space-y-3 sm:space-y-4 max-h-[65vh] overflow-y-auto scrollbar-hide">

            <AnimatePresence>
              {(() => {
                let displayPlayers = sorted.slice(0, 10);
                const currentUserIndex = sorted.findIndex(p => p.userName === userName);
                
                // If current user is not in top 10 but participated, add them to the end
                if (currentUserIndex >= 10) {
                  displayPlayers.push(sorted[currentUserIndex]);
                }

                return displayPlayers.map((player) => {
                  const actualIndex = sorted.findIndex(p => p.userName === player.userName);
                  const prevRank = previousRanks.current[player.userName];
                  const rankChange =
                    prevRank !== undefined ? prevRank - actualIndex : 0;

                const isCurrentUser = player.userName === userName;

                return (
                  <motion.div
                    key={player._id || player.userName}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-500 ${
                      isCurrentUser
                        ? "bg-green-50 dark:bg-green-600/30 border-2 border-green-500 scale-[1.02] sm:scale-105 shadow-md"
                        : "bg-white dark:bg-[#1a2c4e]/50 border border-gray-100 dark:border-[#a22df6]/20 shadow-sm"
                    }`}
                  >

                    {/* Left */}
                    <div className="flex items-center gap-3 sm:gap-5">

                      {/* Rank */}
                      <div className="text-lg sm:text-2xl w-7 sm:w-10 text-center flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                        {getMedal(actualIndex)}

                        {rankChange > 0 && (
                          <span className="text-green-500 dark:text-green-400 text-xs sm:text-sm animate-pulse">
                            ↑
                          </span>
                        )}

                        {rankChange < 0 && (
                          <span className="text-red-500 dark:text-red-400 text-xs sm:text-sm animate-pulse">
                            ↓
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm sm:text-lg text-gray-600 dark:text-white">
                        {player.userName?.charAt(0).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div>
                        <div className="font-bold text-sm sm:text-lg truncate max-w-[120px] sm:max-w-none text-gray-900 dark:text-white">
                          {player.userName}
                        </div>

                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          ⏱ {formatTime(player.timeTaken)}
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-xl sm:text-2xl font-black text-[#a22df6] dark:text-[#b45cf9]">
                      {player.score}
                    </div>
                  </motion.div>
                );
              })})()}
            </AnimatePresence>
            {sorted.length === 0 && (
              <div className="text-center text-text-3">
                No submissions yet.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}