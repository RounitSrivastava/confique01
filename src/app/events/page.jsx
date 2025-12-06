// EventsPage.jsx
"use client";
import React, {
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

// --- Import the dedicated view components ---
import EventDetailsPage from "./EventDetailsPage";
import HostEventPage from "./HostEventPage";
import AllEventsPage from "./AllEventsPage";
// ------------------------------------------

// --- ICON IMPORTS ---
import {
    Search,
    User,
    Zap,
    Code,
    Shirt,
    Medal,
    Compass,
    BookOpen,
    Clock,
    MapPin,
    Calendar,
    X,
    Heart,
    Share2,
    CheckCircle,
    MessageSquare,
    Clipboard,
    ChevronRight,
    ChevronLeft,
    Gift,
    ZapOff,
    ArrowLeft,
    ClipboardList,
    Plus,
    Eye,
    Home,
    Users,
    CalendarDays,
    BarChart3,
    Newspaper,
} from "lucide-react";

// --- MOCK DATA ---
const MOCK_EVENTS = [
    {
        id: 1,
        title: "L'Oréal Brandstorm",
        venue: "Online | Rose Garden, Campus-18",
        date: "Wed, 29 Apr 2025",
        poster:
            "https://placehold.co/400x550/4A148C/ffffff?text=L'OREAL+BRANDSTORM",
        tags: ["Team (4)", "Free"],
        isFeatured: true,
        category: "Competition",
        rounds: [
            {
                title: "Registration Opens",
                description: "Sign up and form your teams.",
                date: "15 Mar",
            },
            {
                title: "Concept Submission Deadline",
                description: "Submit your brand strategy pitch.",
                date: "30 Mar",
            },
            {
                title: "National Finals",
                description: "Top teams compete for the global spot.",
                date: "29 Apr",
            },
        ],
    },
    {
        id: 2,
        title: "Raiders Reckoning",
        venue: "KIIT Auditorium",
        date: "Sun, 7 Nov 2025",
        poster:
            "https://placehold.co/400x550/212121/ffffff?text=RAIDERS+RECKONING",
        tags: ["Solo", "Free"],
        category: "Competition",
        rounds: [
            {
                title: "Qualifier Round 1",
                description: "Online quiz challenge.",
                date: "20 Oct",
            },
            {
                title: "Main Event Registration",
                description: "Final check-in for competitors.",
                date: "01 Nov",
            },
            {
                title: "Final Battle Stage",
                description: "Live competitive gaming event.",
                date: "07 Nov",
            },
        ],
    },
    {
        id: 3,
        title: "RaagRang – Inter-College Cultural Fest",
        venue: "Multiple Venues",
        date: "Sat, 6 Jun 2026",
        poster:
            "https://placehold.co/400x550/FF5722/ffffff?text=STAND+UP+COMEDY+SHOW",
        tags: ["Team (3)"],
        category: "Cultural",
    },
    {
        id: 4,
        title: "KIIT International Model United Nations",
        venue: "KIIT Campus",
        date: "Jan 29 2026",
        poster:
            "https://placehold.co/400x550/3F51B5/ffffff?text=KIIT+MUN+2025",
        tags: ["Team (4)", "Free"],
        category: "Competition",
    },
    {
        id: 5,
        title: "Hackify Battle on TryHackMe",
        venue: "Online",
        date: "Thu, 1 Dec 2025",
        poster:
            "https://placehold.co/400x550/0D47A1/ffffff?text=CYBER+SECURITY+CONFERENCE",
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
        poster:
            "https://placehold.co/400x550/795548/ffffff?text=PHOTO+EXHIBIT",
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
        poster:
            "https://placehold.co/400x550/D81B60/ffffff?text=WRITING+RETREAT",
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
        poster:
            "https://placehold.co/400x550/E53935/ffffff?text=SPORTS+MEET",
        tags: ["Team (5)", "Free"],
        category: "Competition",
    },
    {
        id: 15,
        title: "Art of Public Speaking",
        venue: "Auditorium",
        date: "Wed, 25 May 2026",
        poster:
            "https://placehold.co/400x550/9C27B0/ffffff?text=PUBLIC+SPEAKING",
        tags: ["Solo", "Paid"],
        category: "Workshop",
    },
];

export const categories = [
    { name: "All Events", icon: Zap },
    { name: "Tech", icon: Code },
    { name: "Fashion", icon: Shirt },
    { name: "Competition", icon: Medal },
    { name: "Cultural", icon: Compass },
    { name: "Seminar", icon: BookOpen },
    { name: "Workshop", icon: Clock },
    { name: "Others", icon: null },
];

export const EVENT_DETAIL_DATA = {
    id: 99,
    title: "Bottline Bulletin - The Ultimate Media Challenge",
    tagline: "Where News Gets Twisted and AI Gets Awesome!",
    poster:
        "https://placehold.co/1200x300/1D1D2C/ffffff?text=BOTTLINE+BULLETIN+BANNER",
    category: "Competition",
    hostedBy: "IBS Hyderabad",
    eligibility: "Everyone can apply",
    isOnline: true,
    isFree: true,
    registration: {
        start: "02 Dec 25, 10:13 PM IST",
        end: "16 Dec 25, 10:13 PM IST",
        status: "Open",
    },
    rounds: [
        {
            title: "Round 1: Decode the Newsfeed",
            description: "A rapid-fire knowledge challenge...",
            rules: [
                "Each team answers a set of fast-paced news & AI-related questions.",
                "Time limit: 10 seconds per question.",
            ],
            date: "02 Dec 25",
        },
    ],
};

const FEATURED_CAROUSEL_EVENTS = [
    MOCK_EVENTS[0],
    {
        ...MOCK_EVENTS[1],
        id: 101,
        title: "Featured: Raiders Reckoning",
        isFeatured: true,
        date: "Thu, 15 Dec 2025",
    },
    {
        ...MOCK_EVENTS[4],
        id: 102,
        title: "Featured: Hackify Battle",
        isFeatured: true,
        date: "Thu, 15 Dec 2025",
    },
    {
        id: 999,
        title: "Global Tech Summit 2026",
        venue: "Virtual Event",
        date: "May 10-12 2026",
        poster:
            "https://placehold.co/400x550/004D40/ffffff?text=GLOBAL+TECH+SUMMIT",
        tags: ["Team (1)", "Paid"],
        isFeatured: true,
        category: "Seminar",
    },
];

const TOP_NAV = [
    { label: "Home", href: "/" },
    { label: "Groups", href: "/groups" },
    { label: "Insights", href: "/insights" },
];

const MOBILE_NAV = [
    { label: "Home", href: "/", icon: Home },
    { label: "Groups", href: "/groups", icon: Users },
    { label: "Events", href: "/events", icon: CalendarDays },
    { label: "Insights", href: "/insights", icon: BarChart3 },
    { label: "News", href: "/news", icon: Newspaper },
];

// --- Reusable Components ---

const CategoryButton = ({ name, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${
            isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white"
        }`}
    >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{name}</span>
    </button>
);

const SectionTitle = ({ children, icon: Icon }) => (
    <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center">
        {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
        {children}
    </h2>
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

    const tagsToDisplay = event.tags.filter(
        (tag) => !tag.includes("Team") && !tag.includes("Solo")
    );

    return (
        <div
            onClick={() => onDetailsClick(event.id)}
            className="group flex flex-shrink-0 flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-purple-500/30 w-full max-w-sm sm:w-[300px] cursor-pointer"
        >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
                <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover object-center transition-opacity duration-300 group-hover:opacity-90"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                            "https://placehold.co/400x300/111827/ffffff?text=Image+Not+Found";
                    }}
                />

                <div className="absolute top-3 right-3 flex space-x-2">
                    {tagsToDisplay.map((tag, index) => (
                        <span
                            key={index}
                            className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                                tag.includes("Free")
                                    ? "bg-green-500/90 text-white"
                                    : "bg-gray-700/90 text-white"
                            }`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="absolute bottom-3 left-3 bg-white text-gray-900 px-3 py-1 rounded-lg font-bold text-center shadow-lg">
                    <p className="text-sm leading-tight">
                        {event.date.split(",")[0].trim()}
                    </p>
                </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
                <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
                    <span className="flex items-center space-x-2">
                        <span className="text-gray-400">
                            {event.venue.includes("Online")
                                ? "Online"
                                : "On-site"}
                        </span>
                        <span className="font-semibold text-green-400">
                            {event.tags.includes("Free") ? "Free" : "Paid"}
                        </span>
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

                <div className="flex items-center justify-end text-xs font-medium text-gray-400 mb-2">
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
                            isLiked
                                ? "text-red-500 fill-red-500"
                                : "text-gray-500 hover:text-red-500 hover:fill-gray-900"
                        }`}
                        onClick={handleLikeClick}
                    />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-3 h-20">
                    {event.title}
                </h3>

                <p className="text-sm text-gray-400 flex items-center mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                    {event.venue.includes("|")
                        ? event.venue.split("|").slice(-1).pop().trim()
                        : event.venue}
                </p>

                <button className="mt-auto w-fit text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors text-left">
                    View Details &rarr;
                </button>
            </div>
        </div>
    );
};

const HorizontalScrollSection = ({
    events,
    onDetailsClick,
    onShareClick,
    title,
    onViewAllClick,
}) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const showScrollButtons = events.length > 3;

    const checkScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                scrollContainerRef.current;
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
            const cardWidth = 300;
            const gap = 24;
            const scrollDistance = cardWidth * 2 + gap;
            const scrollAmount =
                direction === "left" ? -scrollDistance : scrollDistance;

            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        }
    };

    if (events.length === 0) return null;

    return (
        <section className="py-10 relative">
            <div className="flex flex-col items-center mb-10">
                <h2 className="text-4xl font-extrabold text-white text-center mb-6">
                    {title}
                </h2>
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
                {showScrollButtons && canScrollLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-800/80 text-white z-10 hover:bg-purple-600/90 transition-all shadow-xl hidden lg:block"
                        aria-label="Scroll events left"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 snap-x snap-mandatory pr-6"
                >
                    {events.map((event) => (
                        <div key={event.id} className="snap-start">
                            <EventCard
                                event={event}
                                onDetailsClick={onDetailsClick}
                                onShareClick={onShareClick}
                            />
                        </div>
                    ))}
                </div>

                {showScrollButtons && canScrollRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-800/80 text-white z-10 hover:bg-purple-600/90 transition-all shadow-xl hidden lg:block"
                        aria-label="Scroll events right"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </section>
    );
};

const FeaturedCarousel = ({
    events,
    onDetailsClick,
    onShareClick,
    interval = 5000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextEvent = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, [events.length]);

    const prevEvent = () => {
        setCurrentIndex(
            (prevIndex) => (prevIndex - 1 + events.length) % events.length
        );
    };

    useEffect(() => {
        if (events.length <= 1) return;

        const timer = setInterval(nextEvent, interval);
        return () => clearInterval(timer);
    }, [events.length, interval, nextEvent]);

    const event = events[currentIndex];

    const localHandleShare = (e) => {
        e.stopPropagation();
        onShareClick(event.id);
    };

    return (
        <div
            className="relative w-full max-w-5xl mx-auto py-10 px-6 sm:px-12 rounded-[2rem] shadow-2xl mt-12 mb-16 overflow-hidden transform transition-all duration-500 hover:scale-[1.01] cursor-pointer"
            key={event.id}
            onClick={() => onDetailsClick(event.id)}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xl z-0 rounded-[2rem]" />
            <div
                className="absolute inset-0 z-0 opacity-80 transition-opacity duration-1000"
                style={{
                    background:
                        "radial-gradient(circle at 75% 10%, #6D28D9, transparent 50%), radial-gradient(circle at 15% 90%, #9333EA, transparent 50%)",
                }}
            />

            {events.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevEvent();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white z-20 hover:bg-white/40 transition-colors"
                        aria-label="Previous event"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextEvent();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white z-20 hover:bg-white/40 transition-colors"
                        aria-label="Next event"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between transition-opacity duration-500 opacity-100">
                <div className="md:w-1/2 p-4 md:pr-8 text-center md:text-left">
                    <span className="inline-block px-4 py-1 text-xs font-semibold text-white bg-purple-600 rounded-full mb-4 shadow-xl">
                        Featured Event{" "}
                        {events.length > 1
                            ? `(${currentIndex + 1}/${events.length})`
                            : ""}
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter">
                        {event.title}
                    </h1>
                    <p className="text-xl text-gray-200 font-medium mb-6 flex items-center justify-center md:justify-start">
                        <Calendar className="w-5 h-5 mr-3 text-yellow-300" />
                        {event.date}
                    </p>

                    {event.impressions !== undefined && (
                        <p className="text-md text-gray-300 font-medium mb-6 flex items-center justify-center md:justify-start">
                            <Eye className="w-5 h-5 mr-3 text-purple-300" />
                            {event.impressions.toLocaleString()} Impressions
                        </p>
                    )}

                    <div className="flex items-center justify-center md:justify-start space-x-4">
                        <button className="inline-flex items-center bg-white text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-200 transition-colors group">
                            Click to view event details
                            <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                                &rarr;
                            </span>
                        </button>
                        <button
                            onClick={localHandleShare}
                            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            title="Share this event"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="md:w-1/2 p-4 mt-8 md:mt-0 flex justify-center">
                    <div className="w-full max-w-xs aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
                        <img
                            src={event.poster}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                    "https://placehold.co/400x550/111827/ffffff?text=Image+Not+Found";
                            }}
                        />
                    </div>
                </div>
            </div>

            {events.length > 1 && (
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                index === currentIndex
                                    ? "bg-white scale-110"
                                    : "bg-gray-400/50 hover:bg-white/70"
                            }`}
                            aria-label={`Go to event ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- UTILITY FUNCTIONS FOR PERSISTENCE ---

const STORAGE_KEY = "event_impressions";

const saveImpressionsToLocalStorage = (events) => {
    if (typeof window !== "undefined") {
        const dataToStore = events.map((e) => ({
            id: e.id,
            impressions: e.impressions,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    }
};

const getInitialImpressions = (mockEvents, featuredEvents) => {
    const ALL_MOCK_DATA = [
        ...mockEvents,
        ...featuredEvents.filter((e) => !mockEvents.some((m) => m.id === e.id)),
    ];
    const MAX_MOCK_ID = mockEvents.reduce(
        (max, event) => Math.max(max, event.id),
        0
    );

    const defaultEvents = ALL_MOCK_DATA.map((event) => {
        let baseImpressions =
            Math.floor(Math.random() * (2500 - 500 + 1)) + 500;

        const isRecentlyAdded = event.id > MAX_MOCK_ID - 5;
        if (isRecentlyAdded) {
            baseImpressions +=
                Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
        }
        if (event.isFeatured) {
            baseImpressions += Math.floor(Math.random() * 500) + 1000;
        }

        return {
            ...event,
            impressions: baseImpressions,
        };
    });

    if (typeof window === "undefined") {
        return defaultEvents.sort((a, b) => b.impressions - a.impressions);
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
        saveImpressionsToLocalStorage(defaultEvents);
        return defaultEvents.sort((a, b) => b.impressions - a.impressions);
    }

    try {
        const savedImpressionsMap = JSON.parse(savedData).reduce(
            (map, item) => {
                map[item.id] = item.impressions;
                return map;
            },
            {}
        );

        const mergedEvents = defaultEvents.map((event) => {
            const savedImpressions = savedImpressionsMap[event.id] || 0;
            const finalImpressions = Math.max(
                event.impressions,
                savedImpressions
            );

            return {
                ...event,
                impressions: finalImpressions,
            };
        });

        return mergedEvents.sort((a, b) => b.impressions - a.impressions);
    } catch (e) {
        console.error("Error parsing impressions from localStorage:", e);
        saveImpressionsToLocalStorage(defaultEvents);
        return defaultEvents.sort((a, b) => b.impressions - a.impressions);
    }
};

// --- MAIN COMPONENT FOR THE PAGE ---
const EventsPage = () => {
    const [selectedCategory, setSelectedCategory] =
        useState("All Events");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [dynamicEvents, setDynamicEvents] = useState(() =>
        getInitialImpressions(MOCK_EVENTS, FEATURED_CAROUSEL_EVENTS)
    );

    const searchRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const eventIdParam = searchParams.get("id");
    const viewParam = searchParams.get("view");

    useEffect(() => {
        if (dynamicEvents.length === 0) return;

        const intervalId = setInterval(() => {
            setDynamicEvents((prevEvents) => {
                const nextEvents = prevEvents
                    .map((event) => {
                        const randomIncrease =
                            Math.floor(Math.random() * 46) + 5;
                        return {
                            ...event,
                            impressions:
                                event.impressions + randomIncrease,
                        };
                    })
                    .sort((a, b) => b.impressions - a.impressions);

                saveImpressionsToLocalStorage(nextEvents);
                return nextEvents;
            });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [dynamicEvents.length]);

    const ALL_EVENTS = useMemo(
        () => dynamicEvents,
        [dynamicEvents]
    );

    const eventDetailData = useMemo(() => {
        const data = eventIdParam
            ? ALL_EVENTS.find(
                  (e) => e.id === parseInt(eventIdParam)
              ) || EVENT_DETAIL_DATA
            : null;
        return data;
    }, [eventIdParam, ALL_EVENTS]);

    const relatedEvents = useMemo(() => {
        if (!eventDetailData) return [];
        const currentEventId = eventDetailData.id;
        const currentCategory = eventDetailData.category;

        return ALL_EVENTS.filter(
            (e) =>
                e.category === currentCategory &&
                e.id !== currentEventId
        ).slice(0, 3);
    }, [eventDetailData, ALL_EVENTS]);

    const renderDetailsView = eventDetailData !== null;
    const renderHostView = viewParam === "host";
    const renderAllEventsView = viewParam === "all";

    const handleDetailsClick = (id) => {
        setDynamicEvents((prevEvents) => {
            const nextEvents = prevEvents
                .map((event) => {
                    if (event.id === id) {
                        const userSurge =
                            Math.floor(Math.random() * 200) + 300;
                        return {
                            ...event,
                            impressions:
                                event.impressions + userSurge,
                        };
                    }
                    return event;
                })
                .sort((a, b) => b.impressions - a.impressions);

            saveImpressionsToLocalStorage(nextEvents);
            return nextEvents;
        });

        router.push(`${pathname}?id=${id}`, { scroll: true });
    };

    const handleBackClick = () => {
        router.push(pathname, { scroll: true });
    };

    const handleHostClick = (e) => {
        e.preventDefault();
        router.push(`${pathname}?view=host`, { scroll: true });
        if (isMobile()) setSidebarOpen(false);
    };

    const handleShareClick = (id) => {
        const shareLink = `${window.location.origin}${pathname}?id=${id}`;

        if (navigator.share) {
            navigator
                .share({
                    title: "Check out this event!",
                    url: shareLink,
                })
                .catch((error) => {
                    if (error.name !== "AbortError") {
                        console.error("Sharing failed", error);
                    }
                });
        } else if (navigator.clipboard) {
            navigator.clipboard
                .writeText(shareLink)
                .then(() => {
                    console.log(
                        "Link copied to clipboard (Fallback)"
                    );
                })
                .catch((err) => {
                    console.error("Could not copy text: ", err);
                });
        } else {
            alert(
                `Share functionality not supported. Link: ${shareLink}`
            );
        }
    };

    const handleSearchToggle = () => {
        setIsSearching((prev) => !prev);
        if (!isSearching) setSearchQuery("");
    };

    const handleViewAllPopular = () => {
        router.push(`${pathname}?view=all&category=All Events`, {
            scroll: true,
        });
        setSearchQuery("");
    };

    const handleViewAllTech = () => {
        router.push(`${pathname}?view=all&category=Tech`, {
            scroll: true,
        });
        setSearchQuery("");
    };

    const handleCategoryClickInListView = (categoryName) => {
        setSelectedCategory(categoryName);
        router.push(pathname, { scroll: false });
        setSearchQuery("");
    };

    const upcomingEvents = useMemo(() => {
        const carouselIds = FEATURED_CAROUSEL_EVENTS.map(
            (e) => e.id
        );
        let filtered = ALL_EVENTS.filter(
            (e) => !carouselIds.includes(e.id)
        );

        if (selectedCategory !== "All Events") {
            filtered = filtered.filter(
                (e) => e.category === selectedCategory
            );
        }

        if (searchQuery.length > 2) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (e) =>
                    e.title.toLowerCase().includes(lowerQuery) ||
                    e.venue.toLowerCase().includes(lowerQuery) ||
                    e.category.toLowerCase().includes(lowerQuery) ||
                    e.tags.some((tag) =>
                        tag.toLowerCase().includes(lowerQuery)
                    )
            );
        }

        return filtered;
    }, [selectedCategory, searchQuery, ALL_EVENTS]);

    const techEvents = useMemo(() => {
        const carouselIds = FEATURED_CAROUSEL_EVENTS.map(
            (e) => e.id
        );
        const allMockEventsNoFeatured = ALL_EVENTS.filter(
            (e) => !carouselIds.includes(e.id)
        );
        return allMockEventsNoFeatured.filter(
            (e) => e.category === "Tech"
        );
    }, [ALL_EVENTS]);

    const popularEventsSlice = useMemo(() => {
        const carouselIds = FEATURED_CAROUSEL_EVENTS.map(
            (e) => e.id
        );
        const popular = ALL_EVENTS.filter(
            (e) => !carouselIds.includes(e.id)
        );
        return popular.slice(0, 3);
    }, [ALL_EVENTS]);

    const isMobile = () =>
        typeof window !== "undefined" && window.innerWidth < 1024;

    useEffect(() => {
        function handleClickOutside(event) {
            const isClickOnToggleButton = event.target.closest(
                'button[aria-label="Toggle search"]'
            );

            if (
                isSearching &&
                searchRef.current &&
                !searchRef.current.contains(event.target) &&
                !isClickOnToggleButton
            ) {
                setIsSearching(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [isSearching]);

    const activeViewKey = renderHostView
        ? "host"
        : renderDetailsView
        ? "details"
        : renderAllEventsView
        ? "all"
        : "list";

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans antialiased relative">
            {/* Dark overlay */}
            <div
                onClick={() => setSidebarOpen(false)}
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
                    sidebarOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                } lg:hidden`}
            />

            {/* Mobile sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#050509] border-r border-[#262626] transform transition-transform duration-300 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:hidden`}
            >
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                    <span className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Confique
                    </span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 text-white hover:text-purple-300"
                    >
                        <X className="w-7 h-7" strokeWidth={2.5} />
                    </button>
                </div>

                <nav className="px-3 py-4 space-y-1">
                    {MOBILE_NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                if (isMobile()) setSidebarOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                pathname === item.href
                                    ? "bg-[#111827] text-white"
                                    : "text-gray-300 hover:bg-[#111827] hover:text-white"
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-2 border-t border-gray-800 px-3 py-4 space-y-1 text-sm">
                    <Link
                        href="/create-post"
                        onClick={() =>
                            isMobile() && setSidebarOpen(false)
                        }
                        className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-[#111827] hover:text-white"
                    >
                        Create Post
                    </Link>

                    <button
                        onClick={(e) => {
                            handleHostClick(e);
                            if (isMobile()) setSidebarOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-[#111827] hover:text-white"
                    >
                        Create Event
                    </button>

                    <Link
                        href="/saved"
                        onClick={() =>
                            isMobile() && setSidebarOpen(false)
                        }
                        className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-[#111827] hover:text-white"
                    >
                        Saved Items
                    </Link>
                </div>
            </aside>

            {/* Header */}
            <header
                className={`z-40 bg-gray-950/90 backdrop-blur-sm shadow-lg shadow-black/30 ${
                    renderDetailsView ||
                    renderHostView ||
                    renderAllEventsView
                        ? "hidden lg:block"
                        : ""
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4 w-full">
                        {/* Mobile: 3-line menu + logo */}
                        <div className="flex items-center space-x-3 lg:hidden">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open sidebar"
                                className={`${sidebarOpen ? "hidden" : "inline-flex"}`}
                            >
                                <span className="flex flex-col justify-center space-y-1">
                                    <span className="block w-6 h-[2px] bg-white rounded-full" />
                                    <span className="block w-6 h-[2px] bg-white rounded-full" />
                                    <span className="block w-6 h-[2px] bg-white rounded-full" />
                                </span>
                            </button>

                            <Image
                                src="/Group%2051(3).png"
                                alt="Confique logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>

                        {/* Desktop title */}
                        <h1 className="text-2xl font-extrabold tracking-tight text-purple-400 hidden lg:block">
                            Confique
                        </h1>

                        {isSearching ? (
                            <div
                                className="relative flex-grow max-w-lg md:max-w-xl"
                                ref={searchRef}
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search events, posts, people..."
                                    className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() =>
                                            setSearchQuery("")
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <nav className="hidden md:flex items-center gap-2">
                                {TOP_NAV.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                            pathname === item.href
                                                ? "bg-[#1a1a1a] text-white border border-[#333]"
                                                : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 ml-auto md:ml-0">
                        <button
                            onClick={handleHostClick}
                            className="hidden lg:inline-flex items-center bg-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/50"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Host
                        </button>

                        <button
                            onClick={handleSearchToggle}
                            aria-label="Toggle search"
                        >
                            <Search
                                className={`w-5 h-5 transition-colors ${
                                    isSearching
                                        ? "text-purple-400"
                                        : "text-gray-400 hover:text-purple-400"
                                }`}
                            />
                        </button>

                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-105">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main key={activeViewKey}>
                {renderHostView ? (
                    <HostEventPage parentPathname={pathname} />
                ) : renderDetailsView ? (
                    <EventDetailsPage
                        event={eventDetailData}
                        onBackClick={handleBackClick}
                        EVENT_DETAIL_DATA_MOCK={EVENT_DETAIL_DATA}
                        relatedEvents={relatedEvents}
                        onDetailsClick={handleDetailsClick}
                        IconSet={{
                            Clock,
                            ClipboardList,
                            ZapOff,
                            ArrowLeft,
                            Calendar,
                            User,
                            Gift,
                            CheckCircle,
                            Zap,
                        }}
                    />
                ) : renderAllEventsView ? (
                    <AllEventsPage
                        ALL_EVENTS={ALL_EVENTS}
                        categories={categories}
                        onDetailsClick={handleDetailsClick}
                        onShareClick={handleShareClick}
                        parentPathname={pathname}
                    />
                ) : (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                        <FeaturedCarousel
                            events={FEATURED_CAROUSEL_EVENTS.map(
                                (e) =>
                                    ALL_EVENTS.find(
                                        (a) => a.id === e.id
                                    ) || e
                            )}
                            onDetailsClick={handleDetailsClick}
                            onShareClick={handleShareClick}
                        />

                        {/* CATEGORY BAR */}
                        <section className="py-10">
                            <div className="flex justify-center items-center mb-10">
                                <h2 className="text-4xl font-extrabold text-white text-center">
                                    Upcoming Events
                                </h2>
                            </div>

                            <div className="flex space-x-3 overflow-x-auto pb-4 md:justify-center">
                                {categories.map((cat) => (
                                    <CategoryButton
                                        key={cat.name}
                                        name={cat.name}
                                        Icon={cat.icon}
                                        isActive={
                                            selectedCategory ===
                                            cat.name
                                        }
                                        onClick={() =>
                                            handleCategoryClickInListView(
                                                cat.name
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </section>

                        {isSearching && searchQuery.length > 2 && (
                            <div className="text-center py-5">
                                <p className="text-gray-400 text-lg">
                                    Showing results for:{" "}
                                    <span className="font-bold text-white">
                                        "{searchQuery}"
                                    </span>
                                </p>
                            </div>
                        )}

                        <HorizontalScrollSection
                            events={upcomingEvents}
                            onDetailsClick={handleDetailsClick}
                            onShareClick={handleShareClick}
                            title={
                                selectedCategory === "All Events"
                                    ? "All Events"
                                    : selectedCategory
                            }
                            onViewAllClick={handleViewAllPopular}
                        />

                        <HorizontalScrollSection
                            events={techEvents}
                            onDetailsClick={handleDetailsClick}
                            onShareClick={handleShareClick}
                            title="Tech Events"
                            onViewAllClick={handleViewAllTech}
                        />

                        <section className="py-10">
                            <div className="flex flex-col items-center mb-10">
                                <h2 className="text-4xl font-extrabold text-white text-center mb-6">
                                    Popular Events
                                </h2>
                                <div className="w-full flex justify-end">
                                    <button
                                        onClick={handleViewAllPopular}
                                        className="inline-flex items-center text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors px-0 py-0 group"
                                    >
                                        View All
                                        <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                                {popularEventsSlice.map((event) => (
                                    <EventCard
                                        key={`popular-${event.id}`}
                                        event={event}
                                        onDetailsClick={handleDetailsClick}
                                        onShareClick={handleShareClick}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-800">
                &copy; {new Date().getFullYear()} All rights reserved.
            </footer>
        </div>
    );
};

export default EventsPage;
