// /groups/ExplorePage.jsx
"use client";

import React from "react";
import { Search, ChevronRight, Plus, X, Upload, Trash2, Edit, Image, MoreVertical } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// --- CONSTANTS ---
const SITE_OWNER_EMAIL = "confique01@gmail.com";
const INITIAL_DISPLAY_LIMIT = 5;
const JOINED_DISPLAY_LIMIT = 3;

const categories = [
    "For You",
    "Tech",
    "Entrepreneurship",
    "Gaming",
    "Sports",
    "Music",
    "Art",
];

// --- HELPERS (kept as is) ---
const getCurrentUserEmail = () => {
    if (typeof window === "undefined") return null;
    try {
        return localStorage.getItem("userEmail") || null;
    } catch {
        return null;
    }
};

const apiFetch = (url, opts = {}) => {
    return fetch(url, {
        credentials: "include",
        cache: "no-store",
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(opts.headers || {}),
        },
    });
};

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = (err) => reject(err);
        fr.readAsDataURL(file);
    });
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

const validateImage = (file) => {
  if (!file) return false;

  if (!file.type.startsWith("image/")) {
    alert("Only image files are allowed.");
    return false;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    alert("Image too large. Max allowed size is 3 MB.");
    return false;
  }

  return true;
};

    // --- GRADIENT HELPERS ---
// --- PROFESSIONAL GRADIENTS (SUBTLE & PREMIUM) ---
// --- PROFESSIONAL 2-COLOR GRADIENTS (TAILWIND SAFE) ---
// --- IMAGE-STYLE SOFT GRADIENTS (TAILWIND SAFE) ---
const PROFESSIONAL_GRADIENTS = [
  "from-purple-600 to-violet-400", // purple → light violet (main image)
  "from-orange-500 to-amber-400",  // orange → yellow
  "from-sky-500 to-cyan-400",      // blue → cyan
  "from-fuchsia-600 to-purple-500",// vibrant purple
  "from-indigo-500 to-sky-400",    // indigo → light blue
  "from-rose-500 to-orange-400",   // pink → orange
];

// --- NEW HELPER: Fetch user data with groups (CRITICAL FIX FOR BACKEND FIELDS) ---
const fetchMeData = async () => {
    try {
        const res = await apiFetch("/api/me");
        
        // 🛡️ FIX: If the response is 401 (or any non-200), return user: null
        // This triggers the redirect logic in the Wrapper below.
        if (!res.ok) {
            console.error("Session invalid or failed to fetch user data");
            return { user: null, created: [], joined: [] };
        }
        
        const data = await res.json();
        const user = data.user;
        
        if (!user) return { user: null, created: [], joined: [] };

        const created = user.createdGroups || []; 
        const joined = user.joinedGroups || []; 
        
        const allUserGroupsMap = new Map();
        [...created, ...joined].forEach(group => {
            allUserGroupsMap.set(group.id, group);
        });
        const allUserGroups = [...allUserGroupsMap.values()];

        if (typeof window !== "undefined") {
            localStorage.setItem("userEmail", user.email);
        }

        return { 
            user, 
            created: created, 
            joined: allUserGroups 
        };
        
    } catch (e) {
        console.error("fetchMeData error:", e);
        return { user: null, created: [], joined: [] };
    }
};
// --- UI SUBCOMPONENTS (Updated with Admin Menu) ---
const CategoryPill = ({ name, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm rounded-full whitespace-nowrap transition-all duration-200
      ${
        isSelected
          ? "bg-purple-600 text-white shadow-[0_0_0_1px_rgba(168,85,247,0.6)]"
          : "bg-[#1f1f1f] text-gray-300 border border-white/10 hover:bg-[#2a2a2a] hover:text-white"
      }
    `}
  >
    {name}
  </button>
);


const TrendingCard = ({ community, gradient, onNavigate, isJoined, onJoin }) => {
  const logo = community.iconUrl || community.icon;

  return (
  <div
  onClick={() => isJoined && onNavigate(community)}
  className="w-40 min-h-[190px] flex-shrink-0 rounded-xl overflow-hidden bg-black-900 border border-white/8 relative"
>
      {/* COVER IMAGE */}
      <div className="w-full h-28 bg-gray-800 overflow-hidden">
        {logo ? (
          <img
            src={logo}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl font-bold`}
          >
            {community.name?.charAt(0)}
          </div>
        )}
      </div>

      {/* TEXT */}
            {/* TEXT */}
      <div className="p-3 text-white">
        <p className="font-semibold text-sm truncate">
          {community.name}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {community.membersCount || 0} members
        </p>
      </div>

      {/* JOIN / JOINED */}
      <div className="absolute bottom-3 right-3 z-10">
        {isJoined ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-black">
            Joined
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(community);
            }}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700">
            Join
          </button>
        )}
      </div>
    </div>
  );
};

