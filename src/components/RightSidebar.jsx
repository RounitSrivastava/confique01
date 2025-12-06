// components/RightSidebar.jsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

// Fallback communities (if nothing found in localStorage)
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

// 🔹 SAME as before — don't touch
const popularEvents = [
  { id: "e1", title: "Design Meetup for Creators", stats: "Trending" },
  { id: "e2", title: "AI Tools for Video Editing", stats: "Hot" },
];

export default function RightSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [topCommunities, setTopCommunities] = React.useState([]);

  // Hide sidebar on events page or any profile page
  if (pathname === "/events" || pathname.startsWith("/profile")) {
    return null;
  }

  // Load communities + joined map from localStorage
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

      setTopCommunities(list.slice(0, 4)); // only top 4
    } catch {
      const list = [...FALLBACK_COMMUNITIES].sort(
        (a, b) => (b.membersCount || 0) - (a.membersCount || 0)
      );
      setTopCommunities(list.slice(0, 4));
    }
  }, []);

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

    const isJoined =
      !!joinedMap[community.id] || community.createdByCurrentUser;

    // If joined → open feed (Explore/AppContainer handles ?focus)
    // If not joined → ?invited so it appears at top in "Communities For You"
    if (isJoined) {
      router.push(`/groups?focus=${encodeURIComponent(slug)}`);
    } else {
      router.push(`/groups?invited=${encodeURIComponent(slug)}`);
    }
  };

  return (
    <aside className="hidden xl:flex w-[360px] shrink-0 border-l border-[#262626] bg-[#0d0d0d] overflow-y-auto">
      <div className="mx-auto w-full max-w-[340px] p-4">
        {/* 🔹 Top Communities (dynamic) */}
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

            {topCommunities.length === 0 && (
              <li className="px-3 py-3 text-xs text-gray-500">
                No communities yet.
              </li>
            )}
          </ul>
        </section>

        {/* 🔹 Popular Events — unchanged */}
        <section className="mt-6 rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
          <div className="px-4 py-3 border-b border-[#262626] font-medium">
            Popular Events
          </div>
          <ul className="p-2">
            {popularEvents.map((e) => (
              <li
                key={e.id}
                className="px-3 py-2 rounded-lg hover:bg-[#111] transition"
              >
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
