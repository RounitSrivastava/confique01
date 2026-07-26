"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Bell, Database, Cloud, Terminal, Palette, MonitorPlay, Code, HelpCircle, Play, Calendar, Trophy, Check, Share2 } from "lucide-react";

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  /* ================= NOTIFICATION SOUND ================= */
  const bellAudioRef = useRef(null);
  useEffect(() => {
    if (typeof Audio !== "undefined") {
      try {
        const audio = new Audio("/bell-ring-390294.mp3");
        audio.volume = 1;
        bellAudioRef.current = audio;
      } catch {}
    }
  }, []);

  const playBellSound = () => {
    if (bellAudioRef.current) {
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.play().catch(() => {});
    }
  };

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  /* ================= SHARE QUIZ ================= */
  const handleShare = (quizId) => {
    const url = `${window.location.origin}/quizzes/${quizId}`;
    if (navigator.share) {
      navigator.share({
        title: "Confique Quiz",
        text: "Check out this upcoming quiz!",
        url,
      }).catch(err => console.error("Share failed", err));
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  /* ================= SET REMINDER ================= */
  const handleSetReminder = async (quiz) => {
    if (!currentUserEmail) {
      alert("You need to be logged in to set a reminder.");
      return;
    }

    try {
      const reminders = JSON.parse(localStorage.getItem("quiz_reminders") || "[]");
      if (reminders.some(r => r.id === quiz._id)) {
        alert("Reminder already set for this quiz!");
        return;
      }

      reminders.push({
        id: quiz._id,
        title: quiz.title,
        startAt: new Date(quiz.startAt).getTime(),
        email: currentUserEmail
      });
      localStorage.setItem("quiz_reminders", JSON.stringify(reminders));
      
      alert("Reminder set successfully! You will be notified when the quiz starts.");
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  };

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
        setCurrentUserEmail(data.user.email);
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

  /* ================= LIVE CLOCK & REMINDERS ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setNow(new Date(currentTime));
      
      try {
        const storedReminders = localStorage.getItem("quiz_reminders");
        if (storedReminders) {
          let reminders = JSON.parse(storedReminders);
          let modified = false;
          
          for (let i = reminders.length - 1; i >= 0; i--) {
            const r = reminders[i];
            if (currentTime >= r.startAt) {
              // Time to trigger!
              playBellSound();
              // Try creating browser notification if granted
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Quiz Starting Now!", { body: `Your quiz "${r.title}" has started!` });
              } else {
                alert(`🔔 REMINDER: Your quiz "${r.title}" is starting NOW!`);
              }
              
              // Persist to backend notification center
              fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  targetEmail: r.email,
                  type: "REMINDER",
                  message: `Your quiz "${r.title}" is starting now!`,
                  postId: r.id,
                })
              }).catch(() => {});
              
              // Remove from queue
              reminders.splice(i, 1);
              modified = true;
            }
          }
          if (modified) {
            localStorage.setItem("quiz_reminders", JSON.stringify(reminders));
          }
        }
      } catch (err) {}
    }, 1000);
    
    // Request notification permission if needed
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    return () => clearInterval(interval);
  }, []);

  /* ================= CATEGORIZE QUIZZES ================= */
  const scheduled = quizzes.filter((q) => q.startAt && new Date(q.startAt) > now).sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  const ongoing = quizzes.filter((q) => (!q.startAt || new Date(q.startAt) <= now) && (!q.closeAt || new Date(q.closeAt) > now)).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const completed = quizzes.filter((q) => q.closeAt && new Date(q.closeAt) <= now).sort((a, b) => new Date(b.closeAt) - new Date(a.closeAt));

  // The featured quiz is the most recently completed one, or the most recent ongoing if no completed.
  const featuredQuiz = completed.length > 0 ? completed[0] : (ongoing.length > 0 ? ongoing[0] : null);
  const otherCompleted = completed.filter(q => featuredQuiz && q._id !== featuredQuiz._id);
  const displayOngoing = ongoing.filter(q => featuredQuiz && q._id !== featuredQuiz._id);

  /* ===== Helpers ===== */
  const getTimeLeft = (targetTime) => {
    if (!targetTime) return null;
    const diff = new Date(targetTime).getTime() - now.getTime();
    if (diff <= 0) return null;
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 24) return `Starts in ${Math.floor(hours/24)} days`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    if (minutes > 0) return `Starts in ${minutes}m ${seconds}s`;
    return `Starts in ${seconds}s`;
  };

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("python") || t.includes("code") || t.includes("dev")) return <Terminal size={20} className="text-purple-600 dark:text-purple-400" />;
    if (t.includes("sql") || t.includes("data")) return <Database size={20} className="text-gray-700 dark:text-gray-300" />;
    if (t.includes("cloud") || t.includes("aws") || t.includes("azure")) return <Cloud size={20} className="text-blue-600 dark:text-blue-400" />;
    if (t.includes("design") || t.includes("ui") || t.includes("ux")) return <Palette size={20} className="text-pink-600 dark:text-pink-400" />;
    return <HelpCircle size={20} className="text-purple-600 dark:text-purple-400" />;
  };

  const OwnerMenu = ({ quiz }) => {
    const isOwner = currentUserId && quiz.createdBy && currentUserId.toString() === quiz.createdBy.toString();
    if (!isOwner) return null;
    return (
      <div className="absolute top-4 right-4 z-20" ref={openMenu === quiz._id ? menuRef : null}>
        <button
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === quiz._id ? null : quiz._id); }}
          className="p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <MoreVertical size={18} />
        </button>
        {openMenu === quiz._id && (
          <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-[#151520] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 p-1">
            <button onClick={(e) => { e.stopPropagation(); router.push(`/quizzes/create?edit=${quiz._id}`); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Edit Quiz</button>
            <button onClick={(e) => { e.stopPropagation(); deleteQuiz(quiz._id); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1">Delete</button>
          </div>
        )}
      </div>
    );
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0a0a0f] text-gray-900 dark:text-white px-4 sm:px-8 py-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-[2rem] font-bold tracking-tight text-gray-900 dark:text-white">Quizzes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage and track your quizzes seamlessly
            </p>
          </div>
          <button
            onClick={() => router.push("/quizzes/create")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-sm"
          >
            <span className="text-lg leading-none font-medium">+</span> Create Quiz
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quizzes.length === 0 ? (
           <div className="p-16 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center flex flex-col items-center justify-center bg-white dark:bg-[#11111a]">
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Quizzes Found</p>
            <p className="text-gray-500 dark:text-gray-400">There are no quizzes available right now. Why not create one?</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* FEATURED / COMPLETED CARD */}
            {featuredQuiz && (
              <div className="relative bg-white dark:bg-[#151520] rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                
                <OwnerMenu quiz={featuredQuiz} />
                
                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#e2e8f0] dark:bg-gray-800 text-[#475569] dark:text-gray-300 rounded-full text-[11px] font-bold tracking-wider uppercase mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#475569] dark:bg-gray-400"></div>
                  {featuredQuiz.closeAt && new Date(featuredQuiz.closeAt) <= now ? "COMPLETED" : "FEATURED"}
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                  {featuredQuiz.title}
                </h2>

                {/* Info Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] dark:bg-gray-800/50 text-[#64748b] dark:text-gray-400 rounded-lg text-xs font-semibold mb-8">
                  <MoreVertical size={14} className="opacity-50" />
                  {featuredQuiz.questions?.length || 0} Questions
                </div>

                {/* Big Button */}
                {(() => {
                  const isCompleted = featuredQuiz.closeAt && new Date(featuredQuiz.closeAt) <= now;
                  const hasAttempted = featuredQuiz.leaderboard?.some(
                    (entry) => entry.userId && entry.userId.toString() === currentUserId?.toString()
                  );

                  if (isCompleted || hasAttempted) {
                    return (
                      <button
                        onClick={() => router.push(`/quizzes/${featuredQuiz._id}/leaderboard`)}
                        className="w-full max-w-xl py-4 rounded-xl text-sm font-bold text-white bg-[#272c35] hover:bg-[#1f232a] dark:bg-white dark:text-[#0a0a0f] dark:hover:bg-gray-200 transition-all shadow-md"
                      >
                        {isCompleted ? "View Leaderboard" : "Attempted - View Leaderboard"}
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={() => router.push(`/quizzes/${featuredQuiz._id}`)}
                      className="w-full max-w-xl py-4 rounded-xl text-sm font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-all shadow-md"
                    >
                      Play Quiz
                    </button>
                  );
                })()}
              </div>
            )}

            {/* ONGOING QUIZZES (Grid) */}
            {(displayOngoing.length > 0 || (featuredQuiz && featuredQuiz.closeAt && new Date(featuredQuiz.closeAt) > now && ongoing.length > 0)) && (
              <div className="space-y-6">
                <h3 className="text-[1.35rem] font-semibold text-gray-900 dark:text-white tracking-tight">Ongoing Quizzes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {ongoing.map(quiz => (
                    <div key={quiz._id} className="relative bg-white dark:bg-[#151520] rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                      <OwnerMenu quiz={quiz} />
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-[#f5f3ff] dark:bg-purple-900/20 flex items-center justify-center">
                          {getIcon(quiz.title)}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                          {quiz.title}
                        </h4>
                      </div>
                      
                      {(() => {
                        const hasAttempted = quiz.leaderboard?.some(
                          (entry) => entry.userId && entry.userId.toString() === currentUserId?.toString()
                        );

                        if (hasAttempted) {
                          return (
                            <div className="flex flex-col gap-2">
                              <span className="text-[11px] text-center font-extrabold text-[#10b981] dark:text-[#34d399] uppercase tracking-widest flex items-center justify-center gap-1.5 bg-[#10b981]/10 py-1.5 rounded-lg mb-1">
                                <Check size={14} strokeWidth={3} /> Attempted
                              </span>
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/quizzes/${quiz._id}/leaderboard`}
                                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-all shadow-sm block text-center"
                                >
                                  Leaderboard
                                </Link>
                                <button 
                                  onClick={() => handleShare(quiz._id)}
                                  className="flex-none p-2 text-gray-400 hover:text-[#8b5cf6] transition-all"
                                  title="Share Quiz"
                                >
                                  <Share2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/quizzes/${quiz._id}`}
                              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-all shadow-sm hover:shadow-md block text-center"
                            >
                              Start
                            </Link>
                            <button 
                              onClick={() => handleShare(quiz._id)}
                              className="flex-none p-2 text-gray-400 hover:text-[#8b5cf6] transition-all"
                              title="Share Quiz"
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPCOMING QUIZZES (List Rows) */}
            {scheduled.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-[1.35rem] font-semibold text-gray-900 dark:text-white tracking-tight">Upcoming Quizzes</h3>
                <div className="space-y-4">
                  {scheduled.map(quiz => (
                    <div key={quiz._id} className="relative bg-white dark:bg-[#151520] rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-16">
                      <OwnerMenu quiz={quiz} />
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#f1f5f9] dark:bg-gray-800 flex items-center justify-center">
                          {getIcon(quiz.title)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-[15px]">
                            {quiz.title}
                          </h4>
                          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {getTimeLeft(quiz.startAt) || "Starting soon"}
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex items-center gap-3">
                        <button 
                          onClick={() => handleSetReminder(quiz)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#8b5cf6] bg-transparent border border-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-all whitespace-nowrap"
                        >
                          <Bell size={14} />
                          Set Reminder
                        </button>
                        
                        <button 
                          onClick={() => handleShare(quiz._id)}
                          className="flex-none p-2 text-gray-400 hover:text-[#8b5cf6] transition-all"
                          title="Share Quiz"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OTHER COMPLETED QUIZZES */}
            {otherCompleted.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-[1.35rem] font-semibold text-gray-900 dark:text-white tracking-tight">Previous Quizzes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {otherCompleted.map(quiz => (
                    <div key={quiz._id} className="relative bg-white dark:bg-[#151520] rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                      <OwnerMenu quiz={quiz} />
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <MonitorPlay size={20} className="text-gray-500" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                          {quiz.title}
                        </h4>
                      </div>
                      <button 
                        onClick={() => router.push(`/quizzes/${quiz._id}/leaderboard`)}
                        className="w-full py-3 rounded-2xl text-sm font-bold text-[#475569] dark:text-gray-300 bg-[#f1f5f9] dark:bg-gray-800 hover:bg-[#e2e8f0] dark:hover:bg-gray-700 transition-all"
                      >
                        Leaderboard
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}