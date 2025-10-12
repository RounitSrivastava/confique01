"use client";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";

const EventCard = ({ event }) => {
  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-white rounded-xl shadow hover:shadow-lg transition block overflow-hidden"
    >
      {/* Event Banner */}
      <img
        src={event.banner}
        alt={event.title}
        className="w-full h-40 object-cover"
      />

      {/* Event Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{event.description}</p>

        {/* Event Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={14} /> {event.date}
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} /> {event.participants} Joined
          </div>
        </div>

        {/* Tags */}
        <div className="mt-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              event.type === "tech"
                ? "bg-purple-100 text-purple-600"
                : "bg-pink-100 text-pink-600"
            }`}
          >
            {event.type === "tech" ? "Tech" : "Cultural"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
