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

import { ThemeToggle } from "../../components/ThemeToggle";

import {
  Search, User, Zap, Code, Shirt, Medal, Compass, BookOpen,
  Clock, MapPin, Calendar, X, Heart, Share2, ChevronRight,
  ChevronLeft, Eye, Home, Users, CalendarDays, Plus, Clipboard, Settings, LogOut,Rocket,Briefcase, ArrowLeft 
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
    date: "Wed, 29 Apr 2027",
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
    date: "Sun, 7 Nov 2026",
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
    date: "Sat, 6 Jun 2027",
    poster: "https://placehold.co/400x550/FF5722/ffffff?text=STAND+UP+COMEDY+SHOW",
    tags: ["Team (3)"],
    category: "Cultural",
  },
  {
    id: 4,
    title: "KIIT International Model United Nations",
    venue: "KIIT Campus",
    date: "Jan 29 2027",
    poster: "https://placehold.co/400x550/3F51B5/ffffff?text=KIIT+MUN+2025",
    tags: ["Team (4)", "Free"],
    category: "Competition",
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
    const now = new Date();
    const sortedData = data.map((ev) => ({
      ...ev,
      id: ev._id,
      tags: ev.tags || [],
      category: ev.category || "Others",
      impressions: ev.impressions ?? 0,
    })).sort((a, b) => {
      const dateA = a.eventStart || a.date ? new Date(a.eventStart || a.date) : new Date(0);
      const dateB = b.eventStart || b.date ? new Date(b.eventStart || b.date) : new Date(0);
      const isClosedA = dateA < now;
      const isClosedB = dateB < now;
      if (isClosedA !== isClosedB) {
        return isClosedA ? 1 : -1;
      }
      // If both are open, sort by soonest first (ascending).
      // If both are closed, sort by most recent first (descending).
      return isClosedA ? dateB - dateA : dateA - dateB;
    });
    return sortedData;
  } catch (err) {
    console.error("❌ API Fetch Error:", err);
    return [];
  }
};

// --- Reusable Components ---
const CategoryButton = ({ name, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 whitespace-nowrap ${
      isActive
        ? "bg-[#A855F7] text-white shadow-md shadow-purple-500/20"
        : "bg-white dark:bg-bg-3 border border-gray-200 dark:border-border-1 text-gray-700 dark:text-text-2 hover:bg-gray-50 dark:hover:bg-bg-4"
    }`}
  >
    {name}
  </button>
);

const EventCard = ({ event, onDetailsClick, onShareClick }) => {
  const now = new Date();
  const eventDateStr = event.eventStart || event.date;
  const eventDate = eventDateStr ? new Date(eventDateStr) : null;
  
  let status = "OPEN";
  let statusColor = "bg-green-500/90";
  
  if (eventDate) {
    if (eventDate < now) {
      status = "CLOSED";
      statusColor = "bg-gray-800/90 dark:bg-gray-700/90";
    } else {
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        status = "CLOSING";
        statusColor = "bg-blue-500/90";
      }
    }
  }

  const formatImpressions = (num) => {
    if (!num) return "2.5k";
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  return (
    <div
      onClick={() => onDetailsClick(event.id)}
      className="group flex flex-col flex-shrink-0 w-[85vw] sm:w-[320px] cursor-pointer"
    >
      <div className="w-full aspect-video overflow-hidden bg-gray-100 dark:bg-bg-3 border-b border-gray-200 dark:border-border-1 relative flex items-center justify-center rounded-[24px] sm:rounded-[32px] mb-4">
        <img
          src={event.poster || event.banner}
          alt={event.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x300/111827/ffffff?text=Image+Not+Found";
          }}
        />
        
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
          {eventDateStr ? new Date(eventDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : "TBD"}
        </div>
        
        <div className={`absolute top-4 right-4 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm uppercase ${statusColor}`}>
          {status}
        </div>
      </div>

      <div className="flex flex-col px-1">
        <span className="text-[#A855F7] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 truncate">
          {event.venue?.includes("|") ? event.venue.split("|").slice(-1).pop().trim() : (event.venue || "TBD")}
        </span>
        
        <h3 className="text-lg sm:text-xl font-bold text-text-1 mb-4 line-clamp-1 transition-colors">
          {event.title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs font-medium text-text-3">
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${event.venue?.includes("Online") ? "bg-blue-500" : "bg-green-500"}`}></span>
            {event.venue?.includes("Online") ? "Online" : "On-site"}
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); if(onShareClick) onShareClick(event.id || event._id); }}
              className="text-text-3 hover:text-purple-500 p-1 rounded-full hover:bg-bg-3 transition-colors"
              title="Share Event"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="text-xs font-medium text-text-3">
              {eventDate && eventDate < now ? "Past Event" : `${formatImpressions(event.impressions)} Participants`}
            </div>
          </div>
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
            <span className="px-3 py-1 rounded-full bg-purple-600 text-[11px] font-semibold text-text-1 shadow-lg shadow-purple-800/70">
              Popular Pick
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HorizontalScrollSection = ({ events, title, subtitle, isPopular, onDetailsClick, onShareClick, onViewAllClick }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? window.innerWidth * 0.8 : 400;
      scrollContainerRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  };

  if (!events || events.length === 0) return null;

  return (
    <section className="relative py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 px-2 sm:px-0">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-text-1 leading-tight mb-2">{title}</h2>
          {subtitle && <p className="text-text-3 text-sm sm:text-base font-medium">{subtitle}</p>}
        </div>
        <button
          onClick={onViewAllClick}
          className="inline-flex items-center text-sm sm:text-base font-bold text-[#A855F7] hover:text-purple-500 transition-colors group whitespace-nowrap"
        >
          View All <span className="ml-2 font-normal">&rarr;</span>
        </button>
      </div>
      <div className="relative">
        {events.length > 3 && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent text-text-1 hover:text-purple-400 transition-colors z-20"
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
            className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-transparent text-text-1 hover:text-purple-400 transition-colors z-20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>
    </section>
  );
};

