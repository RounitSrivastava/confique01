"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { CalendarPlus } from "lucide-react";
import EventDetailsPage from "./EventDetailsPage";
import HostEventPage from "./HostEventPage";
import AllEventsPage from "./AllEventsPage";

import {
  Search, User, Zap, Code, Shirt, Medal, Compass, BookOpen,
  Clock, MapPin, Calendar, X, Heart, Share2, ChevronRight,
  ChevronLeft, Eye, Home, Users, CalendarDays, Plus, Clipboard, Settings, LogOut,Rocket,Briefcase 
} from "lucide-react";
// --- AUTH HELPER ---
const fetchMeData = async () => {
    try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return { user: null }; // Redirects if 401 Unauthorized
        const data = await res.json();
        return data;
    } catch (e) {
        return { user: null };
    }
};
// --- Featured Carousel Poster Helper ---
// --- Featured Carousel Poster Helper (STRICT: NO LOGOS EVER) ---
// --- Featured Carousel Gradient Helper ---
const isCultural = (event) => event.category === "Cultural";
const FEATURED_GRADIENTS = [
  "from-purple-700 via-purple-900 to-black",
  "from-indigo-700 via-indigo-900 to-black",
  "from-pink-700 via-rose-900 to-black",
  "from-emerald-700 via-emerald-900 to-black",
  "from-blue-700 via-blue-900 to-black",
  "from-orange-600 via-orange-900 to-black",
  "from-cyan-700 via-cyan-900 to-black",
];

