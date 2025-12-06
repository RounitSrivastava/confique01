// components/Sidebar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Home,
  Users,
  CalendarDays,
  BarChart3,
  Newspaper,
  ChevronDown,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

const nav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Users, label: "Groups", href: "/groups" },
  { icon: CalendarDays, label: "Events", href: "/events" },
  { icon: BarChart3, label: "Insights", href: "/insights" },
  { icon: Newspaper, label: "News", href: "/news" },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const [openQuick, setOpenQuick] = useState(true);
  const [isClientMobile, setIsClientMobile] = useState(false);
  const pathname = usePathname();
  const mmRef = useRef(null);

  const checkIsMobile = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;

  // Detect mobile viewport
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

  // Close mobile sidebar only when the route changes
  useEffect(() => {
    if (isOpen && isClientMobile) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Hide sidebar entirely on /events route
  if (pathname === "/events") {
    return null;
  }

  const handleMobileClose = () => {
    if (isOpen && isClientMobile) onClose();
  };

  const baseLink =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition border border-transparent";

  return (
    <>
      {/* DESKTOP - persistent sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-[#262626] bg-[#0d0d0d] overflow-y-auto custom-scrollbar">
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
                      ? "bg-[#1a1a1a] border-[#3a3a3a] text-white"
                      : "text-gray-300 hover:bg-[#1a1a1a] hover:border-[#262626]"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">
            <button
              onClick={() => setOpenQuick((s) => !s)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]"
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
                <Link
                  href="/create-post"
                  className="block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]"
                >
                  Create Post
                </Link>
                <Link
                  href="/create-event"
                  className="block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]"
                >
                  Create Event
                </Link>
                <Link
                  href="/saved"
                  className="block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]"
                >
                  Saved Items
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE - slide-over sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0d0d0d] border-r border-[#262626] transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-extrabold text-purple-400">
            Confique
          </h2>
          <button onClick={onClose} className="p-1">
            <X className="h-5 w-5 text-gray-400" />
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 ${
                  active ? "bg-gray-800 text-white" : "text-gray-200"
                }`}
              >
                <n.icon className="h-4 w-4" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/create-post"
            onClick={handleMobileClose}
            className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            Create Post
          </Link>
          <Link
            href="/create-event"
            onClick={handleMobileClose}
            className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            Create Event
          </Link>
          <Link
            href="/saved"
            onClick={handleMobileClose}
            className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            Saved Items
          </Link>
        </div>
      </aside>

      {/* BACKDROP OVERLAY – click outside to close (mobile only) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
