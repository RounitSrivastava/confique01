import { Calendar, Users } from "lucide-react";

export default function EventDetailsPage({ params }) {
  const { id } = params;

  // In real app -> fetch event details from DB
  const event = {
    id,
    title: "AI Tech Summit 2025",
    description:
      "Join us for the biggest AI Tech Summit of the year, featuring top researchers and industry leaders discussing the future of AI and its impact.",
    rules: [
      "Only registered users can attend.",
      "Carry your ID card for entry.",
      "Recording sessions is prohibited.",
    ],
    date: "Sep 30, 2025 • 10:00 AM",
    participants: 230,
    type: "tech",
    banner: "/images/ai-summit.jpg",
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full">
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Event Info */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Date & Participants */}
        <div className="flex items-center justify-between mb-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>{event.participants} Participants</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6">{event.description}</p>

        {/* Rules Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Rules</h2>
        <ul className="list-disc list-inside text-gray-600 mb-6">
          {event.rules.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>

        {/* Register Button */}
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
          Register for Event
        </button>
      </div>
    </div>
  );
}
