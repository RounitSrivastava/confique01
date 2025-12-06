'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Heart,
  MessageSquare,
  Users,
  Edit2,
  Plus,
  MapPin,
  Clock,
  Share2,
  X
} from 'lucide-react';

export default function TechProfilePage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Vaidehi Sharma',
    bio: 'XYZ',
    location: 'XYZ',
    website: 'XYZ',
    totalPosts: 128,
    totalLikes: 1200,
    totalComments: 345,
    avatar:
      'https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg?w=200&h=200&fit=crop'
  });

  const [editForm, setEditForm] = useState(profile);

  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'event',
      title: 'Innovate & Create: Our Annual Hackathon',
      image:
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
      date: 'Dec 15, 2025',
      time: '9:00 AM - 6:00 PM',
      location: 'Tech Hub, Downtown',
      registrations: 87,
      likes: 234,
      comments: 45,
      isRegistered: false
    },
    {
      id: 2,
      type: 'event',
      title: 'College Career Fair: Meet Top Companies',
      image:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      date: 'Dec 20, 2025',
      time: '10:00 AM - 4:00 PM',
      location: 'Convention Center',
      registrations: 156,
      likes: 189,
      comments: 32,
      isRegistered: true
    },
    {
      id: 3,
      type: 'event',
      title: 'Guest Lecture: The Future of AI',
      image:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      date: 'Dec 10, 2025',
      time: '2:00 PM - 4:00 PM',
      location: 'Virtual Event',
      registrations: 312,
      likes: 421,
      comments: 78,
      isRegistered: true
    }
  ]);

  // Community posts state (converted from your static HTML examples)
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 'c1',
      authorName: 'Sarah Chen',
      authorAvatar: 'https://i.pravatar.cc/150?img=5',
      timeAgo: '2 hours ago',
      category: 'Tech',
      title: 'Just built my first AI chatbot using GPT-4!',
      content:
        'After weeks of learning, I finally deployed my first AI-powered customer service bot. The journey was challenging but incredibly rewarding. Would love to hear your thoughts!',
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      likes: 342,
      comments: 67
    },
    {
      id: 'c2',
      authorName: 'Maya Rodriguez',
      authorAvatar: 'https://i.pravatar.cc/150?img=9',
      timeAgo: '5 hours ago',
      category: 'Fashion',
      title: 'Sustainable Fashion Collection 2025',
      content:
        'Excited to share my latest eco-friendly fashion designs! Made entirely from recycled materials and natural dyes. Fashion can be beautiful AND sustainable! 🌿',
      image:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop',
      likes: 892,
      comments: 134
    },
    {
      id: 'c3',
      authorName: 'Alex Kim',
      authorAvatar: 'https://i.pravatar.cc/150?img=12',
      timeAgo: '1 day ago',
      category: 'Gaming',
      title: 'Finally hit Diamond rank in Valorant!',
      content:
        'After 6 months of grinding, I made it to Diamond! Here are my top 5 tips for climbing the ranks. Drop your rank below and let\'s squad up!',
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      likes: 567,
      comments: 89
    }
  ]);

  const handleRegister = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isRegistered: !post.isRegistered,
              registrations: post.isRegistered
                ? post.registrations - 1
                : post.registrations + 1
            }
          : post
      )
    );
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
    );
  };

  // Community like/comment handlers
  const handleLikeCommunity = (id) => {
    setCommunityPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  const handleCommentCommunity = (id) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, comments: p.comments + 1 } : p))
    );
  };

  const openEditModal = () => {
    setEditForm(profile);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditModalOpen(false);
  };

  // Choose which posts to display based on active tab
  const displayedPosts =
    activeTab === 'registered'
      ? posts.filter((p) => p.isRegistered)
      : activeTab === 'community'
      ? communityPosts
      : posts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 p-1">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-slate-800"
                />
              </div>
              <div className="relative group">
                <button
                  onClick={openEditModal}
                  className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Edit Profile
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-3">
                <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
                <p className="text-slate-300 text-lg mb-3">{profile.bio}</p>
                <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🌐</span>
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      {profile.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{profile.totalPosts}</div>
                  <div className="text-slate-400 text-sm">Posts</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {profile.totalLikes.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">Likes</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{profile.totalComments}</div>
                  <div className="text-slate-400 text-sm">Comments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-3">
          {/* Make the button smaller and centered by removing flex-1 and using inline padding */}
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share profile
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'posts' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              All Posts
              {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'community' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Community Posts
              {activeTab === 'community' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === 'registered' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Registered Events
              {activeTab === 'registered' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          </div>

          {/* Posts List */}
          <div className="p-6 space-y-4">
            {displayedPosts.length > 0 ? (
              // If community tab — render community-style cards, else render event cards
              activeTab === 'community' ? (
                communityPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-slate-700/30 rounded-xl overflow-hidden hover:bg-slate-700/40 transition-all border border-slate-600/30 p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{post.authorName}</h4>
                        <p className="text-slate-400 text-sm">{post.timeAgo}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <p className="text-slate-300 mb-4">{post.content}</p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                      <div className="flex gap-6">
                        <button
                          onClick={() => handleLikeCommunity(post.id)}
                          className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                          <span className="font-semibold text-white">{post.likes}</span>
                        </button>

                        <button
                          onClick={() => handleCommentCommunity(post.id)}
                          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="font-semibold text-white">{post.comments}</span>
                        </button>
                      </div>

                      <button className="text-slate-400 hover:text-slate-300 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // Event/regular posts rendering (your existing structure)
                posts
                  .filter((p) => (activeTab === 'registered' ? p.isRegistered : true))
                  .map((post) => (
                    <div
                      key={post.id}
                      className="bg-slate-700/30 rounded-xl overflow-hidden hover:bg-slate-700/40 transition-all border border-slate-600/30"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          {post.isRegistered && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              Registered
                            </div>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 p-5">
                          <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span>{post.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                              <MapPin className="w-4 h-4 text-blue-400" />
                              <span>{post.location}</span>
                            </div>
                          </div>

                          {/* Engagement Stats */}
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold text-white">{post.registrations}</span> registered
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                              <Heart className="w-4 h-4" />
                              <span className="font-semibold text-white">{post.likes}</span> likes
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span className="font-semibold text-white">{post.comments}</span> comments
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleRegister(post.id)}
                              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                post.isRegistered ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                            >
                              {post.isRegistered ? 'Unregister' : 'Register'}
                            </button>
                            <button onClick={() => handleLike(post.id)} className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg transition-colors">
                              <Heart className="w-5 h-5 text-slate-300" />
                            </button>
                            <button className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg transition-colors">
                              <MessageSquare className="w-5 h-5 text-slate-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">
                  {activeTab === 'registered' ? 'No registered events yet' : 'No posts yet'}
                </p>
                <p className="text-slate-500 text-sm mt-2">Engage to see items here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
              <button onClick={closeEditModal} className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                <X className="w-6 h-6 text-slate-400 hover:text-slate-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Role</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Tech Enthusiast & Event Organizer"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors resize-none"
                  placeholder="Digital creator exploring tech one event at a time."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6">
              <button
                onClick={closeEditModal}
                className="flex-1 px-6 py-3.5 bg-purple-600 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors border border-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-6 py-3.5 bg-purple-500 hover:bg-purple-600 text-black rounded-xl font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
