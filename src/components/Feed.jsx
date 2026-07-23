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
const fetchCommunities = async () => {
  const res = await fetch("/api/groups", {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.groups || data;   // ← THIS is the fix
};

const fetchJoinedFromMe = async () => {
  const res = await fetch("/api/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return {};

  const data = await res.json();
  const user = data.user;

  if (!user) return {};

  const joined = user.joinedGroups || [];
  const created = user.createdGroups || [];
  const map = {};
  [...joined, ...created].forEach((g) => {
    map[String(g._id || g.id)] = true;
  });
  return map;
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
    const members = `${membersCount.toLocaleString()} members`;
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

function CommunityCard({ c, index = 0, onOpen, onJoin, isJoined, className = "" }) {
  const bannerImg = null; // banner disabled, logo-first design
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
  onClick={() => isJoined && onOpen && onOpen(c)}
className={`rounded-2xl overflow-hidden shadow-2xl bg-bg-4 border border-white/15 hover:border-white/30 cursor-pointer transition-all flex flex-col h-full ${className}`}

    >
      <div className="h-36 w-full overflow-hidden flex-shrink-0 rounded-t-2xl bg-bg-2">
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
      className="w-full h-full flex items-center justify-center text-3xl font-bold text-text-1"
      style={{ background: gradientStyle }}
    >
      {c.name?.charAt(0)}
    </div>
  )}
</div>


      <div className="p-5 lg:px-4 lg:pt-3 lg:pb-3 flex flex-col h-full">
        <h3 className="text-lg font-bold text-text-1">{c.name}</h3>

        <p
  className="mt-1 text-sm text-text-2 lg:text-xs flex-grow"
  style={clampStyle}
>

          {description}
        </p>
        <p className="mt-3 lg:mt-2 text-sm lg:text-xs text-text-3 font-medium">
  {c.members || (typeof c.membersCount === "number" ? `${c.membersCount.toLocaleString()} members` : "0 members")}
</p>

<div className="mt-3 flex justify-end">
  {isJoined ? (
    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white text-black">
      Joined
    </span>
  ) : (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onJoin(c);
      }}
      className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600 hover:bg-purple-700 text-text-1"
    >
      Join
    </button>
  )}
</div>
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
      <div className="rounded-[22px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] bg-transparent">
        <div className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] lg:h-[320px] rounded-[22px] overflow-hidden">
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
            <span className="inline-block bg-gradient-to-r from-purple-500 to-violet-600 text-text-1 font-semibold text-sm px-3 py-1 rounded-full">
              Featured Event
            </span>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 w-[90%] sm:w-[78%] md:w-[70%] lg:w-[64%]">
            <div className="bg-gradient-to-r from-[#0b0b0b]/80 to-[#0b0b0b]/70 border border-border-2 rounded-xl p-5 shadow-xl">
              <h3 className="text-xl md:text-2xl font-extrabold text-text-1 leading-tight mb-2">{event.title}</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-text-2 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-text-2" />
                  <span>{dateText}</span>
                </div>
                {locationText ? <div className="text-sm text-text-3">• {locationText}</div> : null}
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails && onViewDetails(event.id);
                  }}
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 text-text-1 font-semibold px-5 py-3 rounded-full"
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
   <div
  ref={containerRef}
  className="relative overflow-hidden"
>
      <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-bg-1/50 flex items-center justify-center">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-bg-1/50 flex items-center justify-center">
        <ChevronRight className="w-5 h-5" />
      </button>

     <div
  onClick={() => onViewDetails && onViewDetails(currentEvent.id)}
  className="rounded-[22px] overflow-hidden"
>
  <FeaturedEventSingle event={currentEvent} onViewDetails={onViewDetails} />
</div>

      {eventsCount > 1 && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
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

function EventCard({ event, onOpen }) {
  return (
    <div
      onClick={() => onOpen(event.id)}
      className="rounded-2xl overflow-hidden bg-bg-4 border border-border-2 hover:border-white/25 cursor-pointer transition shadow-lg"
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={event.poster}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "https://placehold.co/600x400")}
        />
      </div>

      <div className="p-4">
        <p className="text-text-1 font-semibold line-clamp-1">
          {event.title}
        </p>
        <p className="text-xs text-text-3 mt-1">
          {event.datetime}
        </p>
        <p className="text-xs text-text-4">
          {event.location}
        </p>
      </div>
    </div>
  );
}

function EventRow({ event, onOpen }) {
  return (
    <div
      onClick={() => onOpen(event.id)}
      className="flex gap-4 p-4 rounded-xl bg-bg-4 border border-border-2 hover:border-white/25 cursor-pointer transition"
    >
      <img
        src={event.poster}
        className="w-28 h-20 object-cover rounded-lg"
        onError={(e) => (e.target.src = "https://placehold.co/300x200")}
      />

      <div className="flex flex-col flex-grow">
        <p className="font-semibold text-text-1 line-clamp-1">
          {event.title}
        </p>
        <p className="text-xs text-text-3 mt-1">
          {event.datetime}
        </p>
        <p className="text-xs text-text-4">
          {event.location}
        </p>
      </div>
    </div>
  );
}