// --- ADMIN MENU COMPONENT ---
const AdminMenu = ({ 
    community, 
    onEdit, 
    onEditMedia, 
    onDelete,
    onClose 
}) => {
    const menuRef = React.useRef(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="absolute right-0 top-8 z-10 w-48 bg-[#121212] border border-gray-700 rounded-lg shadow-xl"
        >
            <div className="py-1">
                <button
                    onClick={() => {
                        onEdit();
                        onClose();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Community
                </button>
                
                <button
                    onClick={() => {
                        onEditMedia();
                        onClose();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <Image className="w-4 h-4 mr-2" />
                    Edit Logo & Banner
                </button>
                
                <button
                    onClick={() => {
                        onDelete();
                        onClose();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Community
                </button>
            </div>
        </div>
    );
};

const RecommendedItem = ({
    community,
    isJoined,
    onJoin,
    onNavigate,
    canDelete,
    onDelete,
    onEdit,
    onEditMedia,
}) => {
    const displayIconUrl = community.iconUrl || community.icon;
    const [showAdminMenu, setShowAdminMenu] = React.useState(false);

    return (
  <div
    className={`flex items-center justify-between py-3 border-b border-gray-700
      rounded-xl px-3 transition-all
      ${
        isJoined
          ? "cursor-pointer hover:ring-1 hover:ring-purple-500/40 hover:bg-white/[0.02]"
          : "cursor-default"
      }
    `}
  >
    {/* LEFT – CLICKABLE CONTENT */}
    <div
      className="flex items-center flex-grow pr-4"
      onClick={() => isJoined && onNavigate(community)}
    >
      <div className="w-12 h-12 rounded-md mr-3 bg-gray-700 flex items-center justify-center text-lg font-bold overflow-hidden">
        {displayIconUrl ? (
          <img
            src={displayIconUrl}
            className="w-full h-full object-cover rounded-md"
            alt={community.name}
          />
        ) : (
          community.name?.charAt(0) || "?"
        )}
      </div>

      <div>
        <p className="font-medium text-white">{community.name}</p>
        <p className="text-sm text-gray-400 line-clamp-1">
          {community.description}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {community.membersCount || 0} members
        </p>

        {community.createdByCurrentUser && (
          <p className="text-xs text-amber-400 font-semibold mt-1">
            ⭐ You're the admin
          </p>
        )}

        {community.category && (
          <p className="text-xs text-gray-400 mt-1">
            Category: {community.category}
          </p>
        )}
      </div>
    </div>

    {/* RIGHT – ACTIONS */}
    <div className="flex items-center gap-2">
      {!isJoined && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-full text-sm"
        >
          Join
        </button>
      )}

      {isJoined && (
        <button
          className="bg-white text-black py-1.5 px-4 rounded-full text-sm"
          disabled
        >
          Joined
        </button>
      )}

      {canDelete && community.createdByCurrentUser && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAdminMenu(!showAdminMenu);
            }}
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showAdminMenu && (
            <AdminMenu
              community={community}
              onEdit={() => onEdit(community)}
              onEditMedia={() => onEditMedia(community)}
              onDelete={() => onDelete(community)}
              onClose={() => setShowAdminMenu(false)}
            />
          )}
        </div>
      )}
    </div>
  </div>
);
};

// --- MODIFIED: Wrapper for data fetching (FIXED NAVIGATION) ---
export default function ExplorePageWrapper() {
    const [loading, setLoading] = React.useState(true);
    const [userGroups, setUserGroups] = React.useState({ created: [], joined: [] });
    const [currentUserEmail, setCurrentUserEmail] = React.useState(null);
    const router = useRouter();

    React.useEffect(() => {
        const loadUserGroups = async () => {
            const { user, created, joined } = await fetchMeData();
            
            if (!user) {
                router.replace("/auth/login"); 
                return; 
            }
            
            setCurrentUserEmail(user.email); 
            setUserGroups({ created, joined });
            setLoading(false);
        };
        
        loadUserGroups();
    }, [router]);

    // 1️⃣ MOVE THESE UP: Define these BEFORE the loading check
    const handleNavigateToCommunity = (community) => {
        if (community.slug) {
            router.push(`/groups/${community.slug}`);
        } else {
            console.error("Cannot navigate: Community slug is missing.", community);
        }
    };
    
    const dummyProps = {
        onNavigateToCommunity: handleNavigateToCommunity,
        onCreateNewCommunity: (c) => console.log("Created", c.name),
        onDeleteCommunity: (c) => console.log("Deleted", c.name),
    };

    // 2️⃣ LOADING GUARD: Uses the Full-Screen Black Overlay
    if (loading || !currentUserEmail) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0d0d0d] flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium animate-pulse"></p>
                </div>
            </div>
        );
    }
    
    // 3️⃣ RENDER: Now dummyProps is guaranteed to be defined
    return (
        <ExplorePage 
            {...dummyProps}
            userCreatedCommunities={userGroups.created}
            initialRecommended={userGroups.joined}
        />
    );
}

