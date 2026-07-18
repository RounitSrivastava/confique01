"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, LogOut, User, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

const CREDENTIALS = "include";

export default function Topbar({ onToggleSidebar = () => {} }) {
  const [openBell, setOpenBell] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [isBellShaking, setIsBellShaking] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [processingNotifId, setProcessingNotifId] = useState(null);

  const router = useRouter();

  const userRef = useRef(null);
  const bellRef = useRef(null);

  const prevNotifCountRef = useRef(0);
  const bellAudioRef = useRef(null);

  useEffect(() => {
    if (typeof Audio !== "undefined") {
      try {
        const audio = new Audio("/bell-ring-390294.mp3");
        audio.volume = 1;
        bellAudioRef.current = audio;
      } catch {
        bellAudioRef.current = null;
      }
    }
  }, []);

  const playBellSound = () => {
    const audio = bellAudioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };

  useEffect(() => {
  // 🔥 DO NOT run auth check on /auth pages
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth")) {
    return;
  }

  let mounted = true;

  async function loadUser() {
    try {
      // ⚡ Fetch user and notifications in parallel
      const [meRes, notifRes] = await Promise.all([
        fetch("/api/me", { method: "GET", credentials: CREDENTIALS, cache: "no-store" }),
        fetch("/api/notifications").catch(() => null),
      ]);

      if (!mounted) return;

      if (!meRes.ok) {
        setCurrentUser(null);
        setNotifications([]);
        return;
      }

      const json = await meRes.json().catch(() => null);
      const serverUser = json?.user ?? null;

      if (serverUser) {
        const normalized = {
          name: serverUser.name || "",
          email: serverUser.email || "",
          avatar: serverUser.avatar || null,
          bio: serverUser.bio || "",
          location: serverUser.location || "",
          website: serverUser.website || "",
        };

        setCurrentUser(normalized);

        // Process notifications (already fetched in parallel above)
        try {
          let myList = [];
          if (notifRes?.ok) {
            myList = await notifRes.json().catch(() => []);
          } else {
            const store = JSON.parse(localStorage.getItem("notifications") || "{}");
            const userEmail = (normalized.email || "").toLowerCase();
            myList = userEmail ? store[userEmail] || [] : [];
          }
          setNotifications(myList);
          prevNotifCountRef.current = myList.length;
        } catch {
          setNotifications([]);
        }
      } else {
        setCurrentUser(null);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch /api/me:", err);
      setCurrentUser(null);
      setNotifications([]);
    }
  }

  loadUser();

  return () => {
    mounted = false;
  };
}, []);



  useEffect(() => {
    const handleAuthChanged = async (e) => {
      try {
        const user = e?.detail?.user ?? null;
        if (user) {
          const normalized = {
            name: user.name || "",
            email: user.email || "",
            avatar: user.avatar || null,
            bio: user.bio || "",
            location: user.location || "",
            website: user.website || "",
          };
          setCurrentUser(normalized);

          if (normalized) {
            try {
              const store = JSON.parse(localStorage.getItem("notifications") || "{}");
              const safeEmail = (normalized.email || "").toLowerCase();
              let list = safeEmail ? store[safeEmail] || [] : [];
              
              try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                   list = await res.json();
                }
              } catch (err) {}
              
              setNotifications(list);
              prevNotifCountRef.current = list.length || 0;
            } catch {
              setNotifications([]);
            }
          }
        } else {
          setCurrentUser(null);
          setNotifications([]);
        }
      } catch (err) {
        console.error("auth-changed handler error:", err);
      }
    };

    window.addEventListener("confique:auth-changed", handleAuthChanged);
    return () => window.removeEventListener("confique:auth-changed", handleAuthChanged);
  }, []);

  useEffect(() => {
    const handleUserUpdated = (e) => {
        try {
            const updatedProfile = e?.detail?.user;
            if (updatedProfile) {
                setCurrentUser(updatedProfile); 
            }
        } catch(err) {
            console.error("Profile update handler failed:", err);
        }
    };

    window.addEventListener("confique:user-updated", handleUserUpdated);
    return () => window.removeEventListener("confique:user-updated", handleUserUpdated);
  }, []);

  useEffect(() => {
    const handleUpdate = async () => {
      if (!currentUser?.email) return;
      try {
        const store = JSON.parse(localStorage.getItem("notifications") || "{}");
        const userEmail = currentUser.email.toLowerCase();
        let list = store[userEmail] || [];
        
        try {
          const res = await fetch("/api/notifications");
          if (res.ok) {
             const data = await res.json();
             list = data;
          }
        } catch (err) {}
        
        setNotifications(list);
      } catch {
        setNotifications([]);
      }
    };

    window.addEventListener("confique:new-notification", handleUpdate);
    window.addEventListener("confique:notifications-updated", handleUpdate);
    
    const handleStorageEvent = (e) => {
      if (e.key === "notifications") {
        handleUpdate();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("confique:new-notification", handleUpdate);
      window.removeEventListener("confique:notifications-updated", handleUpdate);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [currentUser?.email]);

  useEffect(() => {
    if (!isBellShaking) return;
    const timer = setTimeout(() => setIsBellShaking(false), 2000);
    return () => clearTimeout(timer);
  }, [isBellShaking]);

  useEffect(() => {
    const prevCount = prevNotifCountRef.current;
    const currentCount = notifications.length;

    if (currentCount > prevCount) {
      setIsBellShaking(true);
      playBellSound();
    }

    prevNotifCountRef.current = currentCount;
  }, [notifications.length]);

  useEffect(() => {
    function handleClickOutside(e) {
      const outsideUser = !userRef.current || !userRef.current.contains(e.target);
      const outsideBell = !bellRef.current || !bellRef.current.contains(e.target);

      if (outsideUser && outsideBell) {
        setOpenUser(false);
        setOpenBell(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    setOpenBell((v) => !v);
    setOpenUser(false);
    setIsBellShaking(false);
    
    // Fetch latest when opening the bell
    if (!openBell && currentUser?.email) {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          
          // Also sync to local storage just in case
          const store = JSON.parse(localStorage.getItem("notifications") || "{}");
          store[currentUser.email.toLowerCase()] = data;
          localStorage.setItem("notifications", JSON.stringify(store));
        }
      } catch (err) {
        console.error("Failed to fetch notifications on bell click:", err);
      }
    }
  };

  const handleKeepReport = async (notificationId) => {
    setProcessingNotifId(notificationId);
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error("Keep report error", err);
    } finally {
      setProcessingNotifId(null);
    }
  };

  const handleDeleteReportedPost = async (notificationId, postId) => {
    setProcessingNotifId(notificationId);
    try {
      const res = await fetch(`/api/groups/dummy/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 404) {
         await handleKeepReport(notificationId);
         window.dispatchEvent(new CustomEvent("confique:post-deleted", { detail: { postId } }));
      } else {
         alert("Failed to delete the post. Check permissions.");
         setProcessingNotifId(null);
      }
    } catch (err) {
      console.error("Delete report error", err);
      setProcessingNotifId(null);
    }
  };

  const formatTime = (n) => {
    if (n?.time) return n.time;
    if (n?.createdAt) {
      try {
        return new Date(n.createdAt).toLocaleString();
      } catch {
        return n.createdAt;
      }
    }
    return "";
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setNotifications([]);
    window.dispatchEvent(new CustomEvent("confique:auth-changed", { detail: { user: null } }));

    try {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("confique_token");
    } catch {}

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: CREDENTIALS,
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
     router.replace("/auth/login?loggedOut=true");
    }
  };

  const displayName =
    currentUser?.name?.trim() ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "") ||
    "User";
  const displayEmail = currentUser?.email || "";
  const displayAvatar = currentUser?.avatar || "/employee.jpg";
  const safeAvatar = typeof displayAvatar === "string" && displayAvatar !== "" ? displayAvatar : "/employee.jpg";

  return (
    <header className="sticky top-0 z-[100] border-b border-border-2 bg-[#0d0d0d]/80 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-3 md:px-6 h-16 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-bg-3 lg:hidden"
            aria-label="Open menu"
          >
            <span className="w-4 h-[2px] bg-gray-100 rounded-full mb-1"></span>
              <span className="w-4 h-[2px] bg-gray-100 rounded-full mb-1"></span>
            <span className="w-4 h-[2px] bg-gray-100 rounded-full"></span>
          </button>

          <img src="/Group 51(3).png" width={32} height={32} alt="Confique Logo" className="object-contain" />
          <span className="hidden sm:block font-medium tracking-wide">Confique</span>
        </div>

        {/* Center Section: Desktop Search */}
        <div className="flex-1 max-w-2xl hidden sm:block mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
            <input
              placeholder="Search posts, people, events..."
              className="w-full rounded-xl bg-bg-3 border border-border-2 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button onClick={handleBellClick} className={`relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-bg-3 ${isBellShaking ? "animate-bell-wiggle" : ""}`}>
              <div className="relative inline-block">
                <Bell className="h-5 w-5 text-text-2" />
                {notifications.length > 0 && <span className="absolute -top-[0px] -right-[6px] w-2 h-2 bg-purple-500 rounded-full" />}
              </div>
            </button>

            {openBell && (
              <div className="fixed sm:absolute left-1/2 sm:left-auto right-auto sm:right-0 top-16 sm:top-auto mt-2 w-[92vw] sm:w-80 -translate-x-1/2 sm:translate-x-0 rounded-xl bg-bg-3 border border-border-2 shadow-lg overflow-hidden z-[9999]">
                <div className="px-4 py-3 border-b border-border-2 font-medium flex items-center justify-between">
                  <span>Notifications</span>
                  <button onClick={() => setOpenBell(false)} className="p-1 hover:bg-[#262626] rounded-lg transition-colors">
                    <X className="h-4 w-4 text-text-3" />
                  </button>
                </div>
                <ul className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                  {notifications.length === 0 && <li className="px-4 py-3 text-sm text-text-3">No notifications yet.</li>}
                  {notifications.map((n) => (
                    <li key={n.id} className="px-4 py-3 hover:bg-[#111] border-b border-[#262626]/60 flex flex-col gap-2">
                      <p className="text-sm">{n.title || n.message || "Notification"}</p>
                      <p className="text-xs text-text-3">{formatTime(n)}</p>
                      {n.type === "REPORT" && (
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => handleDeleteReportedPost(n.id, n.postId)}
                            disabled={processingNotifId === n.id}
                            className={`px-3 py-1 bg-red-500/10 text-red-400 rounded text-xs font-medium transition-colors ${
                               processingNotifId === n.id ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500/20"
                            }`}
                          >
                            {processingNotifId === n.id ? "Deleting..." : "Delete Post"}
                          </button>
                          <button 
                            onClick={() => handleKeepReport(n.id)}
                            disabled={processingNotifId === n.id}
                            className={`px-3 py-1 bg-[#262626] text-text-2 rounded text-xs font-medium transition-colors ${
                               processingNotifId === n.id ? "opacity-50 cursor-not-allowed" : "hover:bg-[#333]"
                            }`}
                          >
                            {processingNotifId === n.id ? "Dismissing..." : "Keep & Dismiss"}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => {
                setOpenUser((v) => !v);
                setOpenBell(false);
              }}
              className="flex items-center gap-2 px-1 sm:px-2 py-1.5 rounded-full hover:bg-bg-3"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-600">
                <img src={safeAvatar} alt="User" width={36} height={36} className="object-cover w-full h-full" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-text-1">{displayName}</span>
            </button>

            {openUser && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121212] shadow-xl border border-border-2 overflow-hidden">
                <div className="px-4 py-4 flex flex-col items-center border-b border-border-2">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-700 mb-2">
                    <img src={safeAvatar} alt="User" width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                  <p className="text-sm font-semibold text-text-1">{displayName}</p>
                  <p className="text-xs text-text-3 mt-1">{displayEmail}</p>
                </div>

                <button onClick={() => { setOpenUser(false); router.push("/profile/details"); }} className="w-full px-4 py-3 text-sm flex items-center gap-2 hover:bg-[#181818]">
                  <User className="h-4 w-4 text-text-2" /> Profile
                </button>

                <div className="border-t border-border-2" />

                <button onClick={handleLogout} className="w-full px-4 py-3 text-sm flex items-center gap-2 text-red-400 hover:bg-[#181818]">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}