// components/Sidebar.jsx
"use client";

import { useState } from "react";
import { Home, Users, CalendarDays, BarChart3, Newspaper, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

const nav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Users, label: "Groups", href: "/groups" },
  { 
    icon: CalendarDays, 
    label: "Events", 
    href: "/events",
    subNav: [
      { label: "Cultural Events", href: "/events/cultural" },
      { label: "Tech Events", href: "/events/tech" }
    ]
  },
  { icon: BarChart3, label: "Insights", href: "/insights" },
  { icon: Newspaper, label: "News", href: "/news" },
];

export default function Sidebar() {
  const [openQuick, setOpenQuick] = useState(true);
  const [openEvents, setOpenEvents] = useState(false);

  return (
    // ✨ ADDED: custom-scrollbar class for a sleek dark scrollbar
    <aside className="hidden lg:block w-[260px] shrink-0 border-r border-[#262626] bg-[#0d0d0d] overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-[240px] py-6">
        <nav className="space-y-1">
          {nav.map((n) => (
            <div key={n.label}>
              {n.subNav ? (
                <>
                  <button
                    onClick={() => setOpenEvents((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-transparent hover:border-[#262626] transition"
                  >
                    <div className="flex items-center gap-3">
                      <n.icon className="h-4 w-4" />
                      <span>{n.label}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition ${openEvents ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openEvents && (
                    <div className="mt-1 space-y-1 ml-4">
                      {n.subNav.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-transparent hover:border-[#262626] transition"
                        >
                          <ChevronRight className="h-3 w-3" />
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={n.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-transparent hover:border-[#262626] transition"
                >
                  <n.icon className="h-4 w-4" />
                  <span>{n.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Quick access collapsible */}
        <div className="mt-6">
          <button
            onClick={() => setOpenQuick((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]"
          >
            <span>Quick Access</span>
            <ChevronDown
              className={`h-4 w-4 transition ${openQuick ? "rotate-180" : ""}`}
            />
          </button>
          {openQuick && (
            <div className="mt-2 space-y-2">
              <Link href="/create-post" className="block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]">
                Create Post
              </Link>
              <Link href="/create-event" className="block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]">
                Create Event
              </Link>
              <Link href="/saved" className="block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a1a] border border-[#262626]">
                Saved Items
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}