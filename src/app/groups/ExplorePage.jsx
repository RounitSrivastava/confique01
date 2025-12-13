// /groups/ExplorePage.jsx
"use client";

import React from "react";
import { Search, ChevronRight, Plus, X, Upload, Trash2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation"; // ⬅️ IMPORTED useRouter

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

// --- NEW HELPER: Fetch user data with groups (CRITICAL FIX FOR BACKEND FIELDS) ---
const fetchMeData = async () => {
    try {
        const res = await apiFetch("/api/me");
        if (!res.ok) {
            console.error("Failed to fetch user data and groups");
            return { user: null, created: [], joined: [] };
        }
        
        const data = await res.json();
        const user = data.user;
        
        if (!user) return { user: null, created: [], joined: [] };

        // ⚠️ CRITICAL FIX: Match the field names returned by the /api/me/route.js buildUserPayload
        const created = user.createdGroups || []; // Array of created group objects
        const joined = user.joinedGroups || []; // Array of explicitly joined group objects
        
        // Merge created and explicitly joined groups for a full list of user's groups
        const allUserGroupsMap = new Map();
        [...created, ...joined].forEach(group => {
            allUserGroupsMap.set(group.id, group);
        });
        const allUserGroups = [...allUserGroupsMap.values()];

        // Store email locally as the frontend code depends on it
        if (typeof window !== "undefined") {
            localStorage.setItem("userEmail", user.email);
        }

        return { 
            user, 
            created: created, 
            joined: allUserGroups // ALL groups user is a member of (Admin + Explicitly Joined)
        };
        
    } catch (e) {
        console.error("fetchMeData error:", e);
        return { user: null, created: [], joined: [] };
    }
};


// --- UI SUBCOMPONENTS (kept as is) ---
const CategoryPill = ({ name, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 whitespace-nowrap
        ${
            isSelected
            ? "bg-purple-600 text-white shadow-lg"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
    >
        {name}
    </button>
);

const TrendingCard = ({ community, onNavigate }) => (
    <div
        onClick={() => onNavigate(community)}
        className="w-40 h-52 flex-shrink-0 rounded-xl overflow-hidden relative mr-4 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
    >
        {community.bannerUrl ? (
            <img src={community.bannerUrl} alt={community.name} className="w-full h-28 object-cover" />
        ) : (
            <div className="w-full h-28 bg-gray-800" />
        )}

        <div className="p-3 text-white">
            <p className="font-semibold text-sm">{community.name}</p>
            {community.description && (
                <p className="text-xs text-gray-300 line-clamp-2 mt-1">{community.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
                {community.membersCount || 0} members
            </p>
        </div>
    </div>
);

const RecommendedItem = ({
    community,
    isJoined,
    onJoin,
    onNavigate,
    canDelete,
    onDelete,
}) => {
    const displayIconUrl = community.iconUrl || community.icon;

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
            <div
                className={`flex items-center flex-grow pr-4 rounded-lg -mx-2 px-2 py-1 ${
                    isJoined ? "cursor-pointer hover:bg-gray-800" : "cursor-default"
                }`}
                // CRITICAL: Navigation only proceeds if isJoined is true.
                onClick={() => isJoined && onNavigate(community)}
            >
                <div className="w-12 h-12 rounded-md mr-3 bg-gray-600 flex items-center justify-center text-lg font-bold overflow-hidden">
                    {displayIconUrl ? (
                        <img src={displayIconUrl} className="w-full h-full object-cover rounded-md" />
                    ) : (
                        community.name?.charAt(0) || "?"
                    )}
                </div>

                <div>
                    <p className="font-medium text-white">{community.name}</p>
                    <p className="text-sm text-gray-400">{community.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {community.membersCount || 0} members
                    </p>

                    {community.createdByCurrentUser && (
                        <p className="text-xs text-amber-400 font-semibold mt-1">⭐ You're the admin</p>
                    )}
                    {community.category && (
                        <p className="text-xs text-gray-400 mt-1">Category: {community.category}</p>
                    )}
                </div>
            </div>

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
                    <button className="bg-white text-black py-1.5 px-4 rounded-full text-sm" disabled>
                        Joined
                    </button>
                )}

                {/* FIX: The delete option should only show for communities created by the user (admin) or site owner */}
                {canDelete && community.createdByCurrentUser && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 rounded-full bg-red-900/40 hover:bg-red-800 text-red-300"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
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
    const router = useRouter(); // ⬅️ Use the router hook

    React.useEffect(() => {
        const loadUserGroups = async () => {
            const { user, created, joined } = await fetchMeData();
            
            if (user) {
                setCurrentUserEmail(user.email); 
            } else {
                setCurrentUserEmail(getCurrentUserEmail()); 
            }
            
            setUserGroups({ created, joined });
            setLoading(false);
        };
        loadUserGroups();
    }, []);

    // ⬅️ FIX: Implement actual routing here
    const handleNavigateToCommunity = (community) => {
        if (community.slug) {
            router.push(`/groups/${community.slug}`);
        } else {
            console.error("Cannot navigate: Community slug is missing.", community);
            // Fallback if your routing component isn't dynamic (optional, depends on your setup)
            // router.push(`/groups/feed?id=${community.id}`); 
        }
    };
    
    const dummyProps = {
        onNavigateToCommunity: handleNavigateToCommunity, // ⬅️ Pass the actual router function
        onCreateNewCommunity: (c) => console.log("Created", c.name),
        onDeleteCommunity: (c) => console.log("Deleted", c.name),
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white p-6 flex justify-center items-center">
                Loading communities...
            </div>
        );
    }
    
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

    React.useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                description: "",
                bannerFile: null,
                logoFile: null,
                category: "Tech",
            });
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Community Name is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.logoFile) newErrors.logoFile = "Logo is required.";
        if (!formData.category) newErrors.category = "Category is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const iconBase64 = formData.logoFile ? await fileToBase64(formData.logoFile) : null;
        const bannerBase64 = formData.bannerFile ? await fileToBase64(formData.bannerFile) : null;

        const payload = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            ownerEmail: getCurrentUserEmail() || SITE_OWNER_EMAIL,
            iconBase64,
            bannerBase64,
        };

        try {
            const res = await apiFetch("/api/groups", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || "Failed to create community.");
                return;
            }

            const data = await res.json();
            const g = data.group;

            onSubmitSuccess({
                id: g._id || g.id,
                name: g.name,
                membersCount: g.membersCount || 1,
                description: g.description,
                iconUrl: g.iconUrl,
                bannerUrl: g.bannerUrl,
                slug: g.slug,
                category: g.category,
                createdByCurrentUser: true,
                ownerEmail: g.ownerEmail,
                role: "admin",
            });

            alert(`Community "${formData.name}" created successfully.`);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create community");
        }
    };

    if (!isOpen) return null;

    const FileInput = ({ label, name, file, inputRef, required, error }) => (
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label} {required && "*"}
            </label>
            <div
                className={`flex items-center justify-between h-12 px-3 border-2 rounded-lg bg-gray-800 ${
                    error ? "border-red-500" : "border-dashed border-gray-600"
                }`}
            >
                <span className={`text-sm truncate ${file ? "text-white" : "text-gray-400"}`}>
                    {file ? file.name : "No file selected"}
                </span>

                <button
                    type="button"
                    onClick={() => {
                        if (file) setFormData((prev) => ({ ...prev, [name]: null }));
                        else inputRef.current?.click();
                    }}
                    className="flex items-center text-gray-400 hover:text-white p-1"
                >
                    {file ? <X className="w-4 h-4 mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                    {file ? "Remove" : "Upload"}
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    key={file}
                />
            </div>

            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* HEADER */}
                <div className="flex justify-between items-center p-5 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">🚀 Create New Community</h2>
                    <button className="text-gray-400 hover:text-white" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Community Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white ${
                                errors.name ? "border-red-500" : "border-gray-700"
                            }`}
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description *
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white ${
                                errors.description ? "border-red-500" : "border-gray-700"
                            }`}
                        />
                        {errors.description && (
                            <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white ${
                                errors.category ? "border-red-500" : "border-gray-700"
                            }`}
                        >
                            {categories
                                .filter((c) => c !== "For You")
                                .map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* FILE INPUTS */}
                    <div className="flex space-x-4">
                        <FileInput
                            label="Community Logo"
                            name="logoFile"
                            file={formData.logoFile}
                            required
                            inputRef={logoRef}
                            error={errors.logoFile}
                        />

                        <FileInput
                            label="Community Banner (Optional)"
                            name="bannerFile"
                            file={formData.bannerFile}
                            inputRef={bannerRef}
                            error={errors.bannerFile}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
                    >
                        Create Community
                    </button>
                </form>
            </div>
        </div>
    );
};
// -------------------------
// MAIN EXPLORE PAGE (MODIFIED INITIALIZATION & LOGIC)
// -------------------------
function ExplorePage({
    onNavigateToCommunity,
    onCreateNewCommunity,
    onDeleteCommunity,
    userCreatedCommunities = [],
    initialRecommended = [], // All groups user is a member of (created + explicitly joined)
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
    
    // NOTE: initialRecommended contains *all* joined communities from /api/me
    const [recommendedCommunities, setRecommendedCommunities] = React.useState(initialRecommended || []);
    const [selectedCategory, setSelectedCategory] = React.useState(initCategory);

    // JOINED CACHE: Initialize with groups from /api/me (both created and explicitly joined)
    const [joinedCommunities, setJoinedCommunities] = React.useState(
        initialRecommended.reduce((acc, comm) => ({ 
            ...acc, 
            [comm.id]: true 
        }), {})
    );

    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    const currentUserEmail =
        typeof window !== "undefined" ? getCurrentUserEmail() : null;

    const isSiteOwner = currentUserEmail === SITE_OWNER_EMAIL;

    // Sync category from URL (kept as is)
    React.useEffect(() => {
        try {
            const q = searchParams.get("category");
            if (q && q.length && q !== selectedCategory) setSelectedCategory(q);
        } catch {}
    }, [searchParams?.toString()]);

    // Load *additional* groups (i.e., not joined by the user yet)
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
                    category: g.category,
                    ownerEmail: g.ownerEmail,
                }));
                
                // Filter out any incoming groups that the user has already joined/created
                const existingJoinedIds = new Set(Object.keys(joinedCommunities));
                const newRecommended = incomingGroups.filter(g => !existingJoinedIds.has(g.id));

                // Add the new recommended groups to the existing list
                setRecommendedCommunities((prev) => {
                    const currentIds = new Set(prev.map(c => c.id));
                    const freshList = newRecommended.filter(g => !currentIds.has(g.id));
                    
                    // Deduplicate and combine
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
    }, [joinedCommunities]); // Depend on joinedCommunities to prevent duplicates

    // --------------------------------------
    // ✅ UPDATED SAFE JOIN FUNCTION (kept as is)
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

    // NAVIGATE (kept as is)
    const handleNavigate = (community) => {
        const isJoined =
            !!joinedCommunities[community.id] || community.createdByCurrentUser;

        // If not joined/admin, optimistically mark as joined on navigate.
        if (!isJoined) {
            setJoinedCommunities((prev) => ({ ...prev, [community.id]: true }));
        }

        // The RecommendedItem component ensures this is only called if isJoined is true.
        if (onNavigateToCommunity) onNavigateToCommunity(community); 
    };

    // NEW COMMUNITY (kept as is)
    const handleNewCommunitySubmission = (newCommunity) => {
        setRecommendedCommunities((prev) => [
            ...prev.filter((c) => c.id !== newCommunity.id),
            newCommunity,
        ]);

        setJoinedCommunities((prev) => ({ ...prev, [newCommunity.id]: true }));

        if (onCreateNewCommunity) onCreateNewCommunity(newCommunity);
    };

    // DELETE COMMUNITY (kept as is)
    const handleDeleteCommunity = async (community) => {
        if (!window.confirm(`Delete "${community.name}"?`)) return;

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

    // MERGED COMMUNITIES (CRITICAL FIX FOR ADMIN/JOINED STATUS)
    const allCommunities = React.useMemo(() => {
        const finalSet = new Map();
        
        // 1. Add all communities from recommended (from initial load + subsequent API calls)
        recommendedCommunities.forEach((c) => finalSet.set(c.id, c));
        
        // 2. Overwrite/Merge with userCreatedCommunities (the definitive admin list).
        // This ensures the `createdByCurrentUser` flag is set correctly and persists.
        userCreatedCommunities.forEach((c) => {
            finalSet.set(c.id, {
                ...(finalSet.get(c.id) || c), 
                createdByCurrentUser: true // <-- CRITICAL: Ensures the Admin flag is TRUE
            });
        });

        return [...finalSet.values()];
    }, [userCreatedCommunities, recommendedCommunities]);

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
            : sorted.filter((c) => c.category === selectedCategory);
    }, [allCommunities, selectedCategory]);

    const explorableViewCommunities = React.useMemo(() => {
        let list = allCommunities.filter(
            // Non-joined communities (excluding admin groups)
            (c) => !joinedCommunities[c.id] && !c.createdByCurrentUser 
        );

        if (selectedCategory !== "For You") {
            list = list.filter((c) => c.category === selectedCategory);
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

    // SEARCH (kept as is)
    const filteredCommunities = React.useMemo(() => {
        const term = searchTerm.toLowerCase();

        let base = selectedCategory === "For You"
            ? allCommunities
            : allCommunities.filter((c) => c.category === selectedCategory);

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

    // Display logic (kept as is)
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
                        onDelete={() => handleDeleteCommunity(community)}
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
        <div className="min-h-screen bg-[#0d0d0d] text-white p-4 sm:p-6">
            {/* MODAL */}
            <CreateCommunityForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmitSuccess={handleNewCommunitySubmission}
            />

            {/* HEADER */}
            <header className="mb-6">
                <div className="flex justify-between items-center mb-4">
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </header>

            {/* CATEGORY FILTER */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Categories</h2>

                <div className="flex space-x-3 overflow-x-auto pb-2">
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

                <div className="flex overflow-x-auto pb-2 -mr-4 scrollbar-hide">
                    {displayTrending.map((community) => (
                        <TrendingCard
                            key={community.id}
                            community={community}
                            onNavigate={handleNavigate}
                        />
                    ))}
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

                    {renderCommunityList(displayJoined)}

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

                {renderCommunityList(displayRecommended)}
            </section>
        </div>
    );
}