const getFeaturedGradient = (event) => {
  if (!event) return FEATURED_GRADIENTS[0];

  const hash = String(event.id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return FEATURED_GRADIENTS[hash % FEATURED_GRADIENTS.length];
};

// --- CONSTANTS ---
const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg?w=200&h=200&fit=crop";

// --- MOCK DATA ---
const MOCK_EVENTS = [
  {
    id: 1,
    title: "L'Oréal Brandstorm",
    venue: "Online | Rose Garden, Campus-18",
    date: "Wed, 29 Apr 2025",
    poster: "https://placehold.co/400x550/4A148C/ffffff?text=L'OREAL+BRANDSTORM",
    tags: ["Team (4)", "Free"],
    isFeatured: true,
    category: "Competition",
    rounds: [
      { title: "Registration Opens", description: "Sign up and form your teams.", date: "15 Mar" },
      { title: "Concept Submission Deadline", description: "Submit your brand strategy pitch.", date: "30 Mar" },
      { title: "National Finals", description: "Top teams compete for the global spot.", date: "29 Apr" },
    ],
  },
  {
    id: 2,
    title: "Raiders Reckoning",
    venue: "KIIT Auditorium",
    date: "Sun, 7 Nov 2025",
    poster: "https://placehold.co/400x550/212121/ffffff?text=RAIDERS+RECKONING",
    tags: ["Solo", "Free"],
    category: "Competition",
    rounds: [
      { title: "Qualifier Round 1", description: "Online quiz challenge.", date: "20 Oct" },
      { title: "Main Event Registration", description: "Final check-in for competitors.", date: "01 Nov" },
      { title: "Final Battle Stage", description: "Live competitive gaming event.", date: "07 Nov" },
    ],
  },
  {
    id: 3,
    title: "RaagRang – Inter-College Cultural Fest",
    venue: "Multiple Venues",
    date: "Sat, 6 Jun 2026",
    poster: "https://placehold.co/400x550/FF5722/ffffff?text=STAND+UP+COMEDY+SHOW",
    tags: ["Team (3)"],
    category: "Cultural",
  },
  {
    id: 4,
    title: "KIIT International Model United Nations",
    venue: "KIIT Campus",
    date: "Jan 29 2026",
    poster: "https://placehold.co/400x550/3F51B5/ffffff?text=KIIT+MUN+2025",
    tags: ["Team (4)", "Free"],
    category: "Competition",
  },
  {
    id: 5,
    title: "Hackify Battle on TryHackMe",
    venue: "Online",
    date: "Thu, 1 Dec 2025",
    poster: "https://placehold.co/400x550/0D47A1/ffffff?text=CYBER+SECURITY+CONFERENCE",
    tags: ["Solo", "Free"],
    category: "Tech",
  },
  {
    id: 6,
    title: "AI & ML Workshop",
    venue: "Online",
    date: "Sat, 20 Nov 2025",
    poster: "https://placehold.co/400x550/4CAF50/ffffff?text=AI+WORKSHOP",
    tags: ["Solo", "Paid"],
    category: "Tech",
  },
  {
    id: 7,
    title: "Web Dev Hackathon",
    venue: "Campus Hall 3",
    date: "Fri, 14 Nov 2025",
    poster: "https://placehold.co/400x550/FFC107/ffffff?text=HACKATHON",
    tags: ["Team (2)", "Free"],
    category: "Tech",
  },
  {
    id: 8,
    title: "Data Science Summit",
    venue: "Online",
    date: "Wed, 10 Dec 2025",
    poster: "https://placehold.co/400x550/FF9800/ffffff?text=DATA+SCIENCE",
    tags: ["Solo", "Paid"],
    category: "Tech",
  },
  {
    id: 9,
    title: "Photography Exhibition",
    venue: "Art Gallery",
    date: "Sat, 15 Jan 2026",
    poster: "https://placehold.co/400x550/795548/ffffff?text=PHOTO+EXHIBIT",
    tags: ["Solo", "Free"],
    category: "Cultural",
  },
  {
    id: 10,
    title: "Startup Pitch Competition",
    venue: "Main Hall",
    date: "Mon, 28 Feb 2026",
    poster: "https://placehold.co/400x550/00BCD4/ffffff?text=PITCH+COMP",
    tags: ["Team (3)", "Paid"],
    category: "Competition",
  },
  {
    id: 11,
    title: "Music Production Masterclass",
    venue: "Online Studio",
    date: "Fri, 10 Dec 2025",
    poster: "https://placehold.co/400x550/000000/ffffff?text=MUSIC+PROD",
    tags: ["Solo", "Paid"],
    category: "Workshop",
  },
  {
    id: 12,
    title: "Creative Writing Retreat",
    venue: "Campus Library",
    date: "Sun, 20 Feb 2026",
    poster: "https://placehold.co/400x550/D81B60/ffffff?text=WRITING+RETREAT",
    tags: ["Solo", "Free"],
    category: "Seminar",
  },
  {
    id: 13,
    title: "Blockchain Basics",
    venue: "Online",
    date: "Mon, 13 Mar 2026",
    poster: "https://placehold.co/400x550/4FC3F7/ffffff?text=BLOCKCHAIN",
    tags: ["Solo", "Free"],
    category: "Tech",
  },
  {
    id: 14,
    title: "Annual Sports Meet",
    venue: "Stadium",
    date: "Sat, 5 Apr 2026",
    poster: "https://placehold.co/400x550/E53935/ffffff?text=SPORTS+MEET",
    tags: ["Team (5)", "Free"],
    category: "Competition",
  },
  {
    id: 15,
    title: "Art of Public Speaking",
    venue: "Auditorium",
    date: "Wed, 25 May 2026",
    poster: "https://placehold.co/400x550/9C27B0/ffffff?text=PUBLIC+SPEAKING",
    tags: ["Solo", "Paid"],
    category: "Workshop",
  },
];

export const categories = [
  { name: "All Events", icon: Zap },
  { name: "Tech", icon: Code },
  { name: "Entrepreneurship", icon: Briefcase },
  { name: "Competition", icon: Medal },
  { name: "Cultural", icon: Compass },
  { name: "Seminar", icon: BookOpen },
  { name: "Workshop", icon: Clock },
  { name: "Others", icon: null },
];

const TOP_NAV = [
  { label: "Home", href: "/" },
  { label: "Community", href: "/groups" },
  
  { label: "Help & Support", href: "/settings", icon: Settings },
];

const MOBILE_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "Community", href: "/groups", icon: Users },
 
   { label: "Help & Support", href: "/settings", icon: Settings },
];

