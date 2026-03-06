"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const menuRef = useRef(null);

  /* ================= AUTH CHECK ================= */

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!res.ok || !data.user?.id) {
          router.replace(`/auth/login?redirect=${encodeURIComponent("/quizzes")}`);
          return;
        }

        setCurrentUserId(data.user.id);
      } catch (err) {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  /* ================= LOAD QUIZZES ================= */

  useEffect(() => {
    if (!currentUserId) return;

    const loadQuizzes = async () => {
      try {
        const res = await fetch("/api/quizzes", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load quizzes");
        setQuizzes(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [currentUserId]);

  /* ================= LIVE CLOCK ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FILTERING ================= */

  const scheduled = quizzes.filter(
    (q) => q.startAt && q.startAt > now
  );

  const ongoing = quizzes.filter(
    (q) =>
      (!q.startAt || q.startAt <= now) &&
      (!q.closeAt || q.closeAt > now)
  );

  const previous = quizzes.filter(
    (q) => q.closeAt && q.closeAt <= now
  );

  /* ================= DELETE ================= */

  const deleteQuiz = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      setOpenMenu(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ================= QUIZ CARD ================= */

  const QuizCard = ({ quiz, isPrevious }) => {
    const isScheduled = quiz.startAt && quiz.startAt > now;
    const isOngoing =
      (!quiz.startAt || quiz.startAt <= now) &&
      (!quiz.closeAt || quiz.closeAt > now);
    const alreadyAttempted = quiz.hasAttempted;

    const isOwner =
      currentUserId &&
      quiz.createdBy &&
      currentUserId.toString() === quiz.createdBy.toString();

    const handlePlayClick = () => {
      if (alreadyAttempted) return;
      router.push(`/quizzes/${quiz._id}`);
    };

    /* ===== Countdown Function ===== */

    const getTimeLeft = (targetTime) => {
      if (!targetTime) return null;

      const diff = targetTime - now;
      if (diff <= 0) return null;

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${days > 0 ? days + "d " : ""}${hours}h ${minutes}m ${seconds}s`;
    };

    return (
     <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e2f] via-[#1a1a2e] to-[#12121c] backdrop-blur-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
        {/* ===== Scheduled Timer ===== */}
        {isScheduled && (
          <div className="absolute top-4 right-4 text-xs font-semibold bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full">
            ⏳{getTimeLeft(quiz.startAt)}
          </div>
        )}

        {/* ===== Ongoing Close Timer ===== */}
        {isOngoing && !isScheduled && quiz.closeAt && (
          <div className="absolute top-4 right-4 text-xs font-semibold bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full">
             {getTimeLeft(quiz.closeAt)}
          </div>
        )}

        {/* ===== Owner Menu ===== */}
        {isOwner && (
          <div
            className="absolute top-12 right-4"
            ref={openMenu === quiz._id ? menuRef : null}
          >
            <button
              onClick={() =>
                setOpenMenu(openMenu === quiz._id ? null : quiz._id)
              }
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <MoreVertical size={18} />
            </button>

            {openMenu === quiz._id && (
              <div className="absolute right-0 mt-2 w-36 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <button
                  onClick={() =>
                    router.push(`/quizzes/create?edit=${quiz._id}`)
                  }
                  className="w-full text-left px-4 py-2 text-sm hover:bg-purple-600/20 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteQuiz(quiz._id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">
          {quiz.title}
        </h3>

        <p className="text-sm text-gray-400 mb-6">
          {quiz.questions?.length || 0} Questions
        </p>

        {!isPrevious && (
          <div className="flex gap-4 flex-wrap">
            {isScheduled ? (
              <button disabled className="bg-gray-700 px-4 py-2 rounded-lg text-sm opacity-60">
                Starts Soon
              </button>
            ) : alreadyAttempted ? (
              <button disabled className="bg-gray-700 px-4 py-2 rounded-lg text-sm opacity-60">
                Attempted
              </button>
            ) : (
              <button
                onClick={handlePlayClick}
                className="bg-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
              >
                Play Quiz
              </button>
            )}

            <button
              onClick={() =>
                router.push(`/quizzes/${quiz._id}/leaderboard`)
              }
              className="border border-purple-500 px-4 py-2 rounded-lg text-sm hover:bg-purple-600/20 transition"
            >
              Leaderboard
            </button>
          </div>
        )}

        {isPrevious && (
          <button
            onClick={() =>
              router.push(`/quizzes/${quiz._id}/leaderboard`)
            }
            className="bg-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
          >
            View Leaderboard
          </button>
        )}
      </div>
    );
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-6 py-10">

      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage and track your quizzes easily
          </p>
        </div>

        <button
          onClick={() => router.push("/quizzes/create")}
          className="bg-purple-600 px-6 py-2 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-500/20"
        >
          + Create
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">
          Loading quizzes...
        </div>
      ) : (
        <>
          <Section title="⏳ Scheduled Quizzes" data={scheduled} />
          <Section title="🔥 Ongoing Quizzes" data={ongoing} />
          <Section title="🕒 Previous Quizzes" data={previous} isPrevious />
        </>
      )}
    </div>
  );

  function Section({ title, data, isPrevious = false }) {
    return (
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>

        {data.length === 0 ? (
          <p className="text-gray-500">No quizzes available.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {data.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                isPrevious={isPrevious}
              />
            ))}
          </div>
        )}
      </section>
    );
  }
}