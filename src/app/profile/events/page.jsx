"use client";
import { useState } from "react";

export default function ProfileEvents() {
  const [tab, setTab] = useState("hosted");

  const hostedEvents = [
    {
      id: 1,
      title: "AI Hackathon 2025",
      date: "Sept 30, 2025",
      registrations: 120,
      views: 850,
      image: "/images/event1.jpg",
    },
    {
      id: 2,
      title: "Next.js Bootcamp",
      date: "Oct 10, 2025",
      registrations: 200,
      views: 1200,
      image: "/images/event2.jpg",
    },
  ];

  const registeredEvents = [
    {
      id: 1,
      title: "Cultural Fest 2025",
      date: "Oct 15, 2025",
      host: "IIT Delhi",
      image: "/images/event3.jpg",
    },
    {
      id: 2,
      title: "Startup Pitch Night",
      date: "Nov 2, 2025",
      host: "Nexus Incubator",
      image: "/images/event4.jpg",
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Events</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            tab === "hosted"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setTab("hosted")}
        >
          Hosted Events
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            tab === "registered"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setTab("registered")}
        >
          Registered Events
        </button>
      </div>

      {/* Hosted Events */}
      {tab === "hosted" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hostedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600">📅 {event.date}</p>
                <div className="flex justify-between text-sm mt-3">
                  <span>👥 {event.registrations} Registrations</span>
                  <span>👀 {event.views} Views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registered Events */}
      {tab === "registered" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registeredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600">📅 {event.date}</p>
                <p className="text-sm text-gray-600">🏢 Host: {event.host}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
