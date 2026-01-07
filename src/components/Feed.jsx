// components/Feed.jsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

/* -------------------------
   Category → gradient map
------------------------- */
const CATEGORY_GRADIENT_VARIANTS = {
  Tech: [
    "linear-gradient(180deg,#6d28d9,#a78bfa)",
    "linear-gradient(180deg,#4f46e5,#818cf8)",
    "linear-gradient(180deg,#4338ca,#6366f1)",
  ],
  Entrepreneurship: [
    "linear-gradient(180deg,#f59e0b,#fbbf24)",
    "linear-gradient(180deg,#d97706,#fde68a)",
  ],
  Gaming: [
    "linear-gradient(180deg,#059669,#34d399)",
    "linear-gradient(180deg,#047857,#6ee7b7)",
  ],
  Sports: [
    "linear-gradient(180deg,#ef4444,#f87171)",
    "linear-gradient(180deg,#b91c1c,#fecaca)",
  ],
  default: [
    "linear-gradient(180deg,#1f2937,#374151)",
  ],
};


/* -------------------------
   Helpers
------------------------- */
const readJsonLocal = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readCommunitiesFromStorage = () => {
  const keys = ["confique:allCommunities", "confique:communities", "recommendedCommunities"];
  for (const k of keys) {
    const v = readJsonLocal(k);
    if (Array.isArray(v) && v.length) return v;
  }
  return null;
};

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");
const normalizeCategory = (cat = "", name = "") => {
  const c = `${cat} ${name}`.toLowerCase();

  if (c.includes("tech") || c.includes("dev") || c.includes("cp") || c.includes("ai"))
    return "Tech";
  if (c.includes("entre") || c.includes("startup"))
    return "Entrepreneurship";
  if (c.includes("game"))
    return "Gaming";
  if (c.includes("sport"))
    return "Sports";

  return "default";
};


/* normalize/convert incoming community objects to the shape Feed expects */
const normalizeCommunities = (arr = []) =>
  (arr || []).map((c, idx) => {
    const id = String(c.id ?? c._id ?? `tmp-${idx}`);
    const name = c.name || c.title || `Community ${id}`;
    const membersCount = Number(c.membersCount ?? c.members_count ?? 0);
    const members = c.members || (membersCount ? `${membersCount.toLocaleString()} members` : c.members || "0 members");
    const bannerUrl = c.bannerUrl || c.hero || c.image || c.banner || null;
    const iconUrl = c.iconUrl || c.icon || null;
    const description = c.description || c.shortDescription || c.desc || "";
    const category = normalizeCategory(c.category || c.gradientKey, c.name);
    return {
      ...c,
      id,
      name,
      slug: c.slug || slugify(name),
      membersCount,
      members,
      bannerUrl,
      iconUrl,
      description,
      category,
      gradientKey: category,
    };
  });

/* -------------------------
   Card component
------------------------- */
const DEFAULT_BANNER = "https://placehold.co/800x240/111827/ffffff?text=POSTER";

function CommunityCard({ c, index = 0, onOpen, className = "" }) {
  const bannerImg = c.bannerUrl || null;
const logoImg = c.iconUrl || null;
  const description = c.description || "";

  // ✅ ADD THESE LINES
  const gradientKey = c.gradientKey || c.category || "default";
  const variants =
    CATEGORY_GRADIENT_VARIANTS[gradientKey] ||
    CATEGORY_GRADIENT_VARIANTS.default;

  const gradientStyle = variants[index % variants.length];


  const clampStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <article
      onClick={() => onOpen && onOpen(c)}
className={`rounded-2xl overflow-hidden shadow-2xl bg-[#0d0d0d] border border-white/15 hover:border-white/30 cursor-pointer transition-all flex flex-col h-full ${className}`}

    >
      <div className="h-36 w-full overflow-hidden flex-shrink-0 rounded-t-2xl bg-gray-900">
  {bannerImg ? (
    <img
      src={bannerImg}
      alt={c.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_BANNER;
      }}
    />
  ) : logoImg ? (
    <img
  src={logoImg}
  alt={c.name}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_BANNER;
  }}
/>

  ) : (
    <div
      className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
      style={{ background: gradientStyle }}
    >
      {c.name?.charAt(0)}
    </div>
  )}
</div>


      <div className="p-5 lg:px-4 lg:pt-3 lg:pb-3 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white">{c.name}</h3>

        <p
  className="mt-1 text-sm text-gray-300 lg:text-xs flex-grow"
  style={clampStyle}
>

          {description}
        </p>

        <p className="mt-3 lg:mt-2 text-sm lg:text-xs text-gray-400 font-medium">
          {c.members || (typeof c.membersCount === "number" ? `${c.membersCount.toLocaleString()} members` : "0 members")}
        </p>
      </div>
    </article>
  );
}

