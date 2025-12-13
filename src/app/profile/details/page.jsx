// components/TechProfilePage.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, Heart, MessageSquare, Users, Edit2, MapPin, Clock, Share2, X, Trash2, Check,
} from "lucide-react";

// ... (presetAvatars and DEFAULT_AVATAR definitions remain unchanged)
const presetAvatars = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
];

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg?w=200&h=200&fit=crop";

export default function TechProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isEventEditModalOpen, setIsEventEditModalOpen] = useState(false);
  const [eventEditForm, setEventEditForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatar: DEFAULT_AVATAR,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatar: DEFAULT_AVATAR,
  });

  const [posts, setPosts] = useState([
    // ... (posts data remains unchanged)
    {
      id: 1,
      type: "event",
      title: "Innovate & Create: Our Annual Hackathon",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
      date: "Dec 15, 2025",
      time: "9:00 AM - 6:00 PM",
      location: "Tech Hub, Downtown",
      registrations: 87,
      likes: 234,
      comments: 45,
      isRegistered: false,
    },
    {
      id: 2,
      type: "event",
      title: "College Career Fair: Meet Top Companies",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      date: "Dec 20, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Convention Center",
      registrations: 156,
      likes: 189,
      comments: 32,
      isRegistered: true,
    },
    {
      id: 3,
      type: "event",
      title: "Guest Lecture: The Future of AI",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
      date: "Dec 10, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Virtual Event",
      registrations: 312,
      likes: 421,
      comments: 78,
      isRegistered: true,
    },
  ]);

  const totalHostedEvents = posts.length;
  const totalRegisteredEvents = posts.filter((p) => p.isRegistered).length;
  const totalRegistrations = posts.reduce(
    (sum, p) => sum + (p.registrations || 0),
    0
  );
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);

  // ... (useEffect for profile load remains unchanged)
  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();

    async function loadProfile() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: ac.signal,
        });

        if (!mounted) return;

        if (res.status === 401 || res.status === 403) {
          setLoading(false);
          router.replace("/auth/login?from=profile");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const user = data.user;

            const name =
              user.name || user.fullName || user.username || "";

            const updatedProfile = {
              name,
              email: user.email || user.emailId || "",
              bio: user.bio || "",
              location: user.location || "",
              website: user.website || "",
              avatar: user.avatar || DEFAULT_AVATAR,
            };

            setProfile(updatedProfile);
            setEditForm(updatedProfile);
            setLoading(false);
            return;
          }
        } else {
          console.error("Profile /api/me status:", res.status);
        }

        // fallback localStorage
        try {
          if (typeof window !== "undefined") {
            const lsName = localStorage.getItem("userName") || "";
            const lsEmail = localStorage.getItem("userEmail") || "";
            const lsAvatar = localStorage.getItem("userAvatar") || "";

            if (lsName || lsEmail) {
              const updatedProfile = {
                name: lsName || "",
                email: lsEmail || "",
                bio: "",
                location: "",
                website: "",
                avatar: lsAvatar || DEFAULT_AVATAR,
              };
              setProfile(updatedProfile);
              setEditForm(updatedProfile);
            }
          }
        } catch (e) {
          console.warn("LocalStorage fallback failed:", e);
        }

        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Profile load error:", err);

        // network error → still try localStorage
        try {
          if (typeof window !== "undefined") {
            const lsName = localStorage.getItem("userName") || "";
            const lsEmail = localStorage.getItem("userEmail") || "";
            const lsAvatar = localStorage.getItem("userAvatar") || "";

            if (lsName || lsEmail) {
              const updatedProfile = {
                name: lsName || "",
                email: lsEmail || "",
                bio: "",
                location: "",
                website: "",
                avatar: lsAvatar || DEFAULT_AVATAR,
              };
              setProfile(updatedProfile);
              setEditForm(updatedProfile);
            }
          }
        } catch (e) {
          console.warn("LocalStorage fallback failed:", e);
        }

        setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
      ac.abort();
    };
  }, [router]);

  // ... (handleRegister, handleLike, handleDeletePost, openEditModal, closeEditModal logic remains unchanged)

  const handleRegister = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isRegistered: !post.isRegistered,
              registrations: post.isRegistered
                ? Math.max(0, (post.registrations || 0) - 1)
                : (post.registrations || 0) + 1,
            }
          : post
      )
    );
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleDeletePost = (postId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event from your profile?"
      )
    ) {
      return;
    }
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const openEditModal = () => {
    setEditForm(profile);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };
  
  // ✅ SAVE to DB via /api/me (PATCH) - Updated to handle server validation errors
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          avatar: editForm.avatar, // can be preset URL or base64
        }),
      });

      if (!res.ok) {
        console.error("Profile update failed with status", res.status);
        
        // Attempt to parse validation error from server for user display
        const errorData = await res.json().catch(() => ({ error: 'Failed to save profile. Please try again.' }));
        alert(errorData.error || `Failed to save profile (Status: ${res.status}).`);
        
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (data?.user) {
        const user = data.user;
        const updatedProfile = {
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          location: user.location || "",
          website: user.website || "",
          avatar: user.avatar || DEFAULT_AVATAR,
        };

        setProfile(updatedProfile);
        setEditForm(updatedProfile);

        // also cache to localStorage
        try {
          if (typeof window !== "undefined") {
            if (editForm.email) {
              localStorage.setItem("userEmail", editForm.email);
            }
            if (editForm.name) {
              localStorage.setItem("userName", editForm.name);
            }
            if (editForm.avatar) {
              localStorage.setItem("userAvatar", editForm.avatar);
            }

            // 🔑 FIX: Dispatch a CustomEvent with the user data for other components (e.g., Topbar)
            window.dispatchEvent(
              new CustomEvent("confique:user-updated", {
                detail: { user: updatedProfile }, 
              })
            );
          }
        } catch {}

        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Use FileReader + base64 instead of createObjectURL + Added file size check
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const MAX_FILE_SIZE_MB = 1; // Limit file size to 1MB
    
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`);
      e.target.value = null; // Clear the input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result is a data URL: "data:image/png;base64,...."
      setEditForm((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const openEventEditModal = (post) => {
    setEventEditForm({ ...post });
    setIsEventEditModalOpen(true);
  };

  const closeEventEditModal = () => {
    setIsEventEditModalOpen(false);
    setEventEditForm(null);
  };

  const handleSaveEvent = () => {
    if (!eventEditForm) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === eventEditForm.id ? { ...p, ...eventEditForm } : p
      )
    );
    closeEventEditModal();
  };

  const displayedPosts =
    activeTab === "registered" ? posts.filter((p) => p.isRegistered) : posts;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <p className="text-slate-200 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d0d0d" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-black-600 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6">
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
                <h2 className="text-3xl font-bold text-white mb-1">
                  {profile.name || "Your Name"}
                </h2>
                <p className="text-slate-400 text-sm mb-3">{profile.email}</p>
                <p className="text-slate-300 text-lg mb-3">
                  {profile.bio || "Add a short bio about yourself."}
                </p>
                <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location || "Add your role/location"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🌐</span>
                    <a
                      href={profile.website || "#"}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {profile.website || "Add your website / portfolio"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Dynamic Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {totalHostedEvents}
                  </div>
                  <div className="text-slate-400 text-sm">Hosted Events</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {totalRegistrations}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Total Registrations
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {totalLikes}
                  </div>
                  <div className="text-slate-400 text-sm">Total Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-3">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share profile
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-black-600 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === "posts"
                  ? "text-purple-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Hosted Events ({totalHostedEvents})
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("registered")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors relative ${
                activeTab === "registered"
                  ? "text-purple-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Registered Events ({totalRegisteredEvents})
              {activeTab === "registered" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          </div>

          {/* Posts List */}
          <div className="p-6 space-y-4">
            {displayedPosts.length > 0 ? (
              posts
                .filter((p) =>
                  activeTab === "registered" ? p.isRegistered : true
                )
                .map((post) => (
                  <div
                    key={post.id}
                    className="relative bg-slate-700/30 rounded-xl overflow-hidden hover:bg-slate-700/40 transition-all border border-slate-600/30"
                  >
                    {/* TOP RIGHT EDIT + DELETE */}
                    {activeTab === "posts" && (
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          onClick={() => openEventEditModal(post)}
                          className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-100" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 border border-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        {post.isRegistered && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Registered
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5">
                        <h3 className="text-xl font-bold text-white mb-3">
                          {post.title}
                        </h3>

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

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="flex items-center gap-1 text-slate-400 text-sm">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold text-white">
                              {post.registrations}
                            </span>{" "}
                            registered
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-sm">
                            <Heart className="w-4 h-4" />
                            <span className="font-semibold text-white">
                              {post.likes}
                            </span>{" "}
                            likes
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-sm">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-semibold text-white">
                              {post.comments}
                            </span>{" "}
                            comments
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleRegister(post.id)}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                              post.isRegistered
                                ? "bg-slate-600 hover:bg-slate-500 text-white"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                          >
                            {post.isRegistered ? "Unregister" : "Register"}
                          </button>

                          <button
                            onClick={() => handleLike(post.id)}
                            className="p-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg transition-colors"
                          >
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
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">
                  {activeTab === "registered"
                    ? "No registered events yet"
                    : "No posts yet"}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Engage to see items here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 flex-shrink-0">
              <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-slate-700/50 rounded transition-colors"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-slate-300" />
              </button>
            </div>

            {/* Content (scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Avatar preview + upload + preset avatars */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={editForm.avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300">
                      Change profile photo (Max 1MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="text-sm text-slate-200"
                    />
                  </div>
                </div>

                {/* Preset avatar choices */}
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Or choose an avatar</p>
                  <div className="grid grid-cols-4 gap-3">
                    {presetAvatars.map((url) => {
                      const isSelected = editForm.avatar === url;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() =>
                            setEditForm((prev) => ({ ...prev, avatar: url }))
                          }
                          className={`relative rounded-full p-1 border-2 transition-all ${
                            isSelected
                              ? "border-purple-500 ring-2 ring-purple-500/40"
                              : "border-transparent hover:border-slate-500"
                          }`}
                        >
                          <img
                            src={url}
                            alt="Avatar option"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute -right-1 -bottom-1 bg-purple-600 rounded-full p-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email (cannot be changed)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Role / location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Tech Enthusiast & Event Organizer"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors resize-none"
                  placeholder="Digital creator exploring tech one event at a time."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 flex-shrink-0">
              <button
                onClick={closeEditModal}
                className="flex-1 px-6 py-3.5 bg-purple-600 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors border border-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 px-6 py-3.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-black rounded-xl font-medium transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEventEditModalOpen && eventEditForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 flex-shrink-0">
              <h3 className="text-2xl font-bold text-white">Edit Event</h3>
              <button
                onClick={closeEventEditModal}
                className="p-1 hover:bg-slate-700/50 rounded transition-colors"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-slate-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventEditForm.title}
                  onChange={(e) =>
                    setEventEditForm({
                      ...eventEditForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Enter event title"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={eventEditForm.date}
                  onChange={(e) =>
                    setEventEditForm({
                      ...eventEditForm,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Dec 15, 2025"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Time
                </label>
                <input
                  type="text"
                  value={eventEditForm.time}
                  onChange={(e) =>
                    setEventEditForm({
                      ...eventEditForm,
                      time: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={eventEditForm.location}
                  onChange={(e) =>
                    setEventEditForm({
                      ...eventEditForm,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="Tech Hub, Downtown"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={eventEditForm.image}
                  onChange={(e) =>
                    setEventEditForm({
                      ...eventEditForm,
                      image: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 flex-shrink-0">
              <button
                onClick={closeEventEditModal}
                className="flex-1 px-6 py-3.5 bg-purple-600 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors border border-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
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
<<<<<<< HEAD
}
























































































































=======
}
>>>>>>> 39af29c709d81c8c8c95d45056ab76b415314cd1
