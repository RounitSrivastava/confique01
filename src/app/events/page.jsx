import EventCard from "@/components/EventCard";

export default function EventsPage() {
  const events = [
    {
      id: "1",
      title: "AI Tech Summit 2025",
      description: "A global conference on Artificial Intelligence trends.",
      date: "Sep 30, 2025",
      participants: 230,
      type: "tech",
      banner: "/images/ai-summit.jpg",
    },
    {
      id: "2",
      title: "Navratri Cultural Fest",
      description: "Celebrate Navratri with dance, music & culture.",
      date: "Oct 5, 2025",
      participants: 540,
      type: "cultural",
      banner: "/images/navratri.jpg",
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
