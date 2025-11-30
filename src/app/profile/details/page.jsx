import React from 'react';
import { Heart, MessageCircle, MoreVertical, Edit } from 'lucide-react';

export default function ProfilePage() {
  const posts = [
    {
      id: 1,
      title: 'The Power of Small Wins in a Startup Journey',
      excerpt: 'In a startup, big milestones like funding rounds or massive user growth often grab the spotlight, but what truly keeps a team movin...',
      date: '22/8/2025 at 06:40 pm',
      likes: 5,
      comments: 0
    },
    {
      id: 2,
      title: 'Building Resilient Tech Teams',
      excerpt: 'Creating strong technical teams requires more than just hiring talented developers. It requires fostering a culture of continuous learning...',
      date: '20/8/2025 at 03:15 pm',
      likes: 2,
      comments: 0
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header Section */}
        <div className="bg-[#0f0f0f] rounded-2xl p-8 mb-6 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-pink-900/5"></div>
          
          <div className="relative flex flex-col md:flex-row gap-8">
            {/* Left: Profile Picture and Info */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br linear-gradient(to right, #7190fd, #9c77fe) flex items-center justify-center shadow-lg shadow-purple-900/50"></div>
                <div className="absolute bottom-2 right-2 group/edit">
                  <button className="bg-white/90 text-black rounded-full p-2 hover:bg-white transition-all shadow-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                      Edit your profile
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-1">vaidehi sharma</h1>
                <p className="text-gray-400 text-sm">vaidehisharma1913@gmail.com</p>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="flex-1 flex items-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                <div className="text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-1">2</div>
                  <div className="text-gray-400 text-sm tracking-wide">POSTS</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-1">7</div>
                  <div className="text-gray-400 text-sm tracking-wide">LIKES</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-pink-600 mb-1">0</div>
                  <div className="text-gray-400 text-sm tracking-wide">COMMENTS</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600 mb-1">0</div>
                  <div className="text-gray-400 text-sm tracking-wide">REGISTRATIONS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Your Posts</h2>
            
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#0f0f0f] rounded-2xl p-6 hover:bg-[#1a1a1a] transition-all duration-300 group">
                  {/* Post Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex-shrink-0"></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">vaidehi sharma</h3>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                            Consights
                          </span>
                          <button className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h4 className="text-xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f0f0f] rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Profile Stats
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <span className="text-gray-300">Posts:</span>
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <span className="text-gray-300">Likes Received:</span>
                  <span className="text-2xl font-bold text-white">7</span>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <span className="text-gray-300">Comments:</span>
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <span className="text-gray-300">Registrations:</span>
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="mt-6 p-5 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
                <p className="text-sm text-gray-400 mb-2">Total Engagement</p>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  9
                </div>
                <p className="text-xs text-gray-500 mt-1">Interactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}