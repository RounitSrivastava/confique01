// components/RightSidebar.jsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

// Fallback communities (in case nothing is stored)
const FALLBACK_COMMUNITIES = [
  {
    id: 103,
    name: "Crypto Hub",
    members: "32.0k members",
    membersCount: 32000,
    slug: "crypto-hub",
  },
  {
    id: 104,
    name: "Foodies Delight",
    members: "15.9k members",
    membersCount: 15900,
    slug: "foodies-delight",
  },
  {
    id: 101,
    name: "Pixel Warriors",
    members: "12.4k members",
    membersCount: 12400,
    slug: "pixel-warriors",
  },
  {
    id: 106,
    name: "Book Worms HQ",
    members: "11.2k members",
    membersCount: 11200,
    slug: "book-worms",
  },
];

// Static fallback events (if nothing in localStorage)
const FALLBACK_POPULAR_EVENTS = [
  { id: "e1", title: "Design Meetup for Creators", stats: "Trending" },
  { id: "e2", title: "AI Tools for Video Editing", stats: "Hot" },
];

export default function RightSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [topCommunities, setTopCommunities] = React.useState([]);
  const [popularEvents, setPopularEvents] = React.useState([]);

  // ✅ Load communities from localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedAll =
        JSON.parse(localStorage.getItem("confique:allCommunities") || "[]") ||
        [];

      let list =
        Array.isArray(storedAll) && storedAll.length
          ? storedAll
          : FALLBACK_COMMUNITIES;

      list = [...list].sort(
        (a, b) => (b.membersCount || 0) - (a.membersCount || 0)
      );

      setTopCommunities(list.slice(0, 4));
    } catch {
      setTopCommunities(FALLBACK_COMMUNITIES.slice(0, 4));
    }
  }, []);

  // ✅ Load dynamic popular events from localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedEvents =
        JSON.parse(localStorage.getItem("confique:events") || "[]") || [];

      if (!Array.isArray(storedEvents) || storedEvents.length === 0) {
        setPopularEvents(FALLBACK_POPULAR_EVENTS);
        return;
      }

      // Sort by impressions (high → low)
      let list = [...storedEvents].sort(
        (a, b) => (b.impressions || 0) - (a.impressions || 0)
      );

      // Only top 2–3
      list = list.slice(0, 3);

      setPopularEvents(list);
    } catch {
      setPopularEvents(FALLBACK_POPULAR_EVENTS);
    }
  }, []);

  // Redirect to specific event details page
  const handlePopularEventClick = (event) => {
    if (!event || !event.id) return;
    router.push(`/events?event=${encodeURIComponent(event.id)}`);
  };

  const handleCommunityClick = (community) => {
    if (!community) return;

    const baseSlug =
      community.slug ||
      (community.name || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const slug = baseSlug || "community";

    let joinedMap = {};
    try {
      joinedMap =
        JSON.parse(localStorage.getItem("confique:joinedCommunities") || "{}") ||
        {};
    } catch {
      joinedMap = {};
    }

    const isJoined = !!joinedMap[community.id];

    if (isJoined) {
      router.push(`/groups?focus=${encodeURIComponent(slug)}`);
    } else {
      router.push(`/groups?invited=${encodeURIComponent(slug)}`);
    }
  };

  // Hide sidebar on /events and /profile
  if (pathname === "/events" || pathname.startsWith("/profile")) {
    return null;
  }

  return (
    <aside className="hidden xl:flex w-[360px] shrink-0 border-l border-[#262626] bg-[#0d0d0d] overflow-y-auto">
      <div className="mx-auto w-full max-w-[340px] p-4">

        {/* 🔹 Top Communities */}
        <section className="rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
          <div className="px-4 py-3 border-b border-[#262626] font-medium">
            Top Communities
          </div>

          <ul className="p-2">
            {topCommunities.map((c, index) => (
              <li
                key={c.id}
                onClick={() => handleCommunityClick(c)}
                className="px-3 py-2 rounded-lg hover:bg-[#111] transition flex items-start gap-2 cursor-pointer"
              >
                <span className="text-xs text-gray-500 mt-0.5">
                  #{index + 1}
                </span>

                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.members || `${c.membersCount || 0} members`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 🔹 Popular Events (Dynamic) */}
        <section className="mt-6 rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
          <div className="px-4 py-3 border-b border-[#262626] font-medium">
            Popular Events
          </div>

          <ul className="p-2">
            {popularEvents.map((e) => (
              <li
                key={e.id}
                onClick={() => handlePopularEventClick(e)}
                className="px-3 py-2 rounded-lg hover:bg-[#111] cursor-pointer transition"
              >
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-blue-400 mt-0.5">
                  {e.impressions
                    ? `${e.impressions.toLocaleString()} impressions`
                    : e.stats || "Event"}
                </p>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </aside>
  );
}
