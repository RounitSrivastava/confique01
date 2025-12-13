// AllEventsPage.js
"use client";
import React, { useState, useMemo } from "react";
import {
    Search, MapPin, ZapOff, ArrowLeft, Eye
} from "lucide-react";

const CategoryButton = ({ name, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center space-x-2 px-5 py-2
            text-sm font-medium rounded-full transition-all
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

const EventCard = ({ event, onDetailsClick }) => {
    const tagsToDisplay = (event.tags || []).filter(
        t => !t.includes("Team") && !t.includes("Solo")
    );
    const eventImp = event.impressions || 0;
    const isFree = (event.tags || []).includes("Free");

    return (
        <div
            onClick={() => onDetailsClick(event.id)}
            className="group flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-2xl hover:scale-[1.02] cursor-pointer transition-all"
        >
            <div className="relative w-full h-52 sm:h-48 md:h-40 lg:h-36">
                <img
                    src={event.poster}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />

                {/* Free / Paid */}
                <div className="absolute top-3 right-3 flex space-x-2">
                    {tagsToDisplay.map((tag, i) => (
                        <span
                            key={i}
                            className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm 
                                ${tag.includes("Free") ? "bg-green-500/90" : "bg-gray-700/90"} text-white`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Date */}
                <div className="absolute bottom-2 left-2 bg-white text-gray-900 px-2 py-0.5 rounded-md text-[10px] font-semibold shadow">
    {event.date.split(",")[0]}
</div>

            </div>

            <div className="p-4 flex flex-col">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span className="flex items-center space-x-2">
                        <span>{event.venue.includes("Online") ? "Online" : "On-site"}</span>
                        <span className="text-green-400">{isFree ? "Free" : "Paid"}</span>
                    </span>

                    <span className="flex items-center text-purple-400">
                        <Eye className="w-3 h-3 mr-1" />
                        {eventImp.toLocaleString()}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300">
                    {event.title}
                </h3>

                <p className="text-sm text-gray-400 flex items-center mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                    {event.venue.split("|").pop().trim()}
                </p>

                <button className="text-purple-400 font-semibold mt-auto hover:text-purple-300">
                    View Details →
                </button>
            </div>
        </div>
    );
};

const AllEventsPage = ({
    ALL_EVENTS,
    categories,
    onDetailsClick,
    parentPathname
}) => {
    const [selectedCategory, setSelectedCategory] = useState("All Events");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredEvents = useMemo(() => {
        let list = ALL_EVENTS;

        if (selectedCategory !== "All Events")
            list = list.filter(e => e.category === selectedCategory);

        if (searchQuery.length > 0) {
            const query = searchQuery.toLowerCase();
            list = list.filter(e =>
                e.title.toLowerCase().includes(query) ||
                e.venue.toLowerCase().includes(query) ||
                e.category.toLowerCase().includes(query)
            );
        }

        return list;
    }, [selectedCategory, searchQuery, ALL_EVENTS]);

    return (
        <div className="min-h-screen">

            {/* HEADER */}
            <header className="bg-[#0d0d0d]/80 p-1 md:p-5">

                <button
                    onClick={() => window.history.back()}
                    className="flex items-center text-purple-400 hover:text-purple-300 font-bold"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> All Events
                </button>
            </header>

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto px-13 sm:px-4 py-10">


                {/* SEARCH BAR – centered on all screens, wider on desktop */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-64 sm:w-80 md:w-[28rem] lg:w-[32rem]">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full py-2.5 pl-9 pr-3 rounded-md bg-gray-800 border border-gray-700 text-white text-sm"
                        />
                    </div>
                </div>

                {/* CATEGORY ROW */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {categories.map(cat => (
                        <CategoryButton
                            key={cat.name}
                            name={cat.name}
                            Icon={cat.icon}
                            isActive={selectedCategory === cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                        />
                    ))}
                </div>

                {/* EVENTS GRID */}
                {filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredEvents.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onDetailsClick={onDetailsClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-900 rounded-xl">
                        <ZapOff className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <p className="text-xl text-white font-semibold">No events found</p>
                        <p className="text-gray-400">Try another category or search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllEventsPage;
