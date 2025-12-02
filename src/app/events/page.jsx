// components/App.jsx (or EventsPage.jsx)
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  X,
  Heart,
  Share2,
  CheckCircle,
  MessageSquare,
  Clipboard,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Gift,
  ZapOff,
  ArrowLeft,
} from "lucide-react";

// --- MOCK DATA ---

// MOCK EVENTS Data
const MOCK_EVENTS = [
  {
    id: 1,
    title: "L'Oréal Brandstorm",
    venue: "Online | Rose Garden, Campus-18",
    date: "Wed, 29 Apr 2025", // Past date for demonstration purposes (Current is Dec 2, 2025)
    poster:
      "https://placehold.co/400x550/4A148C/ffffff?text=L'OREAL+BRANDSTORM",
    tags: ["Team (4)", "Free"],
    isFeatured: true,
    category: "Competition",
    rounds: [
        { title: "Registration Opens", description: "Sign up and form your teams.", date: "15 Mar" },
        { title: "Concept Submission Deadline", description: "Submit your brand strategy pitch.", date: "30 Mar" },
        { title: "National Finals", description: "Top teams compete for the global spot.", date: "29 Apr" }
    ]
  },
  {
    id: 2,
    title: "Raiders Reckoning",
    venue: "KIIT Auditorium",
    date: "Sun, 7 Nov 2025", // Past date
    poster:
      "https://placehold.co/400x550/212121/ffffff?text=RAIDERS+RECKONING",
    tags: ["Solo", "Free"],
    category: "Competition",
    rounds: [
        { title: "Qualifier Round 1", description: "Online quiz challenge.", date: "20 Oct" },
        { title: "Main Event Registration", description: "Final check-in for competitors.", date: "01 Nov" },
        { title: "Final Battle Stage", description: "Live competitive gaming event.", date: "07 Nov" }
    ]
  },
  {
    id: 3,
    title: "RaagRang – Inter-College Cultural Fest",
    venue: "Multiple Venues",
    date: "Sat, 6 Jun 2026", // Future date (Modified to demonstrate "Open")
    poster:
      "https://placehold.co/400x550/FF5722/ffffff?text=STAND+UP+COMEDY+SHOW",
    tags: ["Team (3)"],
    category: "Cultural",
  },
  {
    id: 4,
    title: "KIIT International Model United Nations",
    venue: "KIIT Campus",
    date: "Jan 29 2026", // Future date
    poster:
      "https://placehold.co/400x550/3F51B5/ffffff?text=KIIT+MUN+2025",
    tags: ["Team (4)", "Free"],
    category: "Competition",
  },
  {
    id: 5,
    title: "Hackify Battle on TryHackMe",
    venue: "Online",
    date: "Thu, 1 Dec 2025", // Past date
    poster:
      "https://placehold.co/400x550/0D47A1/ffffff?text=CYBER+SECURITY+CONFERENCE",
    tags: ["Solo", "Free"],
    category: "Tech",
  },
];

const categories = [
  { name: "All Events", icon: Zap },
  { name: "Tech", icon: Code },
  { name: "Fashion", icon: Shirt },
  { name: "Competition", icon: Medal },
  { name: "Cultural", icon: Compass },
  { name: "Seminar", icon: BookOpen },
  { name: "Workshop", icon: Clock },
  { name: "Others", icon: null }, 
];

const EVENT_DETAIL_DATA = {
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
        description:
          "A rapid-fire knowledge challenge...",
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
    { ...MOCK_EVENTS[1], id: 101, title: "Featured: Raiders Reckoning", isFeatured: true, date: "Thu, 15 Dec 2025" }, 
    { ...MOCK_EVENTS[4], id: 102, title: "Featured: Hackify Battle", isFeatured: true, date: "Thu, 15 Dec 2025" }, 
    { 
        id: 999, 
        title: "Global Tech Summit 2026", 
        venue: "Virtual Event", 
        date: "May 10-12 2026", 
        poster: "https://placehold.co/400x550/004D40/ffffff?text=GLOBAL+TECH+SUMMIT", 
        tags: ["Team (1)", "Paid"], 
        isFeatured: true,
        category: "Seminar",
    }
];

const TOP_NAV = [
    { label: "Home", href: "/" },
    { label: "Groups", href: "/groups" },
    { label: "Insights", href: "/insights" },
    { label: "News", href: "/news" },
];

