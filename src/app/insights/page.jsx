"use client";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";

export default function InsightsPage() {
  const insights = [
    {
      id: 1,
      author: "Aditi Sharma",
      avatar: "/images/user1.jpg",
      time: "2h ago",
      content:
        "Excited to attend the Tech Expo 2025! 🚀 AI + Robotics collab is going to change the game.",
      image: "/images/insight1.jpg",
      likes: 34,
      comments: 12,
    },
    {
      id: 2,
      author: "Rahul Mehta",
      avatar: "/images/user2.jpg",
      time: "5h ago",
      content:
        "Our cultural fest is around the corner 🎉. Looking forward to the dance battles and music night!",
      image: "/images/insight2.jpg",
      likes: 56,
      comments: 18,
    },
    {
      id: 3,
      author: "Neha Kapoor",
      avatar: "/images/user3.jpg",
      time: "1d ago",
      content:
        "Just published my latest blog on startup funding trends for 2025. Would love to hear thoughts!",
      image: null,
      likes: 22,
      comments: 7,
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Insights</h1>

      {/* Posts Feed */}
      <div className="space-y-6">
        {insights.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5"
          >
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">{post.author}</p>
                <p className="text-xs text-gray-500">{post.time}</p>
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-700 mt-4">{post.content}</p>

            {/* Optional Image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post content"
                className="mt-3 rounded-lg w-full max-h-80 object-cover"
              />
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 text-gray-600 text-sm">
              <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <ThumbsUp size={16} /> {post.likes}
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-green-600">
                <MessageSquare size={16} /> {post.comments}
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-purple-600">
                <Share2 size={16} /> Share
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
