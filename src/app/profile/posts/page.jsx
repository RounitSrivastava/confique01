"use client";

export default function ProfilePosts() {
  const posts = [
    {
      id: 1,
      title: "My journey learning Next.js 🚀",
      content:
        "Just finished building my first full-stack app with Next.js, Prisma, and Tailwind. Loving the developer experience!",
      likes: 120,
      comments: 15,
      views: 800,
      date: "Sept 20, 2025",
    },
    {
      id: 2,
      title: "AI in 2025 🤖",
      content:
        "Do you think AI will replace developers, or empower them with better tools? Share your thoughts!",
      likes: 95,
      comments: 22,
      views: 670,
      date: "Sept 15, 2025",
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Posts</h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {post.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{post.date}</p>
            <p className="text-gray-700">{post.content}</p>

            {/* Stats */}
            <div className="flex gap-6 text-sm text-gray-500 mt-4">
              <span>👍 {post.likes} Likes</span>
              <span>💬 {post.comments} Comments</span>
              <span>👀 {post.views} Views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