const TechFrontierSection = ({ events, onViewAllClick, onDetailsClick, onHostClick }) => {
  if (!events || events.length === 0) return null;

  // We need at least 1 event for the featured spot on the left.
  const featuredEvent = events[0];
  // And up to 2 events for the right column stack.
  const secondaryEvents = events.slice(1, 3);

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="relative py-8 sm:py-12 w-full max-w-7xl mx-auto">
      <div className="bg-[#0f172a] rounded-[32px] p-6 sm:p-10 text-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 text-white">Tech Frontier</h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base">The latest in AI, Dev, and Web3.</p>
          </div>
          <button
            onClick={onViewAllClick}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
          >
            Explore Tech Hub
          </button>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 sm:gap-8">
          
          {/* Left: Featured Event */}
          <div 
            onClick={() => onDetailsClick && onDetailsClick(featuredEvent.id)}
            className="relative group rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-slate-800 cursor-pointer"
          >
            <div className="w-full aspect-video md:h-full lg:absolute lg:inset-0 bg-gray-900 flex items-center justify-center">
              <img
                src={featuredEvent.poster || featuredEvent.banner}
                alt={featuredEvent.title}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent pointer-events-none" />
            
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
              <span className="bg-[#A855F7] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg w-fit mb-4">
                AI Spotlight
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight group-hover:text-purple-300 transition-colors">
                {featuredEvent.title}
              </h3>
              <div className="flex items-center space-x-6 text-sm text-slate-300 font-medium">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 opacity-80" />
                  {formatDate(featuredEvent.eventStart || featuredEvent.date)}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 opacity-80" />
                  {featuredEvent.venue?.includes("Online") ? "Global Online" : featuredEvent.venue}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Stacked Cards */}
          <div className="flex flex-col gap-6">
            {secondaryEvents.map((ev, index) => (
              <div 
                key={ev.id} 
                onClick={() => onDetailsClick && onDetailsClick(ev.id)}
                className="bg-slate-800/50 hover:bg-slate-800 rounded-3xl p-6 sm:p-8 transition-colors cursor-pointer group"
              >
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block">
                  {index === 0 ? "Upcoming" : "Workshop"}
                </span>
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 transition-colors">
                  {ev.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                  {ev.description || "Join industry leaders to explore cutting edge technologies and hands-on technical deep dives."}
                </p>
              </div>
            ))}

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-[#A855F7] to-[#7C3AED] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center mt-auto h-full min-h-[200px] shadow-lg shadow-purple-900/50">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Want to showcase?</h4>
              <p className="text-purple-200 text-sm font-medium mb-6">List your tech event today.</p>
              <button 
                onClick={onHostClick}
                className="bg-white text-purple-700 hover:bg-gray-50 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Apply Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const EliteCollectiveSection = ({ onJoinCommunityClick }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Subscribed successfully!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Failed to connect to server.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatus(null);
      }, 5000);
    }
  };

  return (
    <section className="relative py-12 sm:py-16 w-full max-w-7xl mx-auto px-4 sm:px-0">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-[32px] p-8 sm:p-16 text-center text-white shadow-2xl overflow-hidden relative">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4">Join the Elite Collective</h2>
          <p className="text-purple-100 font-medium text-sm sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Get invitations to exclusive invite-only experiences and premium networking events.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 bg-white/10 p-2 rounded-2xl sm:rounded-full border border-white/20 backdrop-blur-md max-w-xl mx-auto mb-4 shadow-inner">
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-white placeholder-purple-200 px-6 py-3 sm:py-0 outline-none font-medium"
              required
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-50 px-8 py-3 rounded-xl sm:rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <div className="h-6 mb-4">
            {status === "success" && <p className="text-green-300 font-semibold text-sm">{message}</p>}
            {status === "error" && <p className="text-red-300 font-semibold text-sm">{message}</p>}
          </div>

          <button 
            onClick={onJoinCommunityClick}
            className="text-white hover:text-purple-200 font-semibold text-sm transition-colors inline-flex items-center group"
          >
            Or join our Community platform
            <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>
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

  const CarouselDots = () =>
    events.length > 1 ? (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
            className={`transition-all duration-300 ${index === currentIndex ? "w-6 h-2 rounded-full bg-white" : "w-2 h-2 rounded-full bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className="relative w-full max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-4 mb-10 cursor-pointer" onClick={() => onDetailsClick(event.id)}>
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-16">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">Featured Experience</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-[5.5rem] font-black text-text-1 leading-[1.05] mb-8 sm:mb-12 tracking-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 w-full mb-10">
            <div className="flex flex-col items-center lg:items-start">
              <span className="text-[10px] sm:text-xs font-bold text-text-3 uppercase tracking-wider mb-1.5 sm:mb-2">Curated By</span>
              <div className="flex items-center text-sm sm:text-base font-bold text-text-1">
                {event.hostedBy || "Confique Global"}
                <div className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-border-1 hidden sm:block" />

            <div className="flex flex-col items-center lg:items-start">
              <span className="text-[10px] sm:text-xs font-bold text-text-3 uppercase tracking-wider mb-1.5 sm:mb-2">Registration Ends</span>
              <div className="text-sm sm:text-base font-bold text-text-1">
                {String(event.date).split(",")[0]?.trim() || "TBD"}
              </div>
            </div>

            <div className="w-px h-10 bg-border-1 hidden sm:block" />

            <div className="flex flex-col items-center lg:items-start">
              <span className="text-[10px] sm:text-xs font-bold text-text-3 uppercase tracking-wider mb-1.5 sm:mb-2">Status</span>
              <div className="px-3 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] sm:text-xs font-bold uppercase">
                Live Now
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center justify-center bg-[#A855F7] hover:bg-[#A855F7] text-white font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-xl shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 transition-all duration-200">
              Register Now <span className="ml-2 font-normal">&rarr;</span>
            </button>
            <button onClick={localHandleShare} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-text-2 hover:text-text-1 transition-colors">
              <Share2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>

        {/* Right Content (Image) */}
        <div className="w-full lg:w-1/2 relative z-10 flex justify-center">
          <div className="relative w-full aspect-video overflow-hidden bg-gray-800 flex items-center justify-center rounded-[2rem] shadow-2xl group">
            <img 
              src={event.poster || event.banner}
              alt={event.title}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            {events.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevEvent(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={(e) => { e.stopPropagation(); nextEvent(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><ChevronRight className="w-6 h-6" /></button>
              </>
            )}
            <CarouselDots />
          </div>
        </div>
      </div>
    </div>
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
      
      const finalEvents = Array.from(map.values())
        .map(ev => ({
          ...ev,
          createdAt: ev.createdAt || new Date(),
          impressions:
            typeof ev.impressions === "number"
              ? ev.impressions
              : Math.floor(Math.random() * 2000) + 800
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
  // Controlled Impression Ticker (MAX 5000)
useEffect(() => {
  if (dynamicEvents.length === 0) return;

  const intervalId = setInterval(() => {
    setDynamicEvents(prev =>
      [...prev].map(ev => {

        const created = new Date(ev.createdAt || Date.now());
        const ageMinutes = (Date.now() - created.getTime()) / (1000 * 60);
        const ageHours = ageMinutes / 60;

        let increase = 0;

        // First 5 minutes
        if (ageMinutes <= 5) {
          increase = Math.floor(Math.random() * 2) + 1;
        }

        // First 6 hours
        else if (ageHours <= 6) {
          increase = Math.floor(Math.random() * 3) + 2;
        }

        // Normal growth
        else {
          increase = Math.floor(Math.random() * 6) + 2;
        }

        return {
          ...ev,
          impressions: Math.min(ev.impressions + increase, 5000) // 🚀 cap at 5000
        };

      }).sort((a, b) => b.impressions - a.impressions)
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

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingOnly = ALL_EVENTS.filter((ev) => {
    // Exclude mock events
    if (typeof ev.id === 'number') return false;
    
    // For now, only show these specific 3 events in the carousel
    const title = (ev.title || "").toLowerCase();
    return title.includes("genovate") || title.includes("shark tank") || title.includes("codex");
  });

  const nonCultural = upcomingOnly.filter(ev => !isCultural(ev));

  const featured = nonCultural.filter(ev => ev.isFeatured === true);

  if (featured.length >= 3) {
    return featured.slice(0, 5);
  }

  const fallback = nonCultural
    .filter(ev => !featuredEventIds.includes(String(ev.id)))
    .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
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
      window.location.href = "/auth/login";
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
      setDynamicEvents(prev => [
  { ...saved, id: saved._id, impressions: 12, createdAt: new Date() },
  ...prev
]);
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
    <div className="min-h-screen text-text-1 font-sans antialiased relative bg-bg-1 dark:bg-gradient-to-br dark:from-[#000000] dark:via-[#2d163a] dark:to-[#000000]">
      <div onClick={() => setSidebarOpen(false)} className={`fixed inset-0 bg-black/50 z-[100] transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} lg:hidden`} />
      
      <aside className={`fixed top-0 left-0 z-[110] h-full w-64 bg-[#050509] border-r border-gray-200 transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <span className="text-lg font-extrabold text-[#A855F7]">Confique</span>
          <button onClick={() => setSidebarOpen(false)}><X className="w-7 h-7" /></button>
        </div>
        <nav className="px-3 py-4 space-y-1">

          {MOBILE_NAV.map((item) => (
            <Link
  key={item.href}
  href={item.href}
  className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-50 transition"
>
  <item.icon className="w-5 h-5" />
  {item.label}
</Link>
          ))}
          <button
  onClick={handleHostClick}
  className="flex items-center gap-4 w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-50 transition"
>
  <CalendarPlus className="w-5 h-5" />
  Create Event
</button>
        </nav>
      </aside>

      <header className={`relative z-[90] bg-bg-1/80 backdrop-blur-sm border-b border-border-1 ${renderDetailsView || renderHostView || renderAllEventsView ? "hidden lg:block" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 w-full">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><div className="space-y-1"><span className="block w-6 h-[2px] bg-text-1"></span><span className="block w-6 h-[2px] bg-text-1"></span><span className="block w-6 h-[2px] bg-text-1"></span></div></button>
            <h1 className="text-2xl font-extrabold text-[#A855F7] hidden lg:block">Confique</h1>
            {isSearching ? (
              <div className="relative flex-grow max-w-lg" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-3" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full py-2 pl-10 bg-bg-3 border border-border-1 rounded-lg text-text-1" autoFocus />
              </div>
            ) : (
              <nav className="hidden md:flex gap-2">
                {TOP_NAV.map(item => <a key={item.href} href={item.href} onClick={(e) => { e.preventDefault(); window.location.href = item.href; }} className="px-3 py-2 text-sm text-text-2 hover:text-text-1 cursor-pointer">{item.label}</a>)}
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleHostClick} className="hidden lg:flex items-center bg-[#A855F7] hover:bg-[#A855F7] text-white transition-colors px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-purple-500/20"><Plus className="w-4 h-4 mr-1" />Host</button>
            <ThemeToggle />
            <button onClick={() => setIsSearching(!isSearching)}><Search className="w-5 h-5 text-text-3" /></button>
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full bg-bg-3 hover:bg-bg-4 transition-colors border border-border-1"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500">
                  <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-text-1 pr-2 hidden sm:block">{user.name}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]">
                  <div className="p-6 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-slate-900/50 to-transparent">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 mb-3">
                      <img src={user.avatar} alt="Large User Avatar" className="w-full h-full rounded-full object-cover border-2 border-[#111]" />
                    </div>
                    <h3 className="text-lg font-bold text-text-1 text-center line-clamp-1">{user.name}</h3>
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
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">
             <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl sm:text-4xl font-bold">{searchParams?.category || "All Events"}</h1>
               <button onClick={() => router.push("/events")} className="text-purple-500 hover:text-purple-400 font-semibold transition-colors flex items-center">
                 <ArrowLeft className="w-5 h-5 mr-2" /> Back
               </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ALL_EVENTS.filter(e => searchParams?.category ? e.category === searchParams.category : true).map(event => (
                   <EventCard key={event.id} event={event} onDetailsClick={handleDetailsClick} onShareClick={handleShareClick} />
                ))}
             </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            {!loading && carouselEvents.length > 0 && (
                <FeaturedCarousel 
                  events={carouselEvents} 
                  onDetailsClick={handleDetailsClick} 
                  onShareClick={handleShareClick} 
                />
            )}
            <section className="pt-16 pb-12">
              <div className="text-center mb-10">
                <h2 className="text-[32px] sm:text-4xl font-bold text-text-1 mb-3">Explore Categories</h2>
                <p className="text-text-3 font-medium text-base sm:text-lg">Discover events that match your creative passion.</p>
              </div>
              <div className="flex space-x-3 overflow-x-auto pb-4 md:justify-center scrollbar-hide px-4">
                {categories.map(cat => <CategoryButton key={cat.name} name={cat.name} isActive={selectedCategory === cat.name} onClick={() => setSelectedCategory(cat.name)} />)}
              </div>
            </section>
            <HorizontalScrollSection events={upcomingEvents} title={selectedCategory === "All Events" ? "Upcoming Highlights" : selectedCategory} subtitle="Hand-picked events for your growth." onDetailsClick={handleDetailsClick} onShareClick={handleShareClick} onViewAllClick={() => router.push("?view=all")} />
            <TechFrontierSection 
              events={ALL_EVENTS
                .filter(e => e.category === "Tech" && !isCultural(e))
                .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
              }
              onDetailsClick={handleDetailsClick}
              onHostClick={handleHostClick}
              onViewAllClick={() => router.push("?view=all&category=Tech")}
            />
            <EliteCollectiveSection onJoinCommunityClick={() => router.push("/groups")} />
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-text-4 text-sm border-t border-gray-200">
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
            <div className="fixed inset-0 z-[9999] bg-gray-100 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-3 font-medium tracking-wide animate-pulse">
                       
                    </p>
                </div>
            </div>
        );
    }

    // ✅ Only render the actual content if user is authenticated
    return (
        <div className="w-full">
            <EventsContent searchParams={searchParams} />
        </div>
    );
}