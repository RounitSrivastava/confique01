"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Leaderboard() {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [sorted, setSorted] = useState([]);
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
      <div className="fixed inset-0 flex items-center justify-center bg-bg-1 text-text-1">
        Loading...
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
    <div className="fixed inset-0 w-screen h-screen overflow-y-auto bg-gradient-to-br from-[#0b1d3a] via-[#142850] to-[#0b1d3a] text-text-1 z-[9999]">

      {/* Back Button */}
      <button
        onClick={() => router.push("/quizzes")}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-blue-200 hover:text-text-1 transition text-sm sm:text-base"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-10">

        <div className="relative w-full max-w-[650px] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-blue-400/40 shadow-[0_0_50px_rgba(59,130,246,0.5)] bg-bg-2">

          {/* Title */}
          <div className="flex justify-center mb-6 sm:mb-10">
            <div className="relative px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl border border-blue-400/40 bg-bg-3 text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.18em] sm:tracking-[0.28em] shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <div className="absolute inset-0 rounded-2xl blur-lg bg-blue-500/20 opacity-30"></div>

              <div className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200">
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
              {sorted.map((player, index) => {
                const prevRank = previousRanks.current[player.userName];
                const rankChange =
                  prevRank !== undefined ? prevRank - index : 0;

                const isCurrentUser = player.userName === userName;

                return (
                  <motion.div
                    key={player._id || player.userName}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 rounded-xl border transition-all duration-500 ${
                      isCurrentUser
                        ? "bg-green-600/30 border-green-400 scale-[1.02] sm:scale-105 shadow-lg"
                        : "bg-blue-700/30 border-blue-400/20"
                    }`}
                  >

                    {/* Left */}
                    <div className="flex items-center gap-3 sm:gap-5">

                      {/* Rank */}
                      <div className="text-lg sm:text-2xl w-7 sm:w-10 text-center flex items-center gap-1">
                        {getMedal(index)}

                        {rankChange > 0 && (
                          <span className="text-green-400 text-xs sm:text-sm animate-pulse">
                            ↑
                          </span>
                        )}

                        {rankChange < 0 && (
                          <span className="text-red-400 text-xs sm:text-sm animate-pulse">
                            ↓
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm sm:text-lg">
                        {player.userName?.charAt(0).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div>
                        <div className="font-semibold text-sm sm:text-lg truncate max-w-[120px] sm:max-w-none">
                          {player.userName}
                        </div>

                        <div className="text-xs text-blue-200">
                          ⏱ {formatTime(player.timeTaken)}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-lg sm:text-xl font-bold text-blue-200">
                      {player.score}
                    </div>

                  </motion.div>
                );
              })}
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