// ----------------------
// CREATE COMMUNITY FORM (kept as is)
// ----------------------
const CreateCommunityForm = ({ isOpen, onClose, onSubmitSuccess }) => {
    const [isCreating, setIsCreating] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: "",
        description: "",
        bannerFile: null,
        logoFile: null,
        category: "Tech",
    });

    const [errors, setErrors] = React.useState({});
    const logoRef = React.useRef(null);
    const bannerRef = React.useRef(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: "" }));
    };

 const handleFileChange = (e) => {
  const { name, files } = e.target;
  const file = files?.[0];
  if (!file) return;
  if (!validateImage(file)) return;
  setFormData((p) => ({ ...p, [name]: file }));
};
    const validate = () => {
        const e = {};
        if (!formData.name.trim()) e.name = "Required";
        if (!formData.description.trim()) e.description = "Required";
        if (!formData.logoFile) e.logoFile = "Logo required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsCreating(true);

    try {
        const iconBase64 = await fileToBase64(formData.logoFile);
        const bannerBase64 = await fileToBase64(formData.bannerFile);

        const res = await apiFetch("/api/groups", {
            method: "POST",
            body: JSON.stringify({
                name: formData.name.trim(),
                description: formData.description.trim(),
                category: formData.category.trim() || "For You",
                ownerEmail: getCurrentUserEmail(),
                iconBase64,
                bannerBase64,
            }),
        });

        if (!res.ok) throw new Error("Create failed");

        const data = await res.json();

        onSubmitSuccess({
            ...data.group,
            createdByCurrentUser: true,
        });

        onClose();
    } catch (err) {
        console.error("Create community failed:", err);
        alert("Failed to create community");
    } finally {
        setIsCreating(false);
    }
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
            <div className="w-full max-w-xl rounded-2xl bg-[#0f0f0f] text-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-semibold">Create community</h2>
                        <p className="text-sm text-gray-400">Build your own space</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Community Name */}
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Community name"
                        className="w-full bg-transparent border-b border-white/10 focus:border-purple-500 outline-none py-2 text-lg"
                    />

                    {/* Description */}
                   <input
    type="text"
    name="description"
    value={formData.description}
    onChange={handleChange}
    placeholder="What is this community about?"
    maxLength={120}
    className="
        w-full
        bg-transparent
        border-b
        border-white/10
        focus:border-purple-500
        outline-none
        py-2
        text-sm
        placeholder-gray-400
    "
/>

                    {/* Category */}
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm"
                    >
                        {categories.filter(c => c !== "For You").map(c => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>

                    {/* Upload Row */}
                    <div className="flex gap-4">
                       <button
  type="button"
  onClick={() => logoRef.current.click()}
  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151515] py-3 text-sm hover:border-purple-500"
>
  <span className="text-red-500">*</span>
  <Image className="w-4 h-4 text-purple-400" />
  {formData.logoFile ? "Logo added" : "Add logo (required)"}
</button>

                        <button
                            type="button"
                            onClick={() => bannerRef.current.click()}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151515] py-3 text-sm hover:border-purple-500"
                        >
                            <Upload className="w-4 h-4 text-purple-400" />
                            {formData.bannerFile ? "Banner added" : "Add banner"}
                        </button>
                    </div>
