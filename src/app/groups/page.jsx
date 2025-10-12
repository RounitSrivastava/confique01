"use client";
import { Users, PlusCircle } from "lucide-react";

export default function GroupsPage() {
  const groups = [
    {
      id: 1,
      name: "AI & Machine Learning",
      description:
        "Discuss and share resources on Artificial Intelligence and ML projects.",
      members: 234,
      image: "/images/group1.jpg",
    },
    {
      id: 2,
      name: "Cultural Arts Club",
      description:
        "For those who love music, dance, drama, and cultural activities 🎭.",
      members: 180,
      image: "/images/group2.jpg",
    },
    {
      id: 3,
      name: "Startup Enthusiasts",
      description:
        "A group for aspiring founders and entrepreneurs to connect & collaborate.",
      members: 310,
      image: "/images/group3.jpg",
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <PlusCircle size={18} />
          Create Group
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search groups..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex flex-col"
          >
            {/* Group Image */}
            <img
              src={group.image}
              alt={group.name}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />

            {/* Group Info */}
            <h2 className="text-lg font-semibold text-gray-800">
              {group.name}
            </h2>
            <p className="text-sm text-gray-600 mt-2 flex-grow">
              {group.description}
            </p>

            {/* Members + Join */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Users size={16} />
                {group.members} members
              </div>
              <button className="px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
