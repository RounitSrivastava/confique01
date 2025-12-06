// components/Topbar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Bell, LogOut, User, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Default notifications (used if no prop passed)
const defaultNotifications = [
  { id: 1, title: "New comment on your post", time: "2m ago" },
  { id: 2, title: "Event Reminder: Design Meetup 6 PM", time: "1h ago" },
  { id: 3, title: "Group invite accepted by Lina", time: "Yesterday" },
];

export default function Topbar({
  onToggleSidebar = () => {},
  notifications = defaultNotifications,
}) {
  const [openBell, setOpenBell] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // 🔔 Bell shake on first mount (can keep this) + on new notifications
  const [isBellShaking, setIsBellShaking] = useState(true);

  const router = useRouter();

  const userRef = useRef(null);
  const bellRef = useRef(null);
  const mobileSearchWrapperRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Track previous notification count
  const prevNotifCountRef = useRef(notifications.length);

  // 🎵 Bell sound
  const bellAudioRef = useRef(null);

  // Initialize audio once on client
  useEffect(() => {
    if (typeof Audio !== "undefined") {
      const audio = new Audio("/bell-ring-390294.mp3");
      audio.volume = 1; // make sure not muted
      audio.muted = false;
      bellAudioRef.current = audio;
    }
  }, []);

  // Helper: play bell sound safely
  const playBellSound = () => {
    const audio = bellAudioRef.current;
    if (!audio) {
      console.warn("Bell audio not initialized");
      return;
    }

    try {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Bell audio play blocked/error:", err);
      });
    } catch (err) {
      console.warn("Bell audio error:", err);
    }
  };

  // ⏱ Stop shake after animation (NO sound here now)
  useEffect(() => {
    if (!isBellShaking) return;

    const timer = setTimeout(() => setIsBellShaking(false), 2000);
    return () => clearTimeout(timer);
  }, [isBellShaking]);

  // 🔔+🔊 When NEW notification comes (count increased)
  useEffect(() => {
    const prevCount = prevNotifCountRef.current;
    const currentCount = notifications.length;

    if (currentCount > prevCount) {
      // New notification → shake + sound
      setIsBellShaking(true);
      playBellSound();
    }

    prevNotifCountRef.current = currentCount;
  }, [notifications.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      const outsideUser =
        !userRef.current || !userRef.current.contains(e.target);
      const outsideBell =
        !bellRef.current || !bellRef.current.contains(e.target);
      const outsideSearch =
        !mobileSearchWrapperRef.current ||
        !mobileSearchWrapperRef.current.contains(e.target);

      if (outsideUser && outsideBell) {
        setOpenUser(false);
        setOpenBell(false);
      }

      if (outsideSearch) {
        setMobileSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus mobile search input
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // 🔔 Bell click handler: open panel + sound (optional)
  const handleBellClick = () => {
    setOpenBell((v) => !v);
    setOpenUser(false);
    setIsBellShaking(false); // stop animation when user opens panel
    playBellSound();         // 🔊 sound on click
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#262626] bg-[#0d0d0d]/80 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-3 md:px-6 h-16 flex items-center gap-4">
        {/* LEFT — LOGO + HAMBURGER (mobile only) */}
        <div className="flex items-center gap-3 min-w-[180px]">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onToggleSidebar}
            className="flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-[#1a1a1a] lg:hidden"
            aria-label="Open menu"
          >
            <span className="w-4 h-[2px] bg-gray-100 rounded-full mb-1"></span>
            <span className="w-4 h-[2px] bg-gray-100 rounded-full"></span>
          </button>

          {/* Logo */}
          <Image
            src="/Group 51(3).png"
            width={32}
            height={32}
            alt="Confique Logo"
            className="object-contain"
          />

          <span className="hidden sm:block font-medium tracking-wide">
            Confique
          </span>
        </div>

        {/* DESKTOP SEARCH */}
        <div className="flex-1 max-w-2xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search posts, people, events..."
              className="w-full rounded-xl bg-[#1a1a1a] border border-[#262626] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="ml-auto flex items-center gap-2">
          {/* MOBILE SEARCH BAR */}
          <div ref={mobileSearchWrapperRef} className="relative sm:hidden">
            {!mobileSearchOpen ? (
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-[#1a1a1a]"
              >
                <Search className="h-5 w-5 text-gray-300" />
              </button>
            ) : (
              <div className="flex items-center bg-[#1a1a1a] border border-blue-600 px-3 py-1 rounded-xl w-44">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  ref={mobileSearchInputRef}
                  placeholder="Search..."
                  className="flex-1 bg-transparent outline-none text-sm text-white ml-2"
                />
                <button onClick={() => setMobileSearchOpen(false)}>
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={handleBellClick}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#1a1a1a] ${
                isBellShaking ? "animate-bell-wiggle" : ""
              }`}
            >
              {/* Bell + dot wrapper */}
              <div className="relative inline-block">
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute -top-[0px] -right-[6px] w-2 h-2 bg-purple-500 rounded-full" />
              </div>
            </button>

            {openBell && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-lg">
                <div className="px-4 py-3 border-b border-[#262626] font-medium">
                  Notifications
                </div>

                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-3 hover:bg-[#111] border-b border-[#262626]/60"
                    >
                      <p className="text-sm">{n.title}</p>
                      <p className="text-xs text-gray-400">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* USER MENU */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => {
                setOpenUser((v) => !v);
                setOpenBell(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-[#1a1a1a]"
            >
              <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-600">
                <Image
                  src="/employee.jpg"
                  width={36}
                  height={36}
                  alt="User"
                  className="object-cover w-full h-full"
                />
              </div>

              <span className="hidden sm:block text-sm font-medium text-white">
                Rounit Srivastava
              </span>
            </button>

            {openUser && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121212] shadow-xl border-[#262626] overflow-hidden">
                <div className="px-4 py-4 flex flex-col items-center border-b border-[#262626]">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-700 mb-2">
                    <Image
                      src="/employee.jpg"
                      width={64}
                      height={64}
                      alt="User"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Rounit Srivastava
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    rounit.kumar2702@gmail.com
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpenUser(false);
                    router.push("/profile/details");
                  }}
                  className="w-full px-4 py-3 text-sm flex items-center gap-2 hover:bg-[#181818]"
                >
                  <User className="h-4 w-4 text-gray-300" /> Profile
                </button>

                <div className="border-t border-[#262626]" />

                <button className="w-full px-4 py-3 text-sm flex items-center gap-2 text-red-400 hover:bg-[#181818]">
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