<p className="text-xs text-gray-500 mt-2">
  Logo is required • Max image size: 3 MB
</p>

                    <input ref={logoRef} type="file" hidden accept="image/*"
                        name="logoFile" onChange={handleFileChange} />
                    <input ref={bannerRef} type="file" hidden accept="image/*"
                        name="bannerFile" onChange={handleFileChange} />
                </form>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-white/10">
                  <button
    type="submit"
    onClick={handleSubmit}
    disabled={isCreating}
    className="rounded-full bg-purple-600 hover:bg-purple-700 px-8 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
>
    {isCreating ? "Creating..." : "Create"}
</button>
                </div>
            </div>
        </div>
    );
};


// -------------------------
// EDIT COMMUNITY FORMS (NEW)
// -------------------------
const EditCommunityForm = ({
    community,
    isOpen,
    onClose,
    onUpdateSuccess,
}) => {
    const [formData, setFormData] = React.useState({
        name: community?.name || "",
        description: community?.description || "",
        category: community?.category || "Tech",
    });

    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (community) {
            setFormData({
                name: community.name,
                description: community.description,
                category: community.category || "Tech",
            });
        }
    }, [community]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) return;

        setLoading(true);
        try {
            const res = await apiFetch(`/api/groups/${community.id}`, {
                method: "PATCH",
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            onUpdateSuccess({
                ...community,
                ...data.group,
            });
            onClose();
        } catch (err) {
            alert("Failed to update community");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !community) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
            <div className="w-full max-w-xl rounded-2xl bg-[#0f0f0f] text-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-semibold">Edit community</h2>
                        <p className="text-sm text-gray-400">Update details</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                    {/* Community Name */}
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Community name"
                        className="
                            w-full
                            bg-transparent
                            border-b
                            border-white/10
                            focus:border-purple-500
                            outline-none
                            py-2
                            text-lg
                            placeholder-gray-500
                        "
                    />

                    {/* Description (same space as name) */}
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What is this community about?"
                        maxLength={120}
                        className="
                            w-full
                            bg-transparent
                            border-b
                            border-white/10
                            focus:border-purple-500
                            outline-none
                            py-2
                            text-sm
                            placeholder-gray-400
                        "
                    />

                    {/* Category */}
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm"
                    >
                        {categories
                            .filter((c) => c !== "For You")
                            .map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                    </select>
                </form>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-white/10">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-full bg-purple-600 hover:bg-purple-700 px-8 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};


const EditCommunityMediaForm = ({
    community,
    isOpen,
    onClose,
    onUpdateSuccess,
}) => {
    const [logoFile, setLogoFile] = React.useState(null);
    const [bannerFile, setBannerFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const logoRef = React.useRef(null);
    const bannerRef = React.useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!logoFile && !bannerFile) {
            alert("Please select at least one file");
            return;
        }

        setLoading(true);
        try {
            const payload = {};
            if (logoFile) payload.iconBase64 = await fileToBase64(logoFile);
            if (bannerFile) payload.bannerBase64 = await fileToBase64(bannerFile);

            const res = await apiFetch(`/api/groups/${community.id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            onUpdateSuccess({
                ...community,
                iconUrl: data.group.iconUrl || community.iconUrl,
                bannerUrl: data.group.bannerUrl || community.bannerUrl,
            });

            onClose();
        } catch (err) {
            alert("Failed to update media");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !community) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
            <div className="w-full max-w-xl rounded-2xl bg-[#0f0f0f] text-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-semibold">Edit community media</h2>
                        <p className="text-sm text-gray-400">
                            Update logo or banner
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

                    {/* Media buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => logoRef.current.click()}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151515] py-3 text-sm hover:border-purple-500"
                        >
                            <Image className="w-4 h-4 text-purple-400" />
                            {logoFile ? "Logo selected" : "Update logo"}
                        </button>

                        <button
                            type="button"
                            onClick={() => bannerRef.current.click()}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#151515] py-3 text-sm hover:border-purple-500"
                        >
                            <Upload className="w-4 h-4 text-purple-400" />
                            {bannerFile ? "Banner selected" : "Update banner"}
                        </button>
                    </div>

                    <input
                        ref={logoRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
  const file = e.target.files?.[0];
  if (validateImage(file)) setLogoFile(file);
}}
                    />

                    <input
                        ref={bannerRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
  const file = e.target.files?.[0];
  if (validateImage(file)) setBannerFile(file);
}}
                    />

                    {/* Helper text */}
                    <p className="text-xs text-gray-500">
                        Logo: 1:1 ratio • Banner: 16:9 ratio
                    </p>
                </form>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-white/10">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-full bg-purple-600 hover:bg-purple-700 px-8 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};


// -------------------------
// MAIN EXPLORE PAGE (UPDATED WITH EDIT FUNCTIONALITY)
// -------------------------
function ExplorePage({
    onNavigateToCommunity,
    onCreateNewCommunity,
    onDeleteCommunity,
    userCreatedCommunities = [],
    initialRecommended = [],
}) {
    const searchParams = useSearchParams();
    const invitedSlug = searchParams.get("invited");

    const initCategory = (() => {
        try {
            const q = typeof window === "undefined" ? null : searchParams.get("category");
            return q && q.length ? q : "For You";
        } catch {
            return "For You";
        }
    })();

    const [showAllTrending, setShowAllTrending] = React.useState(false);
    const [showAllRecommended, setShowAllRecommended] = React.useState(false);
    const [showAllJoined, setShowAllJoined] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [recommendedCommunities, setRecommendedCommunities] = React.useState(initialRecommended || []);
    const [selectedCategory, setSelectedCategory] = React.useState(initCategory);
    const [joinedCommunities, setJoinedCommunities] = React.useState(
        initialRecommended.reduce((acc, comm) => ({ 
            ...acc, 
            [comm.id]: true 
        }), {})
    );

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    React.useEffect(() => {
  const view = searchParams.get("view");

  if (view === "create") {
    setIsCreateModalOpen(true);
  }
}, [searchParams?.toString()]);

    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isEditMediaModalOpen, setIsEditMediaModalOpen] = React.useState(false);
    const [selectedCommunityForEdit, setSelectedCommunityForEdit] = React.useState(null);

    const currentUserEmail = typeof window !== "undefined" ? getCurrentUserEmail() : null;
    const isSiteOwner = currentUserEmail === SITE_OWNER_EMAIL;

    // Sync category from URL
    React.useEffect(() => {
        try {
            const q = searchParams.get("category");
            if (q && q.length && q !== selectedCategory) setSelectedCategory(q);
        } catch {}
    }, [searchParams?.toString()]);

    // Load additional groups
    React.useEffect(() => {
        let mounted = true;

        async function loadGroups() {
            try {
                const res = await apiFetch("/api/groups");
                if (!res.ok) return;

                const data = await res.json();
                if (!mounted) return;

                const incomingGroups = (data.groups || []).map((g) => ({
                    id: g._id || g.id,
                    name: g.name,
                    description: g.description,
                    membersCount: g.membersCount || 0,
                    iconUrl: g.iconUrl,
                    bannerUrl: g.bannerUrl,
                    slug: g.slug,
                   category: (g.category || "For You")
  .trim()
  .toLowerCase()
  .replace(/^./, c => c.toUpperCase()),
                    ownerEmail: g.ownerEmail,
                }));
                
                const existingJoinedIds = new Set(Object.keys(joinedCommunities));
                const newRecommended = incomingGroups.filter(g => !existingJoinedIds.has(g.id));

                setRecommendedCommunities((prev) => {
                    const currentIds = new Set(prev.map(c => c.id));
                    const freshList = newRecommended.filter(g => !currentIds.has(g.id));
                    
                    const finalMap = new Map();
                    [...prev, ...freshList].forEach(c => finalMap.set(c.id, c));
                    
                    return [...finalMap.values()];
                });
            } catch (e) {
                console.error("Failed to load groups", e);
            }
        }

        loadGroups();
        return () => (mounted = false);
    }, [joinedCommunities]);

    // --------------------------------------
    // ✅ UPDATED SAFE JOIN FUNCTION
    // --------------------------------------
    const handleJoin = async (community) => {
        const id = community.id;
        const email = currentUserEmail;

        if (!email) {
            alert("Please login to join a community.");
            return;
        }

        // Optimistic join
        setJoinedCommunities((p) => ({ ...p, [id]: true }));

        try {
            const res = await apiFetch(`/api/groups/${id}/join`, {
                method: "POST",
                body: JSON.stringify({ userEmail: email }),
            });

            if (!res.ok) {
                console.warn("Join server error");
                // Rollback optimistic update if server fails
                setJoinedCommunities((p) => {
                    const copy = { ...p };
                    delete copy[id];
                    return copy;
                });
                return;
            }

            let data = {};
            try {
                data = await res.json();
            } catch {}

            if (data.membersCount !== undefined) {
                setRecommendedCommunities((list) =>
                    list.map((c) =>
                        c.id === id ? { ...c, membersCount: data.membersCount } : c
                    )
                );
            }

        } catch (err) {
            console.error("JOIN FAILED:", err);
            // Rollback on network error
            setJoinedCommunities((p) => {
                const copy = { ...p };
                delete copy[id];
                return copy;
            });
        }
    };

    // NAVIGATE
    const handleNavigate = (community) => {
        const isJoined =
            !!joinedCommunities[community.id] || community.createdByCurrentUser;

       if (onNavigateToCommunity) {
        onNavigateToCommunity(community);
    }

        
    };

    // NEW COMMUNITY
    const handleNewCommunitySubmission = (newCommunity) => {
        setRecommendedCommunities((prev) => [
            ...prev.filter((c) => c.id !== newCommunity.id),
            newCommunity,
        ]);

        setJoinedCommunities((prev) => ({ ...prev, [newCommunity.id]: true }));

        if (onCreateNewCommunity) onCreateNewCommunity(newCommunity);
    };

    // DELETE COMMUNITY
    const handleDeleteCommunity = async (community) => {
        if (!window.confirm(`Delete "${community.name}"? This action cannot be undone.`)) return;

        try {
            await apiFetch(`/api/groups/${community.id}`, { method: "DELETE" });
        } catch (e) {
            console.error(e);
        }

        setRecommendedCommunities((prev) =>
            prev.filter((c) => c.id !== community.id)
        );

        setJoinedCommunities((prev) => {
            const copy = { ...prev };
            delete copy[community.id];
            return copy;
        });

        if (onDeleteCommunity) onDeleteCommunity(community);

        alert(`Community "${community.name}" deleted.`);
    };

    // EDIT COMMUNITY
    const handleEditCommunity = (community) => {
        setSelectedCommunityForEdit(community);
        setIsEditModalOpen(true);
    };

    const handleUpdateCommunity = (updatedCommunity) => {
        setRecommendedCommunities((prev) =>
            prev.map((c) =>
                c.id === updatedCommunity.id 
                    ? { ...c, ...updatedCommunity }
                    : c
            )
        );
    };

    // EDIT MEDIA
    const handleEditMedia = (community) => {
        setSelectedCommunityForEdit(community);
        setIsEditMediaModalOpen(true);
    };

    const handleUpdateMedia = (updatedCommunity) => {
        setRecommendedCommunities((prev) =>
            prev.map((c) =>
                c.id === updatedCommunity.id 
                    ? { 
                        ...c, 
                        iconUrl: updatedCommunity.iconUrl || c.iconUrl,
                        bannerUrl: updatedCommunity.bannerUrl || c.bannerUrl
                    }
                    : c
            )
        );
    };

    // MERGED COMMUNITIES
    const allCommunities = React.useMemo(() => {
        const finalSet = new Map();
        
        recommendedCommunities.forEach((c) => finalSet.set(c.id, c));
        
        userCreatedCommunities.forEach((c) => {
            finalSet.set(c.id, {
                ...(finalSet.get(c.id) || c), 
                createdByCurrentUser: true
            });
        });

        return [...finalSet.values()];
    }, [userCreatedCommunities, recommendedCommunities]);

    // 🔥 REAL-TIME SYNC FOR RIGHT SIDEBAR (TOP COMMUNITIES)
React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
    const payload = allCommunities.map((c) => ({
  id: String(c.id || c._id),   // 🔥 normalize id
  name: c.name,
  slug: c.slug,
  description: c.description || "",
  category: c.category || "default",
  membersCount: Number(c.membersCount || 0),
  bannerUrl: c.bannerUrl || null,
  iconUrl: c.iconUrl || null,   // ✅ THIS WAS MISSING
}));
   localStorage.setItem(
            "confique:allCommunities",
            JSON.stringify(payload)
        );

        // 🔔 Notify RightSidebar instantly
        window.dispatchEvent(
            new Event("confique:communities-updated")
        );
    } catch (err) {
        console.error("Failed to sync communities:", err);
    }
}, [allCommunities]);


    const userJoinedCommunities = React.useMemo(
        () =>
            allCommunities.filter(
                (c) => joinedCommunities[c.id] || c.createdByCurrentUser
            ),
        [allCommunities, joinedCommunities]
    );

    const trendingByMembers = React.useMemo(() => {
        const sorted = [...allCommunities].sort(
            (a, b) => (b.membersCount || 0) - (a.membersCount || 0)
        );

        return selectedCategory === "For You"
            ? sorted
            : sorted.filter((c) => c.category?.toLowerCase() === selectedCategory.toLowerCase());
    }, [allCommunities, selectedCategory]);

    const explorableViewCommunities = React.useMemo(() => {
        let list = allCommunities.filter(
            (c) => !joinedCommunities[c.id] && !c.createdByCurrentUser 
        );

        if (selectedCategory !== "For You") {
            list = list.filter((c) => c.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        if (invitedSlug) {
            const i = list.findIndex((c) => c.slug === invitedSlug);
            if (i > -1) {
                const invited = list.splice(i, 1)[0];
                list.unshift(invited);
            }
        }

        return list;
    }, [allCommunities, joinedCommunities, invitedSlug, selectedCategory]);

    // SEARCH
    const filteredCommunities = React.useMemo(() => {
        const term = searchTerm.toLowerCase();

        let base = selectedCategory === "For You"
            ? allCommunities
            : allCommunities.filter((c) =>c.category?.toLowerCase() === selectedCategory.toLowerCase());

        if (!term) {
            return base.filter(
                (c) => !joinedCommunities[c.id] && !c.createdByCurrentUser
            );
        }

        return base.filter(
            (c) =>
                c.name.toLowerCase().includes(term) ||
                (c.description || "").toLowerCase().includes(term) ||
                (c.slug || "").toLowerCase().includes(term)
        );
    }, [searchTerm, allCommunities, selectedCategory, joinedCommunities]);

    // Display logic
    const displayTrending = showAllTrending
        ? trendingByMembers
        : trendingByMembers.slice(0, INITIAL_DISPLAY_LIMIT);

    const displayJoined =
        showAllJoined || searchTerm
            ? userJoinedCommunities
            : userJoinedCommunities.slice(0, JOINED_DISPLAY_LIMIT);

    const displayRecommended = searchTerm
        ? filteredCommunities
        : showAllRecommended
        ? explorableViewCommunities
        : explorableViewCommunities.slice(0, INITIAL_DISPLAY_LIMIT);

    const showJoinedSeeAll =
        !showAllJoined &&
        userJoinedCommunities.length > JOINED_DISPLAY_LIMIT &&
        !searchTerm;

    const showRecommendedSeeAll =
        !showAllRecommended &&
        explorableViewCommunities.length > INITIAL_DISPLAY_LIMIT &&
        !searchTerm;

    const renderCommunityList = (list) => (
        <div className="space-y-3">
            {list.map((community) => {
                const isJoined =
                    joinedCommunities[community.id] || community.createdByCurrentUser;

                const canDelete =
                    isSiteOwner || community.ownerEmail === currentUserEmail;

                return (
                    <RecommendedItem
                        key={community.id}
                        community={community}
                        isJoined={isJoined}
                        onJoin={() => handleJoin(community)}
                        onNavigate={handleNavigate}
                        canDelete={canDelete}
                        onDelete={handleDeleteCommunity}
                        onEdit={handleEditCommunity}
                        onEditMedia={handleEditMedia}
                    />
                );
            })}

            {searchTerm && list.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                    No communities found matching "{searchTerm}"
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white w-full">

            {/* MODALS */}
            <CreateCommunityForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmitSuccess={handleNewCommunitySubmission}
            />

            <EditCommunityForm
                community={selectedCommunityForEdit}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCommunityForEdit(null);
                }}
                onUpdateSuccess={handleUpdateCommunity}
            />

            <EditCommunityMediaForm
                community={selectedCommunityForEdit}
                isOpen={isEditMediaModalOpen}
                onClose={() => {
                    setIsEditMediaModalOpen(false);
                    setSelectedCommunityForEdit(null);
                }}
                onUpdateSuccess={handleUpdateMedia}
            />
<div className="w-full py-4 flex justify-center">
  <div className="w-full max-w-[820px] xl:max-w-[860px] px-1">
            {/* HEADER */}
            <header className="mb-6">
                <div className="flex justify-between items-center mb-5">
                    <h1 className="text-3xl font-bold">Explore</h1>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Community
                    </button>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search communities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                       className="
  w-full
  pl-10 pr-4 py-2.5
  bg-[#121212]
  border border-[#262626]
  rounded-xl
  text-white
  placeholder-gray-500
  focus:outline-none
  focus:ring-2
  focus:ring-purple-600/60
"
                    />
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
            </header>

            {/* CATEGORY FILTER */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Categories</h2>

                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
                    {categories.map((c) => (
                        <CategoryPill
                            key={c}
                            name={c}
                            isSelected={c === selectedCategory}
                            onClick={() => setSelectedCategory(c)}
                        />
                    ))}
                </div>
            </section>

            <hr className="border-gray-800 my-6" />

            {/* TRENDING */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Trending Communities</h2>

                    {trendingByMembers.length > INITIAL_DISPLAY_LIMIT && !showAllTrending && (
                        <button
                            onClick={() => setShowAllTrending(true)}
                            className="text-purple-450 hover:text-purple-650 flex items-center text-sm font-medium"
                        >
                            See All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    )}
                </div>

               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
  {displayTrending.length > 0 ? (
    displayTrending.map((community, index) => {
  const isJoined =
    joinedCommunities[community.id] || community.createdByCurrentUser;

  return (
    <TrendingCard
      key={community.id}
      community={community}
      gradient={PROFESSIONAL_GRADIENTS[index % PROFESSIONAL_GRADIENTS.length]}
      onNavigate={handleNavigate}
      isJoined={isJoined}
      onJoin={handleJoin}
    />
  );
})
  ) : (
    <div className="w-full py-10 text-center text-gray-500">
      No communities yet. Create one to get started 🚀
    </div>
  )}
</div>
            </section>

            <hr className="border-gray-800 my-6" />

            {/* JOINED */}
            {(userJoinedCommunities.length > 0 || searchTerm) && (
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            {searchTerm
                                ? `Joined Results (${userJoinedCommunities.length})`
                                : "Your Joined Communities"}
                        </h2>

                        {showJoinedSeeAll && (
                            <button
                                onClick={() => setShowAllJoined(true)}
                                className="text-purple-450 hover:text-purple-450 flex items-center text-sm font-medium"
                            >
                                See All
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        )}
                    </div>

                    {displayJoined.length > 0 ? (
  renderCommunityList(displayJoined)
) : (
  <p className="text-center text-gray-500 py-8">
    You haven’t joined any communities yet.
  </p>
)}
                    {searchTerm && userJoinedCommunities.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                            No joined communities match "{searchTerm}"
                        </p>
                    )}
                </section>
            )}

            {userJoinedCommunities.length > 0 && !searchTerm && (
                <hr className="border-gray-800 my-6" />
            )}

            {/* RECOMMENDED */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {searchTerm
                            ? `Search Results (${filteredCommunities.length})`
                            : "Communities For You"}
                    </h2>

                    {showRecommendedSeeAll && (
                        <button
                            onClick={() => setShowAllRecommended(true)}
                            className="text-purple-450 hover:text-purple-450 flex items-center text-sm font-medium"
                        >
                            See All
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    )}
                </div>

                {displayRecommended.length > 0 ? (
  renderCommunityList(displayRecommended)
) : (
  <p className="text-center text-gray-500 py-8">
    No communities found. Create one to get started 🚀
  </p>
)}
            </section>
        </div>
        </div>
         </div> 
    );
}