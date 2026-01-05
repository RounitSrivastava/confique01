"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Calendar, Users, Edit2, MapPin, Share2, X, Trash2, Check, Download, Copy, CheckCircle,
} from "lucide-react";

const presetAvatars = [
    "/ChatGPT Image Jan 5, 2026, 04_10_16 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_11_13 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_11_21 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_17_02 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_18_07 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_19_22 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_20_00 PM.png",
  "/ChatGPT Image Jan 5, 2026, 04_20_53 PM.png",

  
];

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg?w=200&h=200&fit=crop";

export default function TechProfilePage() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const [posts, setPosts] = useState([]);

  // ✅ NEW: Redirection handler to show event details
  const handleViewDetails = (postId) => {
    router.push(`/events?event=${postId}`, { scroll: true });
  };

  // ✅ Function to generate shareable profile link
  const getProfileLink = () => {
    if (typeof window === 'undefined') return '';
    
    const baseUrl = window.location.origin;
    const profileSlug = profile.name 
      ? profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'profile';
    
    return `${baseUrl}/profile/${profileSlug}-${profile.email.split('@')[0]}`;
  };

  // ✅ Share profile function
  const handleShareProfile = async () => {
    const profileLink = getProfileLink();
    const shareText = `Check out ${profile.name}'s profile on Confique!`;

    // Try Web Share API first (for mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: shareText,
          url: profileLink,
        });
        return;
      } catch (err) {
        console.log('Web Share cancelled or failed, falling back to clipboard');
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${profileLink}`);
      setCopied(true);
      
      // Show success message
      setTimeout(() => {
        setShowShareTooltip(true);
      }, 100);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowShareTooltip(false);
        setCopied(false);
      }, 3000);
      
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n\n${profileLink}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setShowShareTooltip(true);
      
      setTimeout(() => {
        setShowShareTooltip(false);
        setCopied(false);
      }, 3000);
    }
  };

  const fetchUserActivity = useCallback(async (userEmail, userName) => {
    try {
      const res = await fetch("/api/events", { method: "GET", cache: "no-store" });
      if (res.ok) {
        const allEvents = await res.json();
        
        const mappedEvents = allEvents.map(ev => ({
          id: ev._id,
          type: "event",
          title: ev.title,
          tagline: ev.tagline || "",
          category: ev.category || "Tech",
          image: ev.poster || ev.banner,
          displayDate: ev.date ? new Date(ev.date).toLocaleDateString() : "TBD",
          location: ev.venue,
          registrationsCount: ev.registrationsCount || 0,
          rawRegistrations: ev.registrations || [], 
          isHosted: ev.hostedBy?.trim().toLowerCase() === userName?.trim().toLowerCase(),
          isRegistered: ev.registrations?.some(reg => reg.userEmail === userEmail)
        }));

        setPosts(mappedEvents);
      }
    } catch (err) {
      console.error("Error fetching user activity:", err);
    }
  }, []);

  const downloadRegistrations = (event) => {
    if (!event.rawRegistrations || event.rawRegistrations.length === 0) {
      alert("No participants have registered for this event yet.");
      return;
    }

    const dynamicKeys = new Set();
    event.rawRegistrations.forEach(reg => {
        if (reg.formData) {
            Object.keys(reg.formData).forEach(key => dynamicKeys.add(key));
        }
    });

    const headers = ["User Email", "Registered On", ...Array.from(dynamicKeys)];

    const rows = event.rawRegistrations.map(reg => {
      const row = [
        reg.userEmail, 
        reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : "N/A"
      ];
      
      Array.from(dynamicKeys).forEach(key => {
        const value = reg.formData ? reg.formData[key] : "N/A";
        row.push(`"${String(value).replace(/"/g, '""')}"`);
      });
      
      return row.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Participants_${event.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            await fetchUserActivity(updatedProfile.email, updatedProfile.name);
            setLoading(false);
            return;
          }
        }
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
      ac.abort();
    };
  }, [router, fetchUserActivity]);

  const totalHostedEvents = posts.filter(p => p.isHosted).length;
  const totalRegisteredEvents = posts.filter((p) => p.isRegistered).length;

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
        const res = await fetch(`/api/events/${postId}`, { method: "DELETE" });
        if (res.ok) {
            setPosts((prev) => prev.filter((post) => post.id !== postId));
        } else {
            alert("Failed to delete event.");
        }
    } catch (err) {
        console.error(err);
    }
  };

  const openEditModal = () => {
    setEditForm(profile);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);
  
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        window.dispatchEvent(new CustomEvent("confique:user-updated", { detail: { user: data.user } }));
        setIsEditModalOpen(false);
        await fetchUserActivity(data.user.email, data.user.name);
      }
    } catch (err) {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditForm((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const selectPresetAvatar = (avatarUrl) => {
    setEditForm((prev) => ({ ...prev, avatar: avatarUrl }));
  };

  const openEventEditPage = (postId) => {
    router.push(`/events?view=host&edit=${postId}`, { scroll: true });
  };

  const displayedPosts = activeTab === "registered" 
    ? posts.filter((p) => p.isRegistered) 
    : posts.filter((p) => p.isHosted);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000000] via-[#2d163a] to-[#000000]">
        <p className="text-slate-200 text-sm italic tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main content with proper z-index */}
      <div className="min-h-screen bg-[#0d0d0d]">

        <div className="max-w-5xl mx-auto px-4 py-8">
          
          <div className="relative bg-black backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8 mb-6 shadow-xl text-white">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full">
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-slate-800" 
                  />
                </div>
                <button 
                  onClick={openEditModal} 
                  className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-colors z-20"
                >
                  <Edit2 className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="flex-1">
                <div className="mb-3">
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">{profile.name || "User"}</h2>
                  <p className="text-slate-400 text-sm mb-3">{profile.email}</p>
                  <p className="text-slate-300 text-base md:text-lg mb-3">{profile.bio || "Event host on Confique."}</p>
                  <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location || "Location"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="text-2xl md:text-3xl font-bold">{totalHostedEvents}</div>
                    <div className="text-slate-400 text-sm">Hosted</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="text-2xl md:text-3xl font-bold">{totalRegisteredEvents}</div>
                    <div className="text-slate-400 text-sm">Registered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Profile Button with Tooltip */}
          <div className="flex justify-center mb-6 relative">
            <button 
              onClick={handleShareProfile}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 relative group"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Share profile
                </>
              )}
            </button>
            
            {/* Tooltip */}
            {showShareTooltip && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm py-2 px-3 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Profile link copied to clipboard!
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45"></div>
              </div>
            )}
          </div>

          <div className="bg-black rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl mb-8">
            <div className="flex border-b border-slate-700/50">
              <button 
                onClick={() => setActiveTab("posts")} 
                className={`flex-1 py-4 px-4 md:px-6 font-semibold transition-colors relative ${activeTab === "posts" ? "text-purple-400" : "text-slate-400"}`}
              >
                <span className="text-sm md:text-base">
                  Hosted Events ({totalHostedEvents})
                </span>
                {activeTab === "posts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </button>

              <button 
                onClick={() => setActiveTab("registered")} 
                className={`flex-1 py-4 px-4 md:px-6 font-semibold transition-colors relative ${activeTab === "registered" ? "text-purple-400" : "text-slate-400"}`}
              >
                <span className="text-sm md:text-base">
                  Registered Events ({totalRegisteredEvents})
                </span>
                {activeTab === "registered" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              {displayedPosts.length > 0 ? (
                displayedPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => handleViewDetails(post.id)}
                    className="relative bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30 flex flex-col md:flex-row text-white cursor-pointer hover:bg-slate-700/50 transition-all group"
                  >
                    {activeTab === "posts" && (
                      <div 
                        className="absolute top-3 right-3 flex gap-2 z-30" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => openEventEditPage(post.id)} 
                          className="p-1.5 rounded-full bg-slate-900/80 border border-slate-600 hover:bg-slate-800" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)} 
                          className="p-1.5 rounded-full bg-red-500/80 border border-red-400 hover:bg-red-600" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="w-full md:w-48 h-48 relative flex-shrink-0">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-4 md:p-5">
                      <h3 className="text-lg md:text-xl font-bold mb-3">{post.title}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{post.displayDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <span>{post.location}</span>
                        </div>
                        
                        {activeTab === "posts" && (
                          <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
                            <Users className="w-4 h-4" />
                            <span>{post.registrationsCount} Registration(s)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {post.isRegistered && activeTab === "registered" ? (
                          <div className="px-4 md:px-6 py-2 rounded-lg font-semibold bg-green-600/20 text-green-400 border border-green-600/30 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Registered
                          </div>
                        ) : activeTab === "posts" && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadRegistrations(post);
                            }}
                            className="px-3 py-1.5 w-fit rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white border border-purple-500 flex items-center gap-2 transition-all shadow-lg"
                          >
                            <Download className="w-3.5 h-3.5" /> Download Participants
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-lg italic">{activeTab === "registered" ? "No joined events yet." : "No hosted events found."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal with high z-index */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 text-white">
          <div className="bg-[#1e293b] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 flex-shrink-0">
              <h3 className="text-2xl font-bold">Edit Profile</h3>
              <button onClick={closeEditModal}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4">
                <img 
                  src={editForm.avatar} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" 
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Choose a new avatar</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="text-xs w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-xl outline-none" 
                  />
                </div>
              </div>

              {/* Preset Avatars Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Or choose from preset avatars:</label>
                <div className="grid grid-cols-4 gap-3">
                  {presetAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPresetAvatar(avatar)}
                      className={`relative rounded-full overflow-hidden border-2 hover:border-purple-500 transition-all ${
                        editForm.avatar === avatar ? 'border-purple-500' : 'border-slate-600'
                      }`}
                    >
                      <img 
                        src={avatar} 
                        alt={`Avatar ${index + 1}`} 
                        className="w-full h-full object-cover aspect-square"
                      />
                      {editForm.avatar === avatar && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                  className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl outline-none" 
                  placeholder="Your name" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Bio</label>
                <textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} 
                  rows={3} 
                  className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl outline-none resize-none" 
                  placeholder="Tell us about yourself" 
                />
              </div>
            </div>
            
            {/* Save Button - Responsive sizing for mobile */}
            <div className="flex justify-center p-6 border-t border-slate-700/50 mt-auto">
              <button 
  onClick={handleSaveProfile} 
  disabled={saving} 
  className="px-6 py-2 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm w-auto"
>
  {saving ? "Saving..." : "Save"}
</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}