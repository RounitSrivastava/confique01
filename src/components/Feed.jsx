// components/Feed.jsx
"use client";

import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

/* -----------------------------------
   Default fallback communities/events
-------------------------------------- */
const defaultCommunities = [
  {
    id: "c1",
    name: "Fitness Fanatics",
    description: "Workouts and nutrition advice.",
    members: "55.0k members",
    hero: "/community-1.jpg",
    gradient: "linear-gradient(180deg,#0f1720,#071018)",
    slug: "fitness-fanatics",
    category: "Sports",
  },
  {
    id: "c2",
    name: "Crypto Hub",
    description: "News, trading strategies and research.",
    members: "32.0k",
    hero: null,
    gradient: "linear-gradient(180deg,#f59e0b,#c2410c)",
    slug: "crypto-hub",
    category: "Tech",
  },
  {
    id: "c3",
    name: "Tech Innovators",
    description: "Discussions on next-gen tech.",
    members: "23.7k",
    hero: "/community-3.jpg",
    gradient: "linear-gradient(180deg,#0f1720,#0b1220)",
    slug: "tech-innovators",
    category: "Tech",
  },
];

const defaultFeaturedEvents = [
  {
    id: 101,
    title: "Featured: Raiders Reckoning",
    poster: "https://placehold.co/1600x900/111827/ffffff?text=Raiders+Reckoning",
    category: "Competition",
    date: "Thu, 15 Dec 2025",
    venue: "KIIT Auditorium",
    datetime: "Thu, 15 Dec 2025",
    location: "KIIT Auditorium",
    isFeatured: true,
  },
  {
    id: 102,
    title: "Featured: Hackify Battle",
    poster: "https://placehold.co/1600x900/0D47A1/ffffff?text=Hackify+Battle",
    category: "Tech",
    date: "Thu, 15 Dec 2025",
    venue: "Online",
    datetime: "Thu, 15 Dec 2025",
    location: "Online",
    isFeatured: true,
  },
  {
    id: 999,
    title: "Global Tech Summit 2026",
    poster: "https://placehold.co/1600x900/004D40/ffffff?text=Global+Tech+Summit",
    category: "Seminar",
    date: "May 10-12 2026",
    venue: "Virtual Event",
    datetime: "May 10-12 2026",
    location: "Virtual Event",
    isFeatured: true,
  },
];

/* -----------------------------------
   Helpers
-------------------------------------- */
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

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");

/* -----------------------------------
   COMMUNITY CARD — equal heights + responsive behaviour
-------------------------------------- */
function CommunityCard({ c, onOpen, className = "" }) {
  return (
    <article
      onClick={() => onOpen && onOpen(c)}
      className={`rounded-2xl overflow-hidden shadow-2xl bg-[#0d0d0d] border border-[#151515] cursor-pointer hover:shadow-3xl transition-shadow flex flex-col h-full ${className}`}
    >
      {c.hero ? (
        <div className="h-36 w-full overflow-hidden flex-shrink-0">
          <Image src={c.hero} alt={c.name} width={800} height={240} className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="h-36 w-full flex-shrink-0" style={{ background: c.gradient }} />
      )}

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white">{c.name}</h3>
        <p className="mt-2 text-sm text-gray-300 flex-grow">{c.description}</p>
        <p className="mt-4 text-sm text-gray-400 font-semibold">{c.members}</p>
      </div>
    </article>
  );
}

/* -----------------------------------
   FEATURED EVENT SINGLE (clean layout, no tags, preserves date/location & CTA)
-------------------------------------- */
function FeaturedEventSingle({ event, onViewDetails }) {
  const dateText = event.datetime || event.date || "";
  const locationText = event.location || event.venue || "";

  return (
    <div className="relative w-full">
      <div className="rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] bg-black">
        <div className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <span className="inline-block bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold text-sm px-3 py-1 rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.12)]">
              Featured Event
            </span>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 w-[90%] sm:w-[78%] md:w-[70%] lg:w-[64%]">
            <div className="bg-gradient-to-r from-[#0b0b0b]/80 to-[#0b0b0b]/70 border border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
              <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-2">
                {event.title}
              </h3>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-300" />
                  <span>{dateText}</span>
                </div>
                {locationText ? (
                  <div className="text-sm text-gray-400">• {locationText}</div>
                ) : null}
              </div>

              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails && onViewDetails(event.id);
                  }}
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold px-5 py-3 rounded-full transition-colors shadow-md"
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

