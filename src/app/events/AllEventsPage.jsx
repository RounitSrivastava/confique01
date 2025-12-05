// AllEventsPage.js
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
    usePathname, 
    useRouter, 
    useSearchParams 
} from "next/navigation";

// --- ICON IMPORTS ---
import {
    Search, User, Zap, Code, Shirt, Medal, Compass, BookOpen, Clock, MapPin, 
    Calendar, Menu, X, Heart, Share2, CheckCircle, MessageSquare, Clipboard, 
    ChevronRight, ChevronLeft, Gift, ZapOff, ArrowLeft, ClipboardList, Plus,
    Eye 
} from "lucide-react";

// --- Helper Component Replication (Omitted for brevity) ---

const CategoryButton = ({ name, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
            ${isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white"}
            whitespace-nowrap w-full justify-start
        `}
    >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{name}</span>
    </button>
);

const EventCard = ({ event, onDetailsClick, onShareClick }) => {
    const tagsToDisplay = (event.tags || []).filter(tag => 
        !tag.includes("Team") && !tag.includes("Solo")
    );
    const eventImp = event.impressions || 0;
    const isFree = (event.tags || []).includes("Free");

    return (
        <div
            onClick={() => onDetailsClick(event.id)}
            className="group flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-purple-500/30 w-full cursor-pointer h-full"
        >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
                <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/111827/ffffff?text=Image+Not+Found"; }}
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
                    <p className="text-sm leading-tight">{event.date.split(",")[0].trim()}</p>
                </div>
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
                <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
                    <span className="flex items-center space-x-2">
                        <span className="text-gray-400">
                            {event.venue.includes("Online") ? "Online" : "On-site"}
                        </span>
                        <span className="font-semibold text-green-400">
                            {isFree ? "Free" : "Paid"}
                        </span>
                    </span>
                    <span className="flex items-center text-purple-400 text-xs font-semibold">
                        <Eye className="w-3 h-3 mr-1" />
                        {eventImp.toLocaleString()}
                    </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-3 group-hover:text-purple-400 h-20">
                    {event.title}
                </h3>
                
                <p className="text-sm text-gray-400 flex items-center mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                    {event.venue.includes("|") ? event.venue.split("|").slice(-1).pop().trim() : event.venue}
                </p>

                <button className="mt-auto w-fit text-base font-semibold text-purple-400 hover:text-purple-300 transition-colors text-left">
                    View Details &rarr;
                </button>
            </div>
        </div>
    );
};


const AllEventsPage = ({ 
    ALL_EVENTS, 
    categories, 
    onDetailsClick, 
    onShareClick,
    parentPathname 
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialCategory = searchParams.get('category') || "All Events";
    const initialSearch = searchParams.get('q') || "";
    
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    const filteredEvents = useMemo(() => {
        let filtered = ALL_EVENTS;
        
        if (selectedCategory !== "All Events") {
            filtered = filtered.filter((e) => e.category === selectedCategory);
        }
        
        if (searchQuery.length > 0) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(lowerQuery) ||
                e.venue.toLowerCase().includes(lowerQuery) ||
                e.category.toLowerCase().includes(lowerQuery) ||
                (e.tags && e.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
            );
        }
        
        return filtered;
    }, [selectedCategory, searchQuery, ALL_EVENTS]);

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        setSearchQuery(""); 
        router.push(`${parentPathname}?view=all&category=${categoryName}`, { scroll: false });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    const handleBackToHome = () => {
        router.push(parentPathname, { scroll: true });
    };

    return (
        <div className="flex flex-col min-h-screen">
            
            {/* 1. HEADER: NON-STICKY (Flows with content) */}
            <header className="z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 p-4">
                    <button 
                        onClick={handleBackToHome}
                        className="flex items-center text-purple-400 hover:text-purple-300 font-bold transition-colors text-lg"
                    >
                        <ArrowLeft className="w-5 h-5 mr-3" />
                        All Events Explorer
                    </button>
                    <div className="flex items-center space-x-4">
                        {/* Right side is empty */}
                    </div>
                </div>
            </header>
            
            {/* 2. MAIN CONTENT AREA: Centered and constrained */}
            <div className="flex flex-col lg:flex-row flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
                
                {/* --- Left Sidebar/Filter Pane: STICKY --- */}
                <aside 
                    // Fixed width, uses sticky top-4 
                    // CRITICAL FIX: Explicitly applied mobile/small screen padding here to ensure search bar is not clipped.
                    className="lg:w-64 flex-shrink-0 lg:sticky top-4 z-20 h-fit lg:max-h-[calc(100vh-32px)] overflow-y-auto pb-10 
                               pt-4 lg:pr-6" // pt-4 ensures vertical space below header. lg:pr-6 separates from grid.
                >
                    
                    <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-gray-800 pb-2">
                        Filters
                    </h2>
                    
                    {/* Search Input FIX */}
                    <div className="relative mb-6">
                        {/* Icon position is left-3 */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search all events..."
                            // Input padding uses pl-10 to clear the icon.
                            className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-300 mb-3">Event Type</h3>
                        {(categories || []).map((cat) => (
                            <div key={cat.name} className="w-full">
                                <CategoryButton
                                    name={cat.name}
                                    Icon={cat.icon}
                                    isActive={selectedCategory === cat.name}
                                    onClick={() => handleCategoryClick(cat.name)}
                                />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* --- Main Event Grid --- */}
                <main className="lg:flex-1 w-full pt-4 lg:pt-0"> 
                    <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-gray-800 pb-3">
                        {selectedCategory}
                        {searchQuery.length > 0 && 
                            <span className="text-xl font-normal text-gray-400 block mt-1">
                                &mdash; Search for: "{searchQuery}"
                            </span>
                        }
                    </h1>
                    
                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                            {filteredEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onDetailsClick={onDetailsClick}
                                    onShareClick={onShareClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-900 rounded-xl">
                            <ZapOff className="w-12 h-12 mx-auto text-red-500 mb-4" />
                            <p className="text-xl font-semibold text-white">No events found</p>
                            <p className="text-gray-400">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AllEventsPage;