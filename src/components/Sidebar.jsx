// components/Sidebar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  CalendarDays,
  ChevronDown,
  X,
  Settings,   // ✅ ADDED
  Brain, 
  Gift,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Users, label: "Commmunity", href: "/groups" },
  { icon: CalendarDays, label: "Events", href: "/events" },
  { icon: Brain, label: "Quizzes", href: "/quizzes" },
  { icon: Gift, label: "Rewards", href: "/rewards" },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const router = useRouter();
  const [openQuick, setOpenQuick] = useState(true);
  const [isClientMobile, setIsClientMobile] = useState(false);
  const pathname = usePathname();
  const mmRef = useRef(null);

  const checkIsMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsClientMobile(checkIsMobile());

    mmRef.current = window.matchMedia("(max-width: 1023px)");
    const handler = (e) => setIsClientMobile(e.matches);
    mmRef.current.addEventListener("change", handler);

    return () => {
      if (mmRef.current) {
        mmRef.current.removeEventListener("change", handler);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && isClientMobile) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.style.overflow =
      isOpen && isClientMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isClientMobile]);

  if (pathname === "/events") return null;

  const handleMobileClose = () => {
    if (isOpen && isClientMobile) onClose();
  };

  const baseLink =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border border-transparent";

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-[#262626] bg-bg-4 overflow-y-auto custom-scrollbar">
        <div className="mx-auto max-w-[240px] py-6">
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  className={`${baseLink} ${
                    active
                      ? "bg-bg-3 border-border-1 text-text-1"
                      : "text-text-2 hover:bg-bg-3 hover:border-[#262626]"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* QUICK ACCESS */}
          <div className="mt-6">
            <button
              onClick={() => setOpenQuick((s) => !s)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-text-2 hover:bg-bg-3 border border-[#262626]"
            >
              <span>Quick Access</span>
              <ChevronDown
                className={`h-4 w-4 transition ${
                  openQuick ? "rotate-180" : ""
                }`}
              />
            </button>

            {openQuick && (
              <div className="mt-2 space-y-2">
              
                <button
  onClick={() => router.push("/groups?view=create")}
  className="block w-full text-left rounded-xl px-3 py-2 text-sm text-text-2 hover:bg-bg-3 border border-[#262626]">
  Create Community
</button>
                <button
  onClick={() => router.push("/events?view=host")}
  className="block w-full text-left rounded-xl px-3 py-2 text-sm text-text-2 hover:bg-bg-3 border border-[#262626]"
>
  Create Event
</button>
                
              </div>
            )}
          </div>

          {/* SETTINGS BUTTON — WITH ICON */}
          <div className="mt-4">
            <Link
              href="/settings"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-2 hover:bg-bg-3 border border-[#262626]"
            >
              <Settings className="h-4 w-4" />   {/* ✅ ICON ADDED */}
              <span>Help & Support</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-bg-4 border-r border-[#262626] transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#262626]">
          <h2 className="text-lg font-extrabold text-purple-400">Confique</h2>
          <button onClick={onClose} className="p-1">
            <X className="h-5 w-5 text-text-3" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.label}
                href={n.href}
                onClick={handleMobileClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-3 ${
                  active ? "bg-bg-3 text-text-1" : "text-gray-200"
                }`}
              >
                <n.icon className="h-4 w-4" />
                <span>{n.label}</span>
              </Link>
            );
          })}

          {/* MOBILE SETTINGS — WITH ICON */}
          <Link
            href="/settings"
            onClick={handleMobileClose}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-3 text-gray-200"
          >
            <Settings className="h-4 w-4" />   {/* ✅ ICON ADDED */}
            <span>Help & Support</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#262626] space-y-2">
          <button
  onClick={() => {
    router.push("/quizzes/create");
    handleMobileClose();
  }}
  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-bg-3 text-text-2"
>
  Create Quiz
</button>
          <button
  onClick={() => {
    router.push("/groups?view=create");
    handleMobileClose();
  }}
  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-bg-3 text-text-2">
  Create Community
</button>
          <button
  onClick={() => {
    router.push("/events?view=host");
    handleMobileClose();
  }}
  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-bg-3 text-text-2">
  Create Event
</button>          
        </div>
      </aside>

      {/* BACKDROP */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
