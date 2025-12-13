// components/RightSidebar.jsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

// Fallback communities (in case nothing is stored)
const FALLBACK_COMMUNITIES = [
  { id: 103, name: "Crypto Hub", members: "32.0k members", membersCount: 32000, slug: "crypto-hub" },
  { id: 104, name: "Foodies Delight", members: "15.9k members", membersCount: 15900, slug: "foodies-delight" },
  { id: 101, name: "Pixel Warriors", members: "12.4k members", membersCount: 12400, slug: "pixel-warriors" },
  { id: 106, name: "Book Worms HQ", members: "11.2k members", membersCount: 11200, slug: "book-worms" },
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

  const isSettingsPage = pathname === "/settings" || pathname?.includes("settings");

  // Load communities from localStorage and react to updates (same-tab and cross-tab)
  React.useEffect(() => {
    if (typeof window === "undefined" || isSettingsPage) return;

    const loadCommunitiesFromStorage = () => {
      try {
        const raw = localStorage.getItem("confique:allCommunities") || "[]";
        const storedAll = JSON.parse(raw) || [];

        let list = Array.isArray(storedAll) && storedAll.length ? storedAll : FALLBACK_COMMUNITIES;

        // Ensure numeric membersCount and stable sorting
        list = [...list].map((c) => ({ ...c, membersCount: Number(c.membersCount || 0) }));
        list.sort((a, b) => (b.membersCount || 0) - (a.membersCount || 0));

        setTopCommunities(list.slice(0, 4));
      } catch (err) {
        console.error("Failed to load top communities for sidebar:", err);
        setTopCommunities(FALLBACK_COMMUNITIES.slice(0, 4));
      }
    };

    // initial load
    loadCommunitiesFromStorage();

    // same-tab updates (ExplorePage dispatches this event when it writes the key)
    const onUpdated = () => loadCommunitiesFromStorage();
    window.addEventListener("confique:communities-updated", onUpdated);

    // cross-tab storage updates
    const onStorage = (ev) => {
      if (ev.key === "confique:allCommunities") loadCommunitiesFromStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("confique:communities-updated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [isSettingsPage]);

  // Load dynamic popular events from localStorage
  React.useEffect(() => {
    if (typeof window === "undefined" || isSettingsPage) return;

    try {
      const raw = localStorage.getItem("confique:events") || "[]";
      const storedEvents = JSON.parse(raw) || [];

      if (!Array.isArray(storedEvents) || storedEvents.length === 0) {
        setPopularEvents(FALLBACK_POPULAR_EVENTS);
        return;
      }

      // Sort by impressions (high → low) and slice top 3
      const list = [...storedEvents].sort((a, b) => (b.impressions || 0) - (a.impressions || 0)).slice(0, 3);
      setPopularEvents(list);
    } catch (err) {
      console.error("Failed to load popular events:", err);
      setPopularEvents(FALLBACK_POPULAR_EVENTS);
    }
  }, [isSettingsPage]);

  // Redirect to specific event details page
  const handlePopularEventClick = (event) => {
    if (!event || !event.id) return;
    router.push(`/events?event=${encodeURIComponent(event.id)}`);
  };

  // Click a community: if joined -> focus; else -> invited
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
      joinedMap = JSON.parse(localStorage.getItem("confique:joinedCommunities") || "{}") || {};
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
      <div className="mx-auto w-full max-w-[340px] p-4 space-y-6">
        {/* Help & Support — ONLY show on Settings page */}
        {isSettingsPage && (
          <section className="rounded-2xl bg-[#101010] border border-[#262626] shadow-sm px-6 py-8 text-center">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-100">
              Help &amp; Support
            </h2>

            <p className="text-sm text-gray-300 mt-4 leading-relaxed">
              Facing any issue with <span className="font-semibold">Confique</span>?<br />
              For support or questions, email us at:
            </p>

            <div className="mt-5 flex justify-center">
              <a
                href="mailto:confique01@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-100 hover:text-purple-300 hover:underline transition"
              >
                <span>📧</span>
                <span>confique01@gmail.com</span>
              </a>
            </div>
          </section>
        )}

        {/* Top Communities & Popular Events — show only when NOT on Settings page */}
        {!isSettingsPage && (
          <>
            {/* Top Communities */}
            <section className="rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
              <div className="px-4 py-3 border-b border-[#262626] font-medium">Top Communities</div>

              <ul className="p-2">
                {topCommunities.map((c, index) => (
                  <li
                    key={c.id}
                    onClick={() => handleCommunityClick(c)}
                    className="px-3 py-2 rounded-lg hover:bg-[#111] transition flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-xs text-gray-500 mt-0.5">#{index + 1}</span>

                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.members || `${c.membersCount || 0} members`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Popular Events (Dynamic) */}
            <section className="rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm">
              <div className="px-4 py-3 border-b border-[#262626] font-medium">Popular Events</div>

              <ul className="p-2">
                {popularEvents.map((e) => (
                  <li
                    key={e.id}
                    onClick={() => handlePopularEventClick(e)}
                    className="px-3 py-2 rounded-lg hover:bg-[#111] cursor-pointer transition"
                  >
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-blue-400 mt-0.5">
                      {e.impressions ? `${e.impressions.toLocaleString()} impressions` : e.stats || "Event"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