// --- API Helpers ---
const fetchEventsFromAPI = async () => {
  try {
    const res = await fetch("/api/events", { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch events");
    const data = await res.json();
    return data.map((ev) => ({
      ...ev,
      id: ev._id,
      tags: ev.tags || [],
      category: ev.category || "Others",
      impressions: ev.impressions ?? 0,
    }));
  } catch (err) {
    console.error("❌ API Fetch Error:", err);
    return [];
  }
};

// --- Reusable Components ---
const CategoryButton = ({ name, Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
      isActive
        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
        : "text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white"
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span>{name}</span>
  </button>
);

const EventCard = ({ event, onDetailsClick, onShareClick }) => {
  const [shareFeedback, setShareFeedback] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const localHandleShare = (e) => {
    e.stopPropagation();
    onShareClick(event.id);
    if (navigator.clipboard) {
      setShareFeedback({ icon: Clipboard, text: "Link Copied!" });
      setTimeout(() => setShareFeedback(null), 1500);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  };

  const tagsToDisplay = event.tags?.filter((tag) => !tag.includes("Team") && !tag.includes("Solo")) || [];

  return (
    <div
      onClick={() => onDetailsClick(event.id)}
      className="group flex flex-shrink-0 flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] w-[72vw] max-w-[260px] sm:w-[300px] h-[320px] cursor-pointer"
    >
      <div className="relative w-full overflow-hidden rounded-t-xl">
        <div className="relative w-full h-[160px] bg-black">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover object-center opacity-80"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300/111827/ffffff?text=Image+Not+Found";
            }}
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            {tagsToDisplay.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                  tag.includes("Free") ? "bg-green-500/90 text-white" : "bg-gray-700/90 text-white"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="absolute bottom-3 left-3 bg-white text-gray-900 px-3 py-1 rounded-lg font-bold text-center shadow-lg">
            <p className="text-sm leading-tight">{String(event.date).split(",")[0]?.trim() || "TBD"}</p>
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col justify-between flex-grow ">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-0 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-400 flex items-center mb-1">
          <MapPin className="w-4 h-4 mr-2 text-purple-400" />
          {event.venue?.includes("|") ? event.venue.split("|").slice(-1).pop().trim() : event.venue}
        </p>
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2 pt-2">
          <span className="flex items-center space-x-2">
            <span className="text-gray-400">{event.venue?.includes("Online") ? "Online" : "On-site"}</span>
            <span className="font-semibold text-green-400">{event.tags?.includes("Free") ? "Free" : "Paid"}</span>
          </span>
          <span className="flex items-center space-x-3">
            {event.impressions !== undefined && (
              <div className="flex items-center text-purple-400 text-xs font-semibold">
                <Eye className="w-3 h-3 mr-1" />
                {event.impressions.toLocaleString()}
              </div>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 mt-2">
          <button className="mt-auto w-fit text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors text-left">
            View Details &rarr;
          </button>
          <span className="flex items-center space-x-3">
            {shareFeedback ? (
              <span className="flex items-center text-purple-400 text-xs font-semibold transition-all">
                <shareFeedback.icon className="w-3 h-3 mr-1" />
                {shareFeedback.text}
              </span>
            ) : (
              <Share2
                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={localHandleShare}
              />
            )}
            <Heart
              className={`w-4 h-4 cursor-pointer transition-colors ml-3 ${
                isLiked ? "text-red-500 fill-red-500" : "text-gray-500 hover:text-red-500 hover:fill-gray-900"
              }`}
              onClick={handleLikeClick}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

const PopularEventCard = ({ event, onDetailsClick }) => {
  return (
    <div className="flex flex-shrink-0 w-[80vw] max-w-sm mx-auto sm:w-[300px] sm:max-w-[300px]">
      <div
        className="relative w-full rounded-[1.8rem] overflow-hidden bg-transparent sm:bg-black sm:shadow-[0_18px_60px_rgba(0,0,0,0.8)] cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
        onClick={() => onDetailsClick(event.id)}
      >
        <div className="relative w-full h-[260px] aspect-[4/3] sm:aspect-auto">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x550/111827/ffffff?text=Image+Not+Found";
            }}
          />
          <div className="pointer-events-none absolute inset-0 hidden sm:block bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center">
            <span className="px-3 py-1 rounded-full bg-purple-600 text-[11px] font-semibold text-white shadow-lg shadow-purple-800/70">
              Popular Pick
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HorizontalScrollSection = ({ events, onDetailsClick, onShareClick, title, onViewAllClick, isPopular = false }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const ref = scrollContainerRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (ref) {
        ref.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, [checkScroll, events.length]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const isMobilePopular = isPopular && window.innerWidth < 640;
      const cardWidth = isMobilePopular ? 320 : 300;
      const gap = 24;
      const scrollDistance = isMobilePopular ? cardWidth + gap : cardWidth * 2 + gap;
      const scrollAmount = direction === "left" ? -scrollDistance : scrollDistance;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (events.length === 0) return null;

  return (
    <section className="py-10 relative">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-4xl font-extrabold text-white text-center mb-6">{title}</h2>
        <div className="w-full flex justify-end">
          <button
            onClick={onViewAllClick}
            className="inline-flex items-center text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors px-0 py-0 group"
          >
            View All
            <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300" />
          </button>
        </div>
      </div>
      <div className="relative">
        {events.length > 3 && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent text-white hover:text-purple-400 transition-colors z-20"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        <div ref={scrollContainerRef} className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 snap-x snap-mandatory pr-6">
          {events.map((event) => (
            <div key={event.id} className={`snap-start ${isPopular ? "hidden sm:block" : ""}`}>
              <EventCard event={event} onDetailsClick={onDetailsClick} onShareClick={onShareClick} />
            </div>
          ))}
          {isPopular && events.map((event) => (
            <div key={`mobile-${event.id}`} className="snap-start sm:hidden flex flex-shrink-0">
              <PopularEventCard event={event} onDetailsClick={onDetailsClick} />
            </div>
          ))}
        </div>
        {events.length > 3 && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent text-white hover:text-purple-400 transition-colors z-20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>
    </section>
  );
};

const FeaturedCarousel = ({ events, onDetailsClick, onShareClick, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const nextEvent = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  }, [events.length]);
  const prevEvent = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(nextEvent, interval);
    return () => clearInterval(timer);
  }, [events.length, interval, nextEvent]);

  const event = events[currentIndex];
  if (!event) return null;

  const localHandleShare = (e) => {
    e.stopPropagation();
    onShareClick(event.id);
  };

  const MobileDots = () =>
    events.length > 1 ? (
      <div className="mt-4 flex justify-center space-x-2 z-20 sm:hidden">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-white scale-110" : "bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    ) : null;

  const DesktopDots = () =>
    events.length > 1 ? (
      <div className="mt-6 hidden sm:flex justify-center z-20 relative space-x-3">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
            className={`transition-all duration-300 ${index === currentIndex ? "w-6 h-3 rounded-full bg-white" : "w-3 h-3 rounded-full bg-white/60 hover:bg-white/80"}`}
          />
        ))}
      </div>
    ) : null;

  return (
    <>
      <div className="relative mt-8 mb-10 sm:hidden">
        <div className="relative max-w-sm mx-auto rounded-[1.8rem] overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.8)] bg-black cursor-pointer" onClick={() => onDetailsClick(event.id)}>
          <div className="relative w-full h-[260px]">
          <div className={`absolute inset-0 bg-gradient-to-br ${getFeaturedGradient(event)}`} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
            <div className="absolute top-3 left-4 flex items-center">
              <span className="px-3 py-1 rounded-full bg-[#5B3FFF] text-[11px] font-semibold text-white">Featured Event</span>
            </div>
            <div className="absolute left-4 right-4 bottom-5">
              <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-2xl px-4 py-4">
                <h2 className="text-lg font-bold text-white mb-2">{event.title}</h2>
                <div className="flex items-center text-sm text-gray-200 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{event.date}</span>
                </div>
                <button className="mt-1 text-[13px] font-semibold text-white/90 underline-offset-2 hover:underline flex items-center">
                  Click to view event details <span className="ml-1">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {events.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevEvent(); }} className="absolute -left-[28px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white hover:text-purple-400 z-20"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); nextEvent(); }} className="absolute -right-[28px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white hover:text-purple-400 z-20"><ChevronRight className="w-6 h-6" /></button>
          </>
        )}
        <MobileDots />
      </div>

      <div className="relative w-full max-w-5xl mx-auto py-10 px-6 sm:px-12 rounded-[2rem] shadow-2xl mt-12 mb-16 overflow-hidden transform transition-all duration-500 hover:scale-[1.01] cursor-pointer hidden sm:block" onClick={() => onDetailsClick(event.id)}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xl z-0 rounded-[2rem]" />
        {events.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevEvent(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white z-20 hover:bg-white/40 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); nextEvent(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white z-20 hover:bg-white/40 transition-colors"><ChevronRight className="w-6 h-6" /></button>
          </>
        )}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 p-4 md:pr-8 text-center md:text-left">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter">{event.title}</h1>
            <p className="text-xl text-gray-200 font-medium mb-6 flex items-center justify-center md:justify-start"><Calendar className="w-5 h-5 mr-3 text-yellow-300" />{event.date}</p>
            {event.impressions !== undefined && <p className="text-md text-gray-300 font-medium mb-6 flex items-center justify-center md:justify-start"><Eye className="w-5 h-5 mr-3 text-purple-300" />{event.impressions.toLocaleString()} Impressions</p>}
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <button className="inline-flex items-center bg-white text-gray-900 font-semibold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors group">View details <span className="ml-3 transition-transform group-hover:translate-x-1">&rarr;</span></button>
              <button onClick={localHandleShare} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="md:w-1/2 p-4 mt-8 md:mt-0 flex justify-center">
            <div className="w-full max-w-xs aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 bg-black">
             <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getFeaturedGradient(event)}`}>
  <h3 className="text-white text-xl font-extrabold text-center px-6">
    {event.title}
  </h3>
</div>


            </div>
          </div>
        </div>
        <DesktopDots />
      </div>
    </>
  );
};

// --- MAIN COMPONENT ---
const EventsContent = ({ searchParams }) => {
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicEvents, setDynamicEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Profile Dropdown States ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState({ name: "User", email: "", avatar: DEFAULT_AVATAR });
  const profileRef = useRef(null);

  const searchRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // FIX: Access properties directly from the searchParams prop passed by the parent
  const eventIdParam = searchParams?.event || searchParams?.id;
  const viewParam = searchParams?.view;
  const editIdParam = searchParams?.edit;

  // Load Profile and sync updates
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser({
              name: data.user.name || "User",
              email: data.user.email || "",
              avatar: data.user.avatar || DEFAULT_AVATAR
            });
          }
        }
      } catch (err) {
        console.error("Profile load error", err);
      }
    };
    loadProfile();

    const handleUserUpdate = (e) => {
      if (e.detail?.user) {
        setUser({
          name: e.detail.user.name,
          email: e.detail.user.email,
          avatar: e.detail.user.avatar
        });
      }
    };
    window.addEventListener("confique:user-updated", handleUserUpdate);
    return () => window.removeEventListener("confique:user-updated", handleUserUpdate);
  }, []);

  // Dropdown click-outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Close search when clicking outside
useEffect(() => {
  if (!isSearching) return;

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setIsSearching(false);
      setSearchQuery("");
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [isSearching]);

  // Load Events from API and merge with Mocks
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      const dbEvents = await fetchEventsFromAPI();
      const merged = [...dbEvents, ...MOCK_EVENTS];
      
      const map = new Map();
      merged.forEach(ev => map.set(ev.id, ev));
      
      const finalEvents = Array.from(map.values()).map(ev => ({
        ...ev,
        impressions: typeof ev.impressions === 'number' ? ev.impressions : Math.floor(Math.random() * 2000) + 800
      })).sort((a, b) => b.impressions - a.impressions);

      if (isMounted) {
        setDynamicEvents(finalEvents);
        setLoading(false);
      }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, []);

  // Impression Ticker
  useEffect(() => {
    if (dynamicEvents.length === 0) return;
    const intervalId = setInterval(() => {
      setDynamicEvents((prev) => 
        [...prev].map(ev => ({ ...ev, impressions: ev.impressions + Math.floor(Math.random() * 10) + 1 }))
        .sort((a, b) => b.impressions - a.impressions)
      );
    }, 15000);
    return () => clearInterval(intervalId);
  }, [dynamicEvents.length]);

  const ALL_EVENTS = useMemo(() => dynamicEvents, [dynamicEvents]);
  const featuredEventIds = useMemo(() => {
  return ALL_EVENTS
    .filter(event => event.isFeatured === true)
    .map(event => String(event.id));
}, [ALL_EVENTS]);
const carouselEvents = useMemo(() => {
  if (ALL_EVENTS.length === 0) return [];

  const nonCultural = ALL_EVENTS.filter(ev => !isCultural(ev));

  const featured = nonCultural.filter(ev => ev.isFeatured === true);

  if (featured.length >= 3) {
    return featured.slice(0, 5);
  }

  const fallback = nonCultural
    .filter(ev => !featuredEventIds.includes(String(ev.id)))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5 - featured.length);

  return [...featured, ...fallback];
}, [ALL_EVENTS, featuredEventIds]);

  const eventDetailData = useMemo(() => {
    if (!eventIdParam) return null;
    const idNum = isNaN(eventIdParam) ? eventIdParam : parseInt(eventIdParam, 10);
    return ALL_EVENTS.find((e) => String(e.id) === String(eventIdParam)) ?? null;
  }, [eventIdParam, ALL_EVENTS]);

  const editingEvent = useMemo(() => {
    if (!editIdParam || ALL_EVENTS.length === 0) return null;
    return ALL_EVENTS.find(ev => String(ev.id) === String(editIdParam));
  }, [editIdParam, ALL_EVENTS]);

  const relatedEvents = useMemo(() => {
    if (!eventDetailData) return [];
    return ALL_EVENTS.filter((e) => e.category === eventDetailData.category && e.id !== eventDetailData.id).slice(0, 3);
  }, [eventDetailData, ALL_EVENTS]);

  const renderDetailsView = Boolean(eventIdParam && eventDetailData);
  const renderHostView = viewParam === "host";
  const renderAllEventsView = viewParam === "all";

  const handleDetailsClick = (id) => {
    router.push(`${pathname}?event=${id}`, { scroll: true });
  };

  const handleBackClick = () => router.push(pathname, { scroll: true });

  const handleHostClick = (e) => {
    if (e) e.preventDefault();
    router.push(`${pathname}?view=host`, { scroll: true });
    setSidebarOpen(false);
  };

  const handleShareClick = (id) => {
    const shareLink = `${window.location.origin}${pathname}?event=${id}`;
    if (navigator.share) {
      navigator.share({ title: "Event", url: shareLink }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareLink);
      alert("Link copied!");
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userAvatar");
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleEventHosted = async (newHostedEvent) => {
    try {
      const isEdit = !!editIdParam;
      const url = isEdit ? `/api/events/${editIdParam}` : "/api/events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  ...newHostedEvent,
  date: newHostedEvent.eventStart,
}),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Operation failed");
      }

      const saved = await res.json();
      
      if (isEdit) {
        setDynamicEvents(prev => prev.map(ev => String(ev.id) === String(editIdParam) ? { ...saved, id: saved._id } : ev));
      } else {
        setDynamicEvents(prev => [{ ...saved, id: saved._id, impressions: 1200 }, ...prev]);
      }
      
      return true;
    } catch (err) {
      console.error("Hosting Error:", err);
      alert(`Failed: ${err.message}`);
      throw err; 
    }
  };

const upcomingEvents = useMemo(() => {
  let result = ALL_EVENTS.filter(event => {
    // 🚫 Hide Cultural everywhere by default
    if (selectedCategory !== "Cultural" && isCultural(event)) {
      return false;
    }
    return !featuredEventIds.includes(String(event.id));
  });

  if (selectedCategory !== "All Events") {
    result = result.filter(event => event.category === selectedCategory);
  }

  if (searchQuery.length > 2) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      event =>
        event.title.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q)
    );
  }

  return result;
}, [ALL_EVENTS, featuredEventIds, selectedCategory, searchQuery]);
  return (
    <div className="min-h-screen text-white font-sans antialiased relative bg-gradient-to-br from-[#000000] via-[#2d163a] to-[#000000]">
      <div onClick={() => setSidebarOpen(false)} className={`fixed inset-0 bg-black/50 z-[100] transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} lg:hidden`} />
      
      <aside className={`fixed top-0 left-0 z-[110] h-full w-64 bg-[#050509] border-r border-[#262626] transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <span className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-purple-400 bg-clip-text text-transparent">Confique</span>
          <button onClick={() => setSidebarOpen(false)}><X className="w-7 h-7" /></button>
        </div>
        <nav className="px-3 py-4 space-y-1">

          {MOBILE_NAV.map((item) => (
            <Link
  key={item.href}
  href={item.href}
  className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-800 transition"
>
  <item.icon className="w-5 h-5" />
  {item.label}
</Link>
          ))}
          <button
  onClick={handleHostClick}
  className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-800 transition"
>
  <CalendarPlus className="w-5 h-5" />
  Create Event
</button>
        </nav>
      </aside>

      <header className={`relative z-[90] bg-[#0d0d0d]/80 backdrop-blur-sm ${renderDetailsView || renderHostView || renderAllEventsView ? "hidden lg:block" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 w-full">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><div className="space-y-1"><span className="block w-6 h-[2px] bg-white"></span><span className="block w-6 h-[2px] bg-white"></span><span className="block w-6 h-[2px] bg-white"></span></div></button>
            <h1 className="text-2xl font-extrabold text-purple-400 hidden lg:block">Confique</h1>
            {isSearching ? (
              <div className="relative flex-grow max-w-lg" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full py-2 pl-10 bg-gray-800 rounded-lg text-white" autoFocus />
              </div>
            ) : (
              <nav className="hidden md:flex gap-2">
                {TOP_NAV.map(item => <Link key={item.href} href={item.href} className="px-3 py-2 text-sm text-gray-300 hover:text-white">{item.label}</Link>)}
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleHostClick} className="hidden lg:flex items-center bg-purple-600 px-4 py-2 rounded-full text-sm font-medium"><Plus className="w-4 h-4 mr-1" />Host</button>
            <button onClick={() => setIsSearching(!isSearching)}><Search className="w-5 h-5 text-gray-400" /></button>
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full bg-slate-800/40 hover:bg-slate-700/60 transition-colors border border-slate-700/50"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500">
                  <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-slate-200 pr-2 hidden sm:block">{user.name}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
                  <div className="p-6 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-slate-900/50 to-transparent">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 mb-3">
                      <img src={user.avatar} alt="Large User Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#111]" />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center line-clamp-1">{user.name}</h3>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/profile/details");
                      }} 
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 rounded-xl transition-colors group text-left"
                    >
                      <User className="w-5 h-5 text-slate-400 group-hover:text-purple-400" />
                      <span className="font-medium">Profile</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left group"
                    >
                      <LogOut className="w-5 h-5 text-red-500/70 group-hover:text-red-500" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full">
        {renderHostView ? (
          <HostEventPage 
            onEventHosted={handleEventHosted} 
            initialData={editingEvent} 
          />
        ) : renderDetailsView ? (
          <EventDetailsPage 
            event={eventDetailData} 
            onBackClick={handleBackClick} 
            relatedEvents={relatedEvents} 
            onDetailsClick={handleDetailsClick} 
          />
        ) : renderAllEventsView ? (
          <AllEventsPage 
  ALL_EVENTS={ALL_EVENTS.filter(ev => {
    if (searchParams?.category === "Cultural") return true;
    return !isCultural(ev);
  })}
  categories={categories}
  onDetailsClick={handleDetailsClick}
  onShareClick={handleShareClick}
/>
        ) : (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            {!loading && carouselEvents.length > 0 && (
                <FeaturedCarousel 
                  events={carouselEvents} 
                  onDetailsClick={handleDetailsClick} 
                  onShareClick={handleShareClick} 
                />
            )}
            <section className="py-10">
              <h2 className="text-4xl font-extrabold text-white text-center mb-10">Upcoming Events</h2>
              <div className="flex space-x-3 overflow-x-auto pb-4 md:justify-center">
                {categories.map(cat => <CategoryButton key={cat.name} name={cat.name} Icon={cat.icon} isActive={selectedCategory === cat.name} onClick={() => setSelectedCategory(cat.name)} />)}
              </div>
            </section>
            <HorizontalScrollSection events={upcomingEvents} title={selectedCategory} onDetailsClick={handleDetailsClick} onShareClick={handleShareClick} onViewAllClick={() => router.push("?view=all")} />
            <HorizontalScrollSection
  events={ALL_EVENTS.filter(
    e => e.category === "Tech" && !isCultural(e)
  )}
  title="Tech Events"
  onDetailsClick={handleDetailsClick}
  onShareClick={handleShareClick}
  onViewAllClick={() => router.push("?view=all&category=Tech")}
/>
            <HorizontalScrollSection
  events={ALL_EVENTS.filter(ev => !isCultural(ev)).slice(0, 5)}
  title="Popular Events"
  isPopular={true}
  onDetailsClick={handleDetailsClick}
  onShareClick={handleShareClick}
  onViewAllClick={() => router.push("?view=all")}
/>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-800">
        &copy; {new Date().getFullYear()} All rights reserved.
      </footer>
    </div>
  );
};

// --- SECURITY WRAPPER (THE DEFAULT EXPORT) ---
export default function EventsPageWrapper({ searchParams }) {
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const data = await fetchMeData();
            
            if (!data?.user) {
  const currentUrl =
    window.location.pathname + window.location.search;

  router.replace(
    `/auth/login?redirect=${encodeURIComponent(currentUrl)}`
  );
  return;
}

            // User is valid, allow rendering
            setIsAuthenticated(true);
            setAuthLoading(false);
        };
        checkAuth();
    }, [router]);

    // 🔥 FLICKER-FREE UI: This fixed overlay covers EVERYTHING (Headers, Sidebars, Gradients)
    if (authLoading || !isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0d0d0d] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium tracking-wide animate-pulse">
                       
                    </p>
                </div>
            </div>
        );
    }

    // ✅ Only render the actual content if user is authenticated
    return <EventsContent searchParams={searchParams} />;
}