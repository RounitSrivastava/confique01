// components/RightSidebar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Fallback communities (in case nothing is stored)

export default function RightSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [topCommunities, setTopCommunities] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);

  const isSettingsPage = pathname === "/settings" || pathname?.includes("settings");

  // --- Logic for Communities ---
  useEffect(() => {
    if (typeof window === "undefined" || isSettingsPage) return;

    const loadCommunitiesFromStorage = () => {
      try {
        const raw = localStorage.getItem("confique:allCommunities") || "[]";
        const storedAll = JSON.parse(raw) || [];
        if (!Array.isArray(storedAll) || storedAll.length === 0) {
  setTopCommunities([]);
  return;
}

let list = [...storedAll];

        list = [...list].map((c) => ({ ...c, membersCount: Number(c.membersCount || 0) }));
        list.sort((a, b) => (b.membersCount || 0) - (a.membersCount || 0));

        setTopCommunities(list.slice(0, 4));
      } catch (err) {
        console.error("Failed to load top communities:", err);
      setTopCommunities([]);
      }
    };

    loadCommunitiesFromStorage();
    window.addEventListener("confique:communities-updated", loadCommunitiesFromStorage);
    return () => window.removeEventListener("confique:communities-updated", loadCommunitiesFromStorage);
  }, [isSettingsPage]);

  // --- Logic for Dynamic Events (Database Fetch) ---
  useEffect(() => {
    if (typeof window === "undefined" || isSettingsPage) return;

    const fetchPopularEvents = async () => {
      try {
        const res = await fetch("/api/events", { method: "GET", cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Sort by impressions (even though we don't show them, we use them for "Popular" ranking)
          const sorted = data
            .map(ev => ({
              id: ev._id,
              title: ev.title,
              tagline: ev.tagline || "No description available",
              impressions: ev.impressions || 0
            }))
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 3);
          
          setPopularEvents(sorted);
        } else {
          setPopularEvents([]);
        }
      } catch (err) {
        console.error("RightSidebar: Error fetching events:", err);
        setPopularEvents([]);
      }
    };

    fetchPopularEvents();
    
    window.addEventListener("confique:events-updated", fetchPopularEvents);
    return () => window.removeEventListener("confique:events-updated", fetchPopularEvents);
  }, [isSettingsPage]);

  const handlePopularEventClick = (event) => {
    if (!event || !event.id) return;
    router.push(`/events?event=${encodeURIComponent(event.id)}`);
  };

  const handleCommunityClick = (community) => {
    if (!community) return;
    const slug = community.slug || community.name?.toLowerCase().replace(/\s+/g, "-");
    router.push(`/groups?focus=${encodeURIComponent(slug)}`);
  };

  // Hide sidebar on /events and /profile
  if (pathname === "/events" || pathname.startsWith("/profile")) {
    return null;
  }

  return (
    <aside className="hidden xl:flex w-[360px] shrink-0 border-l border-[#262626] bg-[#0d0d0d] overflow-y-auto">
      <div className="mx-auto w-full max-w-[340px] p-4 pb-10 space-y-6">
        
        {isSettingsPage ? (
          <section className="rounded-2xl bg-[#101010] border border-[#262626] shadow-sm px-6 py-8 text-center">
            <h2 className="text-xl font-bold text-white">Help & Support</h2>
            <p className="text-sm text-gray-300 mt-4 leading-relaxed">
              Facing any issue with <span className="font-semibold">Confique</span>?<br />
              Email us at:
            </p>
            <div className="mt-5 flex justify-center">
              <a href="mailto:confique01@gmail.com" className="text-purple-100 hover:text-purple-300 transition underline">
                confique01@gmail.com
              </a>
            </div>
          </section>
        ) : (
          <>
            {/* Top Communities */}
            {topCommunities.length > 0 && (
  <section className="rounded-xl bg-[#121212] border border-[#262626] shadow-sm">
              <div className="px-4 py-3 border-b border-[#262626] text-sm font-medium text-white tracking-wide">Top Communities</div>
              <ul className="p-2">
                {topCommunities.map((c, index) => (
                  <li key={c.id} onClick={() => handleCommunityClick(c)} className="px-3 py-2 rounded-lg hover:bg-[#111] transition flex items-start gap-2 cursor-pointer group">
                    <span className="text-xs text-gray-500 mt-0.5">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-purple-400 transition-colors">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.members || `${c.membersCount} members`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
)}
            {/* Popular Events Section */}
            {popularEvents.length > 0 && (
  <section className="rounded-xl bg-[#121212] border border-[#262626] shadow-sm hover:bg-[#151515] transition-colors">
              <div className="px-4 py-3 border-b border-[#262626] text-sm font-medium text-white tracking-wide"> Events</div>
              <ul className="p-2">
                {popularEvents.map((e) => (
                  <li 
                    key={e.id} 
                    onClick={() => handlePopularEventClick(e)} 
                    className="px-3 py-2 rounded-lg hover:bg-[#111] cursor-pointer transition group"
                  >
                    {/* ✅ Title: Single line with ellipsis */}
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-purple-400 transition-colors">
                      {e.title}
                    </p>
                    {/* ✅ Tagline/Description: Single line with ellipsis */}
                    <p className="text-xs text-gray-500 mt-0.5 truncate italic">
                      {e.tagline}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}