/* -------------------------
   Featured event components (unchanged)
------------------------- */
function FeaturedEventSingle({ event, onViewDetails }) {
  const dateText = event.datetime || event.date || "";
  const locationText = event.location || event.venue || "";

  return (
    <div className="relative w-full">
      <div className="rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] bg-black">
        <div className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] lg:h-[320px]">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/1600x900/111827/ffffff?text=No+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

          <div className="absolute left-6 top-6">
            <span className="inline-block bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold text-sm px-3 py-1 rounded-full">
              Featured Event
            </span>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 w-[90%] sm:w-[78%] md:w-[70%] lg:w-[64%]">
            <div className="bg-gradient-to-r from-[#0b0b0b]/80 to-[#0b0b0b]/70 border border-gray-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-2">{event.title}</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-300" />
                  <span>{dateText}</span>
                </div>
                {locationText ? <div className="text-sm text-gray-400">• {locationText}</div> : null}
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails && onViewDetails(event.id);
                  }}
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold px-5 py-3 rounded-full"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FeaturedCarousel = ({ events = [], interval = 3000, onViewDetails }) => {
  const [index, setIndex] = React.useState(0);
  const eventsCount = events.length;
  const autoRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const next = React.useCallback(() => setIndex((i) => (eventsCount ? (i + 1) % eventsCount : 0)), [eventsCount]);
  const prev = React.useCallback(() => setIndex((i) => (eventsCount ? (i - 1 + eventsCount) % eventsCount : 0)), [eventsCount]);

  React.useEffect(() => {
    if (!eventsCount) return;
    autoRef.current = setInterval(() => setIndex((i) => (i + 1) % eventsCount), interval);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [eventsCount, interval]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pause = () => { if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; } };
    const resume = () => { if (!autoRef.current && eventsCount) autoRef.current = setInterval(() => setIndex((i) => (i + 1) % eventsCount), interval); };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    return () => {
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [eventsCount, interval]);

  if (!eventsCount) return null;
  const currentEvent = events[index];

  return (
    <div className="relative overflow-visible" ref={containerRef}>
      <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div onClick={() => onViewDetails && onViewDetails(currentEvent.id)}>
        <FeaturedEventSingle event={currentEvent} onViewDetails={onViewDetails} />
      </div>

      {eventsCount > 1 && (
        <div className="mt-6 flex justify-center space-x-3">
          {events.map((_, i) => (
           <button
  key={i}
  onClick={(e) => {
    e.stopPropagation();
    setIndex(i);
  }}
  className={`w-2 h-2 rounded-full transition-all ${
    i === index
      ? "bg-white scale-125"
      : "bg-white/40 hover:bg-white/60"
  }`}
 />

          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------
   MAIN Feed
------------------------- */
const fetchEventsFromAPI = async () => {
  try {
    const res = await fetch("/api/events", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch events");

    const data = await res.json();

    return data.map((ev) => ({
      ...ev,
      id: ev._id || ev.id,
      title: ev.title,
      poster: ev.poster,
      isFeatured: Boolean(ev.isFeatured),
      datetime: ev.date || ev.datetime,
      location: ev.venue || ev.location,
    }));
  } catch (err) {
    console.error("Feed event fetch error:", err);
    return [];
  }
};


export default function Feed({ communitiesProp = null, eventsProp = null }) {
  const router = useRouter();

  const [communitiesState, setCommunitiesState] = React.useState(() => {
    if (communitiesProp && Array.isArray(communitiesProp) && communitiesProp.length) {
      return normalizeCommunities(communitiesProp);
    }
    return [];
  });

  const [featuredEventsState, setFeaturedEventsState] = React.useState([]);
  React.useEffect(() => {
  let mounted = true;

  const loadEvents = async () => {
    const allEvents = await fetchEventsFromAPI();
    if (!mounted) return;

    const featured = allEvents.filter((ev) => ev.isFeatured);

    setFeaturedEventsState(
      featured.length ? featured : allEvents.slice(0, 3)
    );
  };

  loadEvents();

  return () => {
    mounted = false;
  };
}, []);


  // initial load: prefer confique:allCommunities or other snapshots
  React.useEffect(() => {
    if (communitiesState && communitiesState.length) return;
    const stored = readCommunitiesFromStorage();
    if (Array.isArray(stored) && stored.length) {
      setCommunitiesState(normalizeCommunities(stored));
    } else {
      // fallback minimal defaults (I added 4 so there are extras to hide)
      setCommunitiesState(normalizeCommunities([
        { id: "c1", name: "Fitness Fanatics", description: "Workouts and nutrition advice.", membersCount: 55000, hero: "/community-1.jpg", category: "Sports" },
        { id: "c2", name: "Crypto Hub", description: "News, trading strategies and research.", membersCount: 32000, hero: null, category: "Tech" },
        { id: "c3", name: "Tech Innovators", description: "Discussions on next-gen tech.", membersCount: 23700, hero: "/community-3.jpg", category: "Tech" },
        { id: "c4", name: "Web Dev", description: "webde is a key of success", membersCount: 1, hero: null, category: "Tech" },
      ]));
    }

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen to storage & custom events to update (so ExplorePage changes reflect here)
  React.useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      try {
        if (e.key === "confique:allCommunities" || e.key === "confique:communities" || e.key === "recommendedCommunities") {
          const parsed = JSON.parse(e.newValue || "[]");
          if (Array.isArray(parsed)) {
            setCommunitiesState(normalizeCommunities(parsed));
          }
        }
       
      } catch {
        // ignore parse errors
      }
    };

    const onCustomCommunities = (evt) => {
      const payload = evt?.detail;
      if (!payload) return;
      const arr = Array.isArray(payload) ? payload : [payload];
      setCommunitiesState((prev) => {
        const merged = normalizeCommunities([...prev, ...arr]);
        // dedupe by slug or id
        const map = new Map();
        merged.forEach((c) => map.set(c.slug || c.id, c));
        return Array.from(map.values());
      });
    };

   

    window.addEventListener("storage", onStorage);
    window.addEventListener("confique:communities-updated", onCustomCommunities);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("confique:communities-updated", onCustomCommunities);
    };
  }, []);

  // POLL: periodically check localStorage for updates (only when tab visible).
  React.useEffect(() => {
    let intervalId = null;
    const POLL_MS = 5000;

    const pollFn = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const stored = readCommunitiesFromStorage();
      if (!Array.isArray(stored)) return;
      const normalized = normalizeCommunities(stored);

      // quick shallow compare by length + lastUpdated-like heuristic (ids + descriptions)
      const cur = communitiesState || [];
      const sameLength = normalized.length === cur.length;
      const quickEqual =
        sameLength &&
        normalized.every((n, i) => {
          const c = cur[i];
          if (!c) return false;
          return n.id === c.id && (n.description || "") === (c.description || "") && (n.membersCount || 0) === (c.membersCount || 0);
        });

      if (!quickEqual) {
        setCommunitiesState(normalized);
      }
    };

    intervalId = setInterval(pollFn, POLL_MS);
    // run once immediately
    pollFn();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [communitiesState]);

  const goToCommunity = (community) => {
    const slug = community?.slug || slugify(community?.name || "");
    router.push(`/groups?invited=${encodeURIComponent(slug)}`);
  };

  const viewEventDetails = (eventId) => {
    if (!eventId) return;
    router.push(`/events?event=${encodeURIComponent(eventId)}`);
  };
  

  // <-- IMPORTANT: show only first 3 communities (one row)
const visibleCommunities = (communitiesState || []).slice(0, 3);

return (
  <div className="min-h-screen bg-[#0d0d0d]">

 <div className="w-full py-4">
    <div className="mx-auto max-w-[1300px] px-4">

      <section className="pt-0 pb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">
  Communities
</h2>


          <p className="mt-1 text-sm text-gray-400 sm:mt-0 sm:text-right">
            Discover communities you may like
          </p>
        </div>
        {/* Single-row layout with exactly 3 cards on large screens */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCommunities.map((c, index) => (
   <CommunityCard
    key={c.id || c.slug || c.name}
    c={{
      ...c,
      slug: c.slug || slugify(c.name),
      members: c.members || (c.membersCount ? `${c.membersCount} members` : "0 members"),
      description: c.description || "",
    }}
    index={index}
    onOpen={goToCommunity}
    />
))}
        </div>

        {/* On small screens keep the horizontal scroll version */}
        <div className="sm:hidden mt-2">
          <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-6 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
            {visibleCommunities.map((c, index) => (
  <CommunityCard
    key={c.id || c.slug || index}
    c={{
      ...c,
      slug: c.slug || slugify(c.name),
      members: c.members || (c.membersCount ? `${c.membersCount} members` : "0 members"),
      description: c.description || "",
    }}
    index={index}
    onOpen={goToCommunity}
    className="min-h-[300px]"
  />
))}

          </div>
        </div>
      </section>

      {/* Featured events */}
      <div className="flex items-center justify-between mt-10 mb-3">
        <h2 className="text-2xl font-extrabold text-white">Featured Events</h2>
        <button
          onClick={() => router.push("/events")}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          See all events
        </button>
      </div>

      <section className="mb-12">
        {featuredEventsState && featuredEventsState.length > 0 ? (
          <FeaturedCarousel
            events={featuredEventsState}
            interval={3000}
            onViewDetails={viewEventDetails}
          />
        ) : (
          <div className="p-6 bg-gray-900 rounded-lg text-center text-gray-400">
            No featured events right now.
          </div>
        )}
      </section>

    </div>
  </div>
  </div>
);

}
