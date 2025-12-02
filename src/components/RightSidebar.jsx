// components/RightSidebar.jsx
"use client";

import CalendarWidget from "@/components/CalendarWidget";
import { usePathname } from "next/navigation"; // Import usePathname

const popularPosts = [
  { id: "p1", title: "Top 10 Lighting Tips for Studio Shoots", stats: "8.9k views" },
  { id: "p2", title: "How I Edit Shorts in 7 Minutes", stats: "6.2k views" },
  { id: "p3", title: "My Notion Setup for Content Teams", stats: "4.7k views" },
];

const popularEvents = [
  { id: "e1", title: "Design Meetup for Creators", stats: "Trending" },
  { id: "e2", title: "AI Tools for Video Editing", stats: "Hot" },
];

export default function RightSidebar() {
  const pathname = usePathname(); // Call usePathname hook

  // 🎯 New Check: Hide the component if the path is /events OR starts with /profile
  if (pathname === "/events" || pathname.startsWith("/profile")) {
    return null;
  }

  return (
    <aside className="hidden xl:flex w-[360px] shrink-0 border-l border-[#262626] bg-[#0d0d0d] overflow-y-auto">
      <div className="mx-auto w-full max-w-[340px] p-4">
        <CalendarWidget />

        {/* Popular Posts */}
        <section className="mt-6 rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
          <div className="px-4 py-3 border-b border-[#262626] font-medium">Popular Posts</div>
          <ul className="p-2">
            {popularPosts.map((p) => (
              <li key={p.id} className="px-3 py-2 rounded-lg hover:bg-[#111] transition">
                <p className="text-sm">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.stats}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Popular Events */}
        <section className="mt-6 rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
          <div className="px-4 py-3 border-b border-[#262626] font-medium">Popular Events</div>
          <ul className="p-2">
            {popularEvents.map((e) => (
              <li key={e.id} className="px-3 py-2 rounded-lg hover:bg-[#111] transition">
                <p className="text-sm">{e.title}</p>
                <p className="text-xs text-blue-400 mt-0.5">{e.stats}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}