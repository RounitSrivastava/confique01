"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Calendar, Users, Edit2, MapPin, Share2, X, Trash2, Check, Download, Copy, CheckCircle,
} from "lucide-react";

// --- AUTH HELPER ---
const fetchMeData = async () => {
    try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return { user: null };
        return await res.json();
    } catch (e) {
        return { user: null };
    }
};

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

const DEFAULT_AVATAR = "https://img.freepik.com/premium-photo/portrait-successful-business-woman-suit-gray-isolated-background-serious-office-female-worker-manager-employees-female-employee-young-secretary_545934-23090.jpg?w=200&h=200&fit=crop";

// 1️⃣ UI COMPONENT
const ProfileContent = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  const [profile, setProfile] = useState({
    name: "", email: "", bio: "", location: "", website: "", avatar: DEFAULT_AVATAR,
  });

  const [editForm, setEditForm] = useState({
    name: "", email: "", bio: "", location: "", website: "", avatar: DEFAULT_AVATAR,
  });

  const [posts, setPosts] = useState([]);

  const handleViewDetails = (postId) => {
    router.push(`/events?event=${postId}`, { scroll: true });
  };

  const getProfileLink = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    const profileSlug = profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'profile';
    return `${baseUrl}/profile/${profileSlug}-${profile.email.split('@')[0]}`;
  };

  const handleShareProfile = async () => {
    const profileLink = getProfileLink();
    const shareText = `Check out ${profile.name}'s profile on Confique!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile.name}'s Profile`, text: shareText, url: profileLink });
        return;
      } catch (err) {}
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${profileLink}`);
      setCopied(true);
      setShowShareTooltip(true);
      setTimeout(() => { setShowShareTooltip(false); setCopied(false); }, 3000);
    } catch (err) {}
  };

  // Logic to process events
  const processEvents = useCallback((allEvents, userEmail, userName) => {
    return allEvents.map(ev => ({
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
  }, []);

  const downloadRegistrations = (event) => {
    if (!event.rawRegistrations || event.rawRegistrations.length === 0) {
      alert("No participants registered.");
      return;
    }
    const dynamicKeys = new Set();
    event.rawRegistrations.forEach(reg => { if (reg.formData) Object.keys(reg.formData).forEach(k => dynamicKeys.add(k)); });
    const headers = ["Email", "Date", ...Array.from(dynamicKeys)];
    const rows = event.rawRegistrations.map(reg => {
      const row = [reg.userEmail, reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : "N/A"];
      Array.from(dynamicKeys).forEach(key => row.push(`"${String(reg.formData?.[key] || "N/A").replace(/"/g, '""')}"`));
      return row.join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Participants_${event.title}.csv`;
    link.click();
  };

  // ⚡ SPEED BOOST: Parallel Fetching
  useEffect(() => {
    let mounted = true;
    async function loadAllData() {
      // Fetch user and events at the same time
      const [userData, eventsRes] = await Promise.all([
        fetchMeData(),
        fetch("/api/events", { method: "GET", cache: "no-store" })
      ]);

      if (!mounted || !userData?.user) return;

      const user = userData.user;
      const up = {
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar: user.avatar || DEFAULT_AVATAR,
      };

      setProfile(up);
      setEditForm(up);

      if (eventsRes.ok) {
        const allEvents = await eventsRes.json();
        setPosts(processEvents(allEvents, up.email, up.name));
      }
      setLoading(false);
    }
    loadAllData();
    return () => { mounted = false; };
  }, [processEvents]);

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
        const eventsRes = await fetch("/api/events");
        if (eventsRes.ok) {
           const allEvents = await eventsRes.json();
           setPosts(processEvents(allEvents, data.user.email, data.user.name));
        }
      }
    } catch (err) { alert("Error saving."); } finally { setSaving(false); }
  };

  const displayedPosts = activeTab === "registered" ? posts.filter((p) => p.isRegistered) : posts.filter((p) => p.isHosted);
  const totalHostedEvents = posts.filter(p => p.isHosted).length;
  const totalRegisteredEvents = posts.filter((p) => p.isRegistered).length;

  if (loading) return null;

  return (
    <>
      <div className="min-h-screen bg-[#0d0d0d] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="relative bg-black backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover border-4 border-slate-800" />
                </div>
                <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-colors z-20">
                  <Edit2 className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{profile.name || "User"}</h2>
                <p className="text-slate-400 text-sm mb-3">{profile.email}</p>
                <p className="text-slate-300 mb-3">{profile.bio || "Event host on Confique."}</p>
                <div className="flex items-center gap-1 text-slate-400 text-sm"><MapPin className="w-4 h-4" /><span>{profile.location || "Location"}</span></div>
                <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                  <div className="bg-slate-700/30 rounded-xl p-4"><div className="text-2xl font-bold">{totalHostedEvents}</div><div className="text-slate-400 text-sm">Hosted</div></div>
                  <div className="bg-slate-700/30 rounded-xl p-4"><div className="text-2xl font-bold">{totalRegisteredEvents}</div><div className="text-slate-400 text-sm">Registered</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6 relative">
            <button onClick={handleShareProfile} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? "Copied!" : "Share profile"}
            </button>
            {showShareTooltip && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm py-2 px-3 rounded-lg shadow-lg z-50">
                Profile link copied!
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45"></div>
              </div>
            )}
          </div>

          <div className="bg-black rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl mb-8">
            <div className="flex border-b border-slate-700/50">
              <button onClick={() => setActiveTab("posts")} className={`flex-1 py-4 font-semibold relative ${activeTab === "posts" ? "text-purple-400" : "text-slate-400"}`}>
                Hosted ({totalHostedEvents}) {activeTab === "posts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </button>
              <button onClick={() => setActiveTab("registered")} className={`flex-1 py-4 font-semibold relative ${activeTab === "registered" ? "text-purple-400" : "text-slate-400"}`}>
                Registered ({totalRegisteredEvents}) {activeTab === "registered" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {displayedPosts.length > 0 ? displayedPosts.map((post) => (
                <div key={post.id} onClick={() => handleViewDetails(post.id)} className="relative bg-slate-700/30 rounded-xl overflow-hidden border border-slate-600/30 flex flex-col md:flex-row cursor-pointer hover:bg-slate-700/50 transition-all">
                  {activeTab === "posts" && (
                    <div className="absolute top-3 right-3 flex gap-2 z-30" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => router.push(`/events?view=host&edit=${post.id}`)} className="p-1.5 rounded-full bg-slate-900/80 border border-slate-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async (e) => { 
                        e.stopPropagation(); 
                        if(confirm("Delete?")) {
                          const res = await fetch(`/api/events/${post.id}`, { method: "DELETE" });
                          if(res.ok) setPosts(p => p.filter(x => x.id !== post.id));
                        }
                      }} className="p-1.5 rounded-full bg-red-500/80 border border-red-400 hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                  <div className="w-full md:w-48 h-48 flex-shrink-0"><img src={post.image} alt={post.title} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 p-4 md:p-5">
                    <h3 className="text-lg md:text-xl font-bold mb-3">{post.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-300 text-sm"><Calendar className="w-4 h-4 text-blue-400" /><span>{post.displayDate}</span></div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm"><MapPin className="w-4 h-4 text-blue-400" /><span>{post.location}</span></div>
                      {activeTab === "posts" && <div className="flex items-center gap-2 text-purple-400 text-sm font-bold"><Users className="w-4 h-4" /><span>{post.registrationsCount} Registration(s)</span></div>}
                    </div>
                    {activeTab === "posts" && <button onClick={(e) => { e.stopPropagation(); downloadRegistrations(post); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white flex items-center gap-2 shadow-lg"><Download className="w-3.5 h-3.5" /> Participants</button>}
                  </div>
                </div>
              )) : <div className="text-center py-12 text-slate-400 italic text-lg">{activeTab === "registered" ? "No joined events yet." : "No hosted events found."}</div>}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 text-white">
          <div className="bg-[#1e293b] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <h3 className="text-2xl font-bold">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4">
                <img src={editForm.avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />
                <div><label className="block text-sm font-medium mb-2">New Avatar</label><input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditForm(p => ({ ...p, avatar: reader.result }));
                    reader.readAsDataURL(file);
                  }
                }} className="text-xs w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-xl" /></div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Preset Avatars</label>
                <div className="grid grid-cols-4 gap-3">
                  {presetAvatars.map((avatar, idx) => (
                    <button key={idx} type="button" onClick={() => setEditForm(p => ({ ...p, avatar }))} className={`relative rounded-full overflow-hidden border-2 ${editForm.avatar === avatar ? 'border-purple-500' : 'border-slate-600'}`}>
                      <img src={avatar} alt="preset" className="w-full aspect-square object-cover" />
                      {editForm.avatar === avatar && <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3"><label className="block text-sm font-medium">Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl outline-none" /></div>
              <div className="space-y-3"><label className="block text-sm font-medium">Bio</label><textarea value={editForm.bio} onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl resize-none" /></div>
            </div>
            <div className="flex justify-center p-6 border-t border-slate-700/50">
              <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2 bg-purple-500 text-black font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 2️⃣ SECURITY WRAPPER
export default function TechProfilePage() {
  // ⚡ SPEED FIX: Check localStorage hint for instant render if possible
  const [authLoading, setAuthLoading] = useState(() => {
    if (typeof window !== 'undefined') return !localStorage.getItem("confique_auth_hint");
    return true;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const data = await fetchMeData();
      if (!data?.user) {
        localStorage.removeItem("confique_auth_hint");
        router.replace("/auth/login?from=profile");
        return;
      }
      localStorage.setItem("confique_auth_hint", "true");
      setIsAuthenticated(true);
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  // If hint exists, show content immediately. Middleware/API handles real security.
  if (authLoading && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0d0d0d] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium tracking-wide animate-pulse"></p>
        </div>
      </div>
    );
  }

  return <ProfileContent />;
}