export default function Feed({ communitiesProp = null, eventsProp = null }) {
  const router = useRouter();
 const [joinedMap, setJoinedMap] = React.useState({});
  const [threeCardEvents, setThreeCardEvents] = React.useState([]);
  const [remainingEvents, setRemainingEvents] = React.useState([]);

  const [communitiesState, setCommunitiesState] = React.useState(() => {
    if (communitiesProp && Array.isArray(communitiesProp) && communitiesProp.length) {
      return normalizeCommunities(communitiesProp);
    }
    return [];
  });

  const [featuredEventsState, setFeaturedEventsState] = React.useState([]);
  const allEventsRef = React.useRef([]);

  React.useEffect(() => {
  let mounted = true;

 const loadEvents = async () => {
  const allEvents = await fetchEventsFromAPI();
  if (!mounted) return;

  allEventsRef.current = allEvents;

  const featured = allEvents.filter(ev => ev.isFeatured);
  const nonFeatured = allEvents.filter(ev => !ev.isFeatured);

  // 🟣 CAROUSEL
  const carouselEvents =
    featured.length > 0 ? featured.slice(0, 2) : allEvents.slice(0, 2);

  setFeaturedEventsState(carouselEvents);

  // 🟣 3 CARDS (never from carousel)
  const carouselIds = new Set(carouselEvents.map(e => String(e.id)));
  const cards = allEvents.filter(e => !carouselIds.has(String(e.id)));

  setThreeCardEvents(cards.slice(0, 3));
  setRemainingEvents(cards.slice(3,5));
};
  loadEvents();

  return () => {
    mounted = false;
  };
}, []);

React.useEffect(() => {
  let mounted = true;

  const load = async () => {
   const [groups, joined] = await Promise.all([
  fetchCommunities(),
  fetchJoinedFromMe(),
]);

    if (!mounted) return;

    setCommunitiesState(normalizeCommunities(groups));
    setJoinedMap(joined || {});
  };

  load();

  return () => {
    mounted = false;
  };
}, []);
    
  const goToCommunity = (community) => {
    const slug = community?.slug || slugify(community?.name || "");
    router.push(`/groups?invited=${encodeURIComponent(slug)}`);
  };

  const viewEventDetails = (eventId) => {
    if (!eventId) return;
    router.push(`/events?event=${encodeURIComponent(eventId)}`);
  };
 const handleJoin = async (community) => {
  const email = localStorage.getItem("userEmail");
  if (!email) return;

  try {
    const res = await fetch(`/api/groups/${community.id}/join`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: email }),
    });

    if (!res.ok) return;

    // Mark joined
    setJoinedMap((prev) => ({ ...prev, [community.id]: true }));

    // Increase members locally
    setCommunitiesState((prev) =>
      prev.map((c) =>
        c.id === community.id
          ? { ...c, membersCount: c.membersCount + 1 }
          : c
      )
    );
  } catch (e) {
    console.error("Join failed", e);
  }
};
  // <-- IMPORTANT: show only first 3 communities (one row)
const visibleCommunities = (communitiesState || []).slice(0, 3);

return (
  <div className="min-h-screen bg-bg-4">

 <div className="w-full py-4">
    <div className="mx-auto max-w-[1300px] px-4">

      <section className="pt-0 pb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-text-1">
  Communities
</h2>


          <p className="mt-1 text-sm text-text-3 sm:mt-0 sm:text-right">
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
  onJoin={handleJoin}
  isJoined={!!joinedMap[c.id]}
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
  onJoin={handleJoin}
  isJoined={!!joinedMap[c.id]}
  className="min-h-[300px]"
/>
))}

          </div>
        </div>
      </section>

      {/* Featured events */}
      <div className="flex items-center justify-between mt-10 mb-3">
        <h2 className="text-2xl font-extrabold text-text-1">Featured Events</h2>
        <button
          onClick={() => router.push("/events")}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          See all events
        </button>
      </div>

   <section className="mb-12">

  {/* CAROUSEL */}
  {featuredEventsState.length > 0 && (
    <div className="mb-12">
  <FeaturedCarousel
    events={featuredEventsState}
    interval={3000}
    onViewDetails={viewEventDetails}
  />
</div>
  )}

  {/* 3 FEATURED EVENT CARDS */}
 {/* 3 NON-FEATURED EVENT CARDS */}
<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {threeCardEvents.map((ev) => (
    <EventCard key={ev.id} event={ev} onOpen={viewEventDetails} />
  ))}
</div>

  {/* REMAINING EVENTS (VERTICAL) */}
  {remainingEvents.length > 0 && (
    <div className="mt-10 space-y-4">
      {remainingEvents.map((ev) => (
        <EventRow
          key={ev.id}
          event={ev}
          onOpen={viewEventDetails}
        />
      ))}
    </div>
  )}
</section>

    </div>
  </div>
  </div>
);
}