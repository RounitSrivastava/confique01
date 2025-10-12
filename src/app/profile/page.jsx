"use client";
import Link from "next/link";

export default function ProfileDashboard() {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Posts</h2>
          <p className="text-2xl font-bold text-blue-600">42</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Likes</h2>
          <p className="text-2xl font-bold text-pink-600">1.2k</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Event Hosted</h2>
          <p className="text-2xl font-bold text-green-600">3</p>
        </div>
      </div>

      {/* Navigation to sub-pages */}
      <div className="space-y-4">
        <Link
          href="/profile/posts"
          className="block bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-700 transition"
        >
          📌 View My Posts
        </Link>
        <Link
          href="/profile/events"
          className="block bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-700 transition"
        >
          📊 Event Analytics
        </Link>
        <Link
          href="/profile/details"
          className="block bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-700 transition"
        >
          🧑 Profile Details
        </Link>
        <Link
          href="/profile/settings"
          className="block bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-700 transition"
        >
          ⚙️ Account Settings
        </Link>
      </div>
    </div>
  );
}