// --- Reusable Components ---

// Component: CategoryButton (Handles null icon)
const CategoryButton = ({ name, Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
      ${isActive
        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
        : "text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white"}
      whitespace-nowrap
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span>{name}</span>
  </button>
);


const TabButton = ({ name, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-6 py-3 text-base font-semibold border-b-2 transition-all duration-300
      ${isActive
        ? "border-purple-600 text-white"
        : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"}
      whitespace-nowrap
    `}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span>{name}</span>
  </button>
);

const SectionTitle = ({ children, icon: Icon }) => (
  <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center">
    {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
    {children}
  </h2>
);

// Component: EventCard (With working Like button)
const EventCard = ({ event, onDetailsClick, onShareClick }) => {
    const [shareFeedback, setShareFeedback] = useState(null); 
    const [isLiked, setIsLiked] = useState(false); 

    const localHandleShare = (e) => {
        e.stopPropagation();
        onShareClick(event.id);
        
        if (!navigator.share) {
            setShareFeedback({ icon: Clipboard, text: "Link Copied!" });
            setTimeout(() => setShareFeedback(null), 1500);
        }
    };
    
    const handleLikeClick = (e) => {
        e.stopPropagation();
        setIsLiked(prev => !prev);
    };

    return (
        <div 
            onClick={() => onDetailsClick(event.id)} 
            className="group flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-purple-500/30 w-full max-w-sm cursor-pointer"
        >
            
            {/* Image/Poster Container */}
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

            {/* Tags (Top Right) */}
            <div className="absolute top-3 right-3 flex space-x-2">
                {event.tags.map((tag, index) => (
                <span
                    key={index}
                    className={`
                    px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm
                    ${tag.includes("Team") ? "bg-purple-600/90 text-white" : ""}
                    ${tag.includes("Solo") ? "bg-blue-500/90 text-white" : ""}
                    ${tag.includes("Free") ? "bg-green-500/90 text-white" : "bg-gray-700/90 text-white"}
                    `}
                >
                    {tag}
                </span>
                ))}
            </div>

            {/* Date Overlay (Bottom Left) */}
            <div className="absolute bottom-3 left-3 bg-white text-gray-900 px-3 py-1 rounded-lg font-bold text-center shadow-lg">
                <p className="text-sm leading-tight">
                {event.date.split(",")[0].trim()}
                </p>
            </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col justify-between flex-grow">
            
                {/* Location/Price/Icons Row */}
                <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
                    <span className="flex items-center space-x-2">
                        <span className="text-gray-400">
                            {event.venue.includes("Online") ? "Online" : "On-site"}
                        </span>
                        <span className="font-semibold text-green-400">
                            {event.tags.includes("Free") ? "Free" : "Paid"}
                        </span>
                    </span>
                    
                    {/* Action Icons (Share & Heart) */}
                    <span className="flex items-center space-x-2">
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
                            className={`w-4 h-4 cursor-pointer transition-colors ${
                                isLiked 
                                    ? 'text-red-500 fill-red-500'
                                    : 'text-gray-500 hover:text-red-500 hover:fill-gray-900'
                            }`}
                            onClick={handleLikeClick} 
                        /> 
                    </span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-3 group-hover:text-purple-400">
                    {event.title}
                </h3>

                {/* Venue/Location */}
                <p className="text-sm text-gray-400 flex items-center mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                    {event.venue.includes("|") ? event.venue.split("|").slice(-1).pop().trim() : event.venue} 
                </p>

                {/* View Details Link */}
                <button className="mt-auto w-fit text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors text-left">
                    View Details &rarr;
                </button>
            </div>
        </div>
    );
};


// Component: FeaturedCarousel
const FeaturedCarousel = ({ events, onDetailsClick, onShareClick, interval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextEvent = useCallback(() => {
        setCurrentIndex((prevIndex) => 
            (prevIndex + 1) % events.length
        );
    }, [events.length]);
    
    const prevEvent = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex - 1 + events.length) % events.length
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
            {/* Background & Overlays */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xl z-0 rounded-[2rem]"></div>
            <div
                className="absolute inset-0 z-0 opacity-80 transition-opacity duration-1000"
                style={{
                    background:
                        "radial-gradient(circle at 75% 10%, #6D28D9, transparent 50%), radial-gradient(circle at 15% 90%, #9333EA, transparent 50%)",
                }}
            ></div>
            
            {/* Carousel Navigation Buttons */}
            {events.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevEvent(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white z-20 hover:bg-white/40 transition-colors"
                        aria-label="Previous event"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextEvent(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white z-20 hover:bg-white/40 transition-colors"
                        aria-label="Next event"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Content Area */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between transition-opacity duration-500 opacity-100">
                <div className="md:w-1/2 p-4 md:pr-8 text-center md:text-left">
                    <span className="inline-block px-4 py-1 text-xs font-semibold text-white bg-purple-600 rounded-full mb-4 shadow-xl">
                        Featured Event {events.length > 1 ? `(${currentIndex + 1}/${events.length})` : ''}
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tighter">
                        {event.title}
                    </h1>
                    <p className="text-xl text-gray-200 font-medium mb-6 flex items-center justify-center md:justify-start">
                        <Calendar className="w-5 h-5 mr-3 text-yellow-300" />
                        {event.date}
                    </p>
                    <div className="flex items-center justify-center md:justify-start space-x-4">
                        <button className="inline-flex items-center bg-white text-gray-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-200 transition-colors group">
                            Click to view event details
                            <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
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

            {/* Dot Indicators */}
            {events.length > 1 && (
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                index === currentIndex ? "bg-white scale-110" : "bg-gray-400/50 hover:bg-white/70"
                            }`}
                            aria-label={`Go to event ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// Component: EventDetailsPage 
const EventDetailsPage = ({ event, onBackClick }) => {
    const [activeTab, setActiveTab] = useState("Details");
    const [registrationStatus, setRegistrationStatus] = useState('Open'); 
    
    const displayEvent = event; 
    const isComplexData = (displayEvent.id === EVENT_DETAIL_DATA.id || displayEvent.title === EVENT_DETAIL_DATA.title);

    const roundsData = isComplexData ? EVENT_DETAIL_DATA : displayEvent;
    
    const sidebarDetails = {
        hostedBy: roundsData.hostedBy || displayEvent.hostedBy || 'Various hosts',
        eligibility: roundsData.eligibility || 'Open to all students.',
        registration: roundsData.registration || { start: displayEvent.date, end: 'TBD', status: 'Open' },
        tagline: roundsData.tagline || displayEvent.tags.join(', ') || displayEvent.category,
        rounds: roundsData.rounds || []
    };
 
    // Logic to check if event date has passed (simulated)
    const checkEventStatus = useCallback(() => {
        try {
            const eventDate = new Date(displayEvent.date);
            const today = new Date();
            
            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                return 'Ended';
            }
            return 'Open';
        } catch (error) {
            console.error("Invalid date format, assuming Open.");
            return 'Open';
        }
    }, [displayEvent.date]);

    // Check status on mount/update
    useEffect(() => {
        if (registrationStatus === 'Open') {
            const status = checkEventStatus();
            if (status === 'Ended') {
                setRegistrationStatus('Ended');
            }
        }
    }, [checkEventStatus, registrationStatus]);

    // Handler for registration button click
    const handleRegister = () => {
        if (registrationStatus === 'Open') {
            setRegistrationStatus('Registered');
            console.log(`Registered for ${displayEvent.title}`);
        }
    };

    // Determine button appearance and text based on status
    const getButtonProps = () => {
        if (registrationStatus === 'Registered') {
            return {
                text: '✓ Registered',
                className: 'w-full py-3 bg-green-600 text-white font-bold rounded-lg cursor-default shadow-lg shadow-green-500/30 flex items-center justify-center',
                disabled: true,
                Icon: CheckCircle,
            };
        }
        if (registrationStatus === 'Ended') {
            return {
                text: 'Event Ended',
                className: 'w-full py-3 bg-gray-600 text-gray-400 font-bold rounded-lg cursor-not-allowed shadow-none flex items-center justify-center',
                disabled: true,
                Icon: Clock,
            };
        }
        // Status is 'Open'
        return {
            text: 'Register Now',
            className: 'w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30',
            disabled: false,
            Icon: null,
        };
    };

    const buttonProps = getButtonProps();
 
    const renderContent = () => {
      
      switch (activeTab) {
        case "Stages & Timeline":
          if (sidebarDetails.rounds.length === 0) {
              return (
                  <div className="text-center py-10 text-gray-400">
                      <ZapOff className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                      <p>Stage and timeline details are not yet available for this event.</p>
                  </div>
              );
          }

          return (
            <div className="space-y-12">
              {sidebarDetails.rounds.map((round, index) => (
                <div key={index} className="flex space-x-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${index === 0 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                      {index + 1}
                    </div>
                    {index < sidebarDetails.rounds.length - 1 && (
                      <div className="w-px h-full bg-gray-700 my-2" />
                    )}
                  </div>
                  <div className="pb-8 flex-grow">
                    <p className="text-sm text-purple-400 font-medium flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      {round.date}
                    </p>
                    <h3 className="text-xl font-bold text-white mb-2">{round.title}</h3>
                    <p className="text-gray-300">{round.description}</p>
                    {round.rules && (
                      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <p className="font-semibold text-white mb-2">Rules:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                          {round.rules.map((rule, i) => (
                            <li key={i}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
    
        case "Details":
          return (
            <div className="space-y-8">
              <SectionTitle icon={ClipboardList}>{displayEvent.title} Overview</SectionTitle>
              
              {sidebarDetails.rounds.length > 0 ? (
                  <>
                      <p className="text-gray-300 text-lg leading-relaxed">
                          Welcome! This event, **{displayEvent.title.split(' - ')[0]}**, challenges participants across multiple stages designed to test various skills.
                      </p>
                      <p className="text-gray-300 text-lg leading-relaxed">
                          {isComplexData ? "If you're ready to think smart, act fast, and deliver the most engaging content under pressure, register now!" : "Read the timeline to prepare your strategy for registration and submission deadlines."}
                      </p>
                  </>
              ) : (
                  <p className="text-gray-300 text-lg leading-relaxed">
                      This is the detailed description for the event: **{displayEvent.title}**. This section would contain comprehensive information about the structure, prizes, and theme of the event.
                  </p>
              )}
              
              <SectionTitle icon={User}>Organizer & Contact</SectionTitle>
              <p className="text-gray-300">
                  Hosted by: <span className="font-semibold text-purple-400">{sidebarDetails.hostedBy}</span>
              </p>
              
            </div>
          );
        
        default:
          return null;
      }
    };
 
    return (
      <div className="min-h-screen bg-gray-950 text-white font-sans antialiased">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button 
                onClick={onBackClick} 
                className="flex items-center text-gray-400 hover:text-purple-400 transition-colors font-semibold"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to All Events
            </button>
        </div>

        {/* Event Header Hero */}
        <div className="relative h-[280px] overflow-hidden">
          <img
            src={displayEvent.poster} 
            alt={displayEvent.title}
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-black/70 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <p className="text-purple-400 font-semibold text-sm uppercase mb-2">
                {displayEvent.category} by {sidebarDetails.hostedBy}
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {displayEvent.title}
              </h1>
              <p className="text-xl text-gray-300 mt-2">{sidebarDetails.tagline || displayEvent.title}</p>
            </div>
          </div>
        </div>
 
        {/* Main Content & Sidebar Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-10">
            
            {/* Left Column: Tabs & Content */}
            <div className="lg:col-span-8">
              <div className="flex overflow-x-auto border-b border-gray-800 mb-8">
                {[
                  { name: "Stages & Timeline", icon: Clock },
                  { name: "Details", icon: ClipboardList },
                ].map((tab) => (
                    <TabButton
                        key={tab.name}
                        name={tab.name}
                        icon={tab.icon}
                        isActive={activeTab === tab.name}
                        onClick={() => setActiveTab(tab.name)}
                    />
                ))}
              </div>
              {renderContent()}
            </div>
 
            {/* Right Column: Sidebar (Sticky) */}
            <div className="lg:col-span-4 mt-10 lg:mt-0 space-y-6">
              
              <div className="space-y-6 sticky top-20"> 
                  
                  {/* 1. Registration Card (Main Action) */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between text-white font-bold text-xl">
                        <p>Registration</p>
                        <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="space-y-2 text-gray-300 text-sm">
                        <p className="flex justify-between">
                            Start Date: <span className="font-medium text-white">{sidebarDetails.registration.start || displayEvent.date}</span>
                        </p>
                        <p className="flex justify-between">
                            End Date: <span className="font-medium text-white">{sidebarDetails.registration.end || 'TBD'}</span>
                        </p>
                        <p className="flex justify-between">
                            Fees: <span className="font-medium text-green-400">{displayEvent.tags.includes("Free") ? "Free" : "Paid"}</span>
                        </p>
                    </div>
                    
                    {/* DYNAMIC REGISTER BUTTON */}
                    <button 
                        onClick={handleRegister}
                        disabled={buttonProps.disabled}
                        className={buttonProps.className}
                    >
                        {buttonProps.Icon && <buttonProps.Icon className="w-5 h-5 mr-2" />}
                        {buttonProps.text}
                    </button>
                    {/* END DYNAMIC REGISTER BUTTON */}

                  </div>
                  
                  {/* 2. Eligibility Card */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-lg font-semibold text-white">Eligibility</p>
                    </div>
                    <p className="text-gray-300 text-sm">{sidebarDetails.eligibility}</p>
                  </div>

                  {/* 3. Prizes for Winners Card */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                    <div className="flex items-center space-x-3">
                        <Gift className="w-5 h-5 text-yellow-400" />
                        <p className="text-lg font-semibold text-white">Prizes for Winners</p>
                    </div>
                    <p className="text-gray-300 text-sm">
                        {displayEvent.title.includes('L\'Oréal') ? (
                            "Internship opportunities, Fast Track HR interviews, and cash prizes."
                        ) : (
                            "Cash prizes up to ₹1,00,000, exciting goodies, and certificates for top winners."
                        )}
                    </p>
                  </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

// MAIN COMPONENT FOR THE PAGE
const EventsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState("All Events");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [eventDetailData, setEventDetailData] = useState(null); 
    const [isSearching, setIsSearching] = useState(false); 
    const [searchQuery, setSearchQuery] = useState("");      
    const pathname = usePathname();

    const handleSearchToggle = () => {
        setIsSearching(prev => !prev);
        if (!isSearching) setSearchQuery("");
    };

    const filteredEvents = useMemo(() => {
        const carouselIds = FEATURED_CAROUSEL_EVENTS.map(e => e.id);
        let filtered = MOCK_EVENTS.filter((e) => !carouselIds.includes(e.id));
        
        if (selectedCategory !== "All Events") {
             filtered = filtered.filter((e) => e.category === selectedCategory);
        }

        if (searchQuery.length > 2) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(e => 
                e.title.toLowerCase().includes(lowerQuery) ||
                e.venue.toLowerCase().includes(lowerQuery) ||
                e.category.toLowerCase().includes(lowerQuery) ||
                e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }
        
        return filtered;
    }, [selectedCategory, searchQuery]);

    const featuredCarouselEvents = FEATURED_CAROUSEL_EVENTS;

    const handleDetailsClick = (id) => {
        const eventToDisplay = MOCK_EVENTS.find(e => e.id === id) || FEATURED_CAROUSEL_EVENTS.find(e => e.id === id);
        
        if (eventToDisplay) {
            setEventDetailData(eventToDisplay);
        } else {
            setEventDetailData(EVENT_DETAIL_DATA); 
        }
        window.scrollTo(0, 0); 
    };
    
    const handleShareClick = (id) => {
        const shareLink = `${window.location.origin}/events/details-page-id-${id}`;
        
        if (navigator.share) {
            navigator.share({
                title: "Check out this event!",
                url: shareLink,
            }).catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Sharing failed', error);
                }
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareLink).then(() => {
                console.log('Link copied to clipboard (Fallback)');
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        } else {
            alert(`Share functionality not supported. Link: ${shareLink}`);
        }
    };

    const handleBackClick = () => {
        setEventDetailData(null);
        window.scrollTo(0, 0); 
    };

    const isMobile = () => typeof window !== "undefined" && window.innerWidth < 1024;

    const renderDetailsView = eventDetailData !== null;


    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans antialiased relative">
            {/* Hamburger - top-left (always visible on mobile) */}
            <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-gray-900 border border-gray-800 shadow-md lg:hidden"
            >
                <Menu className="w-6 h-6 text-gray-300" />
            </button>

            {/* Sidebar (slide-over) */}
            <div
                onClick={() => setSidebarOpen(false)}
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
                    sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                } lg:hidden`}
            />
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0d0d0d] border-r border-[#262626] transform transition-transform duration-300 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:hidden`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-extrabold text-purple-400">Confique</h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md bg-gray-900 border border-gray-800">
                        <X className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {TOP_NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                if (isMobile()) setSidebarOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 ${
                                pathname === item.href ? "bg-gray-800 text-white" : "text-gray-200"
                            }`}
                        >
                            <span className="w-4 h-4 inline-block bg-gray-600 rounded-sm" />
                            <span className="text-gray-200">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/create-post" onClick={() => isMobile() && setSidebarOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">Create Post</Link>
                    <Link href="/create-event" onClick={() => isMobile() && setSidebarOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">Create Event</Link>
                    <Link href="/saved" onClick={() => isMobile() && setSidebarOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">Saved Items</Link>
                </div>
            </aside>

            {/* Header (Non-Sticky) */}
            <header className={`z-40 bg-gray-950/90 backdrop-blur-sm shadow-lg shadow-black/30 ${renderDetailsView ? 'hidden lg:block' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    
                    {/* Left/Center Section */}
                    <div className="flex items-center space-x-6 w-full">
                        <h1 className="text-2xl font-extrabold tracking-tight text-purple-400 hidden lg:block">Confique</h1>
                        
                        {/* Conditional Navigation / Search Bar */}
                        {isSearching ? (
                            <div className="relative flex-grow max-w-lg md:max-w-xl">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search events, posts, people..."
                                    className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery("")}
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

                    {/* Right Section: Toggle Button & User */}
                    <div className="flex items-center space-x-4 ml-auto md:ml-0">
                        {/* Search Toggle Button */}
                        <button onClick={handleSearchToggle} aria-label="Toggle search">
                            <Search className={`w-5 h-5 transition-colors ${isSearching ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`} />
                        </button>
                        
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-105">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main>
                {renderDetailsView ? (
                    // RENDER EVENT DETAILS PAGE
                    <EventDetailsPage 
                        event={eventDetailData} 
                        onBackClick={handleBackClick} 
                    />
                ) : (
                    // RENDER EVENTS LIST PAGE
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                        
                        <FeaturedCarousel 
                            events={featuredCarouselEvents} 
                            onDetailsClick={handleDetailsClick} 
                            onShareClick={handleShareClick} 
                        />

                        <section className="py-10">
                            <div className="flex justify-center items-center mb-10">
                                <h2 className="text-4xl font-extrabold text-white text-center">Upcoming Events</h2>
                                <span className="ml-3 text-lg font-semibold text-purple-400">({filteredEvents.length} events)</span>
                            </div>

                            <div className="flex space-x-3 overflow-x-auto pb-4 md:justify-center">
                                {categories.map((cat) => (
                                    <CategoryButton
                                        key={cat.name}
                                        name={cat.name}
                                        Icon={cat.icon}
                                        isActive={selectedCategory === cat.name}
                                        onClick={() => setSelectedCategory(cat.name)}
                                    />
                                ))}
                            </div>
                        </section>
                        
                        {/* Search Feedback */}
                        {isSearching && searchQuery.length > 2 && (
                             <div className="text-center py-5">
                                <p className="text-gray-400 text-lg">
                                    Showing results for: <span className="font-bold text-white">"{searchQuery}"</span>
                                </p>
                            </div>
                        )}

                        <section className="pb-16">
                            {filteredEvents.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {filteredEvents.map((event) => (
                                        <EventCard 
                                            key={event.id} 
                                            event={event} 
                                            onDetailsClick={handleDetailsClick} 
                                            onShareClick={handleShareClick}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-900 rounded-xl mt-8">
                                    <h3 className="text-xl font-semibold text-gray-400">
                                        No events found matching your current filter{searchQuery && ` or search query "${searchQuery}"`}.
                                    </h3>
                                </div>
                            )}
                        </section>

                        <section className="py-10">
                            <h2 className="text-4xl font-extrabold text-white text-center mb-10">Popular Events</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                                {MOCK_EVENTS.slice(1, 4).map((event) => (
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

            {/* Footer (Always render at the bottom) */}
            <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-800">
                &copy; {new Date().getFullYear()} All rights reserved.
            </footer>
        </div>
    );
};

export default EventsPage;