/* -----------------------------------
   Featured carousel (auto-advance with responsive arrows & dots)
-------------------------------------- */
const FeaturedCarousel = ({ events = [], interval = 6000, onViewDetails }) => {
  const [index, setIndex] = React.useState(0);
  const eventsCount = events.length;
  const autoRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const next = React.useCallback(() => {
    setIndex((i) => (eventsCount ? (i + 1) % eventsCount : 0));
  }, [eventsCount]);

  const prev = React.useCallback(() => {
    setIndex((i) => (eventsCount ? (i - 1 + eventsCount) % eventsCount : 0));
  }, [eventsCount]);

  // auto-advance
  React.useEffect(() => {
    if (!eventsCount) return;
    autoRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % eventsCount);
    }, interval);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [eventsCount, interval]);

  // pause/resume on hover/touch
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pause = () => {
      if (autoRef.current) {
        clearInterval(autoRef.current);
        autoRef.current = null;
      }
    };
    const resume = () => {
      if (!autoRef.current && eventsCount) {
        autoRef.current = setInterval(() => {
          setIndex((i) => (i + 1) % eventsCount);
        }, interval);
      }
    };
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
    // overflow-visible so arrows are not clipped on small screens
    <div className="relative overflow-visible" ref={containerRef}>
      {/* responsive arrow positions and sizes */}
      <button
        aria-label="Previous"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white shadow-lg backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        aria-label="Next"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white shadow-lg backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
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
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${i === index ? "bg-white scale-110" : "bg-white/40 hover:bg-white/70"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* -----------------------------------
   MAIN FEED
-------------------------------------- */
export default function Feed({ communitiesProp = null, eventsProp = null }) {
  const router = useRouter();

  const [communitiesState, setCommunitiesState] = React.useState(() =>
    communitiesProp && Array.isArray(communitiesProp) && communitiesProp.length
      ? communitiesProp.map((c) => ({ ...c, slug: c.slug || slugify(c.name) }))
      : defaultCommunities
  );

  const [featuredEventsState, setFeaturedEventsState] = React.useState(() =>
    eventsProp && Array.isArray(eventsProp) && eventsProp.length
      ? eventsProp.filter((e) => e.isFeatured)
      : defaultFeaturedEvents
  );

  const mergeCommunities = React.useCallback(
    (incoming) => {
      if (!Array.isArray(incoming)) return;
      const map = new Map();
      (communitiesState || []).forEach((c) => map.set(c.slug || c.id || slugify(c.name), c));
      incoming.forEach((c) => {
        const key = c.slug || c.id || slugify(c.name);
        map.set(key, {
          ...c,
          slug: c.slug || slugify(c.name),
          members: c.members || (typeof c.membersCount === "number" ? `${c.membersCount} members` : c.members || "0 members"),
        });
      });
      setCommunitiesState(Array.from(map.values()));
    },
    [communitiesState]
  );

  React.useEffect(() => {
    if (communitiesProp && Array.isArray(communitiesProp) && communitiesProp.length) {
      setCommunitiesState(communitiesProp.map((c) => ({ ...c, slug: c.slug || slugify(c.name) })));
    } else {
      const storedCommunities = readJsonLocal("confique:communities") || readJsonLocal("recommendedCommunities") || null;
      if (Array.isArray(storedCommunities) && storedCommunities.length) {
        setCommunitiesState(storedCommunities.map((c) => ({ ...c, slug: c.slug || slugify(c.name), members: c.members || (c.membersCount ? `${c.membersCount} members` : "0 members") })));
      } else {
        setCommunitiesState(defaultCommunities);
      }
    }

    if (eventsProp && Array.isArray(eventsProp) && eventsProp.length) {
      setFeaturedEventsState(eventsProp.filter((e) => e.isFeatured));
    } else {
      const storedEvents = readJsonLocal("EVENTS_SNAPSHOT") || readJsonLocal("confique:events") || null;
      if (Array.isArray(storedEvents) && storedEvents.length) {
        const featured = storedEvents.filter((ev) => ev.isFeatured);
        setFeaturedEventsState(featured.length ? featured : storedEvents.slice(0, 3));
      } else {
        setFeaturedEventsState(defaultFeaturedEvents);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      try {
        if (e.key === "confique:communities" || e.key === "recommendedCommunities") {
          const parsed = JSON.parse(e.newValue || "[]");
          if (Array.isArray(parsed)) mergeCommunities(parsed);
        }
        if (e.key === "confique:events" || e.key === "EVENTS_SNAPSHOT") {
          const parsed = JSON.parse(e.newValue || "[]");
          if (Array.isArray(parsed)) {
            const featured = parsed.filter((ev) => ev.isFeatured);
            setFeaturedEventsState(featured.length ? featured : parsed.slice(0, 3));
          }
        }
      } catch {
        // ignore
      }
    };

    const onCustomCommunities = (evt) => {
      const payload = evt?.detail;
      if (!payload) return;
      if (Array.isArray(payload)) mergeCommunities(payload);
      else if (payload && typeof payload === "object") mergeCommunities([payload]);
    };

    const onCustomEvents = (evt) => {
      const payload = evt?.detail;
      if (!payload) return;
      if (Array.isArray(payload)) {
        const featured = payload.filter((ev) => ev.isFeatured);
        setFeaturedEventsState(featured.length ? featured : payload.slice(0, 3));
      } else if (payload && typeof payload === "object") {
        if (payload.isFeatured) setFeaturedEventsState((prev) => [payload, ...prev]);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("confique:communities-updated", onCustomCommunities);
    window.addEventListener("confique:events-updated", onCustomEvents);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("confique:communities-updated", onCustomCommunities);
      window.removeEventListener("confique:events-updated", onCustomEvents);
    };
  }, [mergeCommunities]);

  const goToCommunity = (community) => {
    const slug = community?.slug || slugify(community?.name || "");
    router.push(`/groups?invited=${encodeURIComponent(slug)}`);
  };

  const viewEventDetails = (eventId) => {
    if (!eventId) return;
    router.push(`/events?event=${encodeURIComponent(eventId)}`);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4">
      {/* COMMUNITIES */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-white">Communities</h2>
          <p className="text-sm text-gray-400">Discover communities you may like</p>
        </div>

        {/* Desktop / larger screens: original grid layout */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communitiesState.map((c) => (
            <CommunityCard
              key={c.id || c.slug || c.name}
              c={{ ...c, slug: c.slug || slugify(c.name), members: c.members || (c.membersCount ? `${c.membersCount} members` : "0 members") }}
              onOpen={goToCommunity}
            />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden mt-2">
          <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-6 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
            {communitiesState.map((c) => (
              <div key={c.id || c.slug || c.name} className="snap-start">
                <CommunityCard
                  c={{ ...c, slug: c.slug || slugify(c.name), members: c.members || (c.membersCount ? `${c.membersCount} members` : "0 members") }}
                  onOpen={goToCommunity}
                  className="min-h-[300px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS carousel */}
      <div className="flex items-center justify-between mt-10 mb-3">
        <h2 className="text-2xl font-extrabold text-white">Featured Events</h2>
        <button onClick={() => router.push("/events")} className="text-sm text-purple-400 hover:text-purple-300">
          See all events
        </button>
      </div>

      <section className="mb-12">
        {featuredEventsState && featuredEventsState.length > 0 ? (
          <FeaturedCarousel events={featuredEventsState} interval={6000} onViewDetails={viewEventDetails} />
        ) : (
          <div className="p-6 bg-gray-900 rounded-lg text-center text-gray-400">No featured events right now.</div>
        )}
      </section>
    </div>
  );
}
