// components/Feed.jsx
"use client";

import Image from "next/image";
import { Heart, MessageCircle, Eye } from "lucide-react";

const posts = [
  {
    id: 1,
    user: "Kina Rally",
    avatar: "/avatar-2.png",
    time: "Today 08:02 AM",
    content:
      "Hello from Bali! I’m a traveling content creator and excited to join the community.",
    media: "/post-1.jpg",
    likes: 128,
    comments: 24,
    views: "3.1k",
  },
  {
    id: 2,
    user: "Alex Jordan",
    avatar: "/avatar-3.png",
    time: "Yesterday",
    content:
      "Shipped a new micro-animations library for React. Feedback welcome!",
    media: "/post-2.jpg",
    likes: 342,
    comments: 57,
    views: "8.4k",
  },
  {
    id: 3,
    user: "Maya Chen",
    avatar: "/avatar-4.png",
    time: "2 days ago",
    content:
      "Sneak peek of the community studio we’re building together.",
    media: "/post-3.jpg",
    likes: 221,
    comments: 31,
    views: "5.7k",
  },
];

const events = [
  {
    id: "e1",
    title: "Beginner Session: Content Strategy",
    banner: "/event-1.jpg",
    category: "Workshop",
    datetime: "Jun 03, 10:45 AM",
    location: "Online",
  },
  {
    id: "e2",
    title: "Design Meetup for Creators",
    banner: "/event-2.jpg",
    category: "Meetup",
    datetime: "Jun 12, 06:00 PM",
    location: "San Francisco",
  },
  {
    id: "e3",
    title: "AI Tools for Video Editing",
    banner: "/event-3.jpg",
    category: "Webinar",
    datetime: "Jun 18, 02:00 PM",
    location: "Online",
  },
];

function PostCard({ post }) {
  return (
    <article className="rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Image src={post.avatar} alt={post.user} width={36} height={36} className="rounded-md" />
        <div>
          <p className="text-sm font-medium">{post.user}</p>
          <p className="text-xs text-gray-400">{post.time}</p>
        </div>
      </div>
      {post.media && (
        <div className="relative aspect-video">
          <Image src={post.media} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-200">{post.content}</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {post.likes}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments}</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {post.views}</span>
        </div>
      </div>
    </article>
  );
}

function EventCard({ event }) {
  return (
    <article className="rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm overflow-hidden">
      <div className="relative h-36">
        <Image src={event.banner} alt={event.title} fill className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-xs font-medium">
          {event.category}
        </span>
      </div>
      <div className="px-4 py-3">
        <h3 className="font-medium">{event.title}</h3>
        <p className="mt-1 text-sm text-gray-400">{event.datetime} • {event.location}</p>
        <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-sm font-medium transition">
          Register
        </button>
      </div>
    </article>
  );
}

export default function Feed() {
  return (
    <div className="mx-auto max-w-[900px]">
      {/* Composer placeholder */}
      <div className="mb-4 rounded-xl bg-[#1a1a1a] border border-[#262626] shadow-sm p-4">
        <input
          placeholder="What's on your mind?"
          className="w-full rounded-lg bg-[#111] border border-[#262626] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Posts */}
      <section className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      {/* Events grid */}
      <h2 className="mt-8 mb-3 text-sm font-medium text-gray-300">Upcoming events</h2>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </section>
    </div>
  );
}
