// /groups/ExplorePage.jsx
"use client";
import React from "react";
import { Search, ChevronRight, Plus, X, Upload, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// --- ADMIN CONSTANTS / HELPERS ---
const SITE_OWNER_EMAIL = "confique01@gmail.com";

const getCurrentUserEmail = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("userEmail") || null;
  } catch {
    return null;
  }
};

// 🔔 Common helper: push a notification to a specific user
const pushNotification = (targetEmail, data) => {
  if (typeof window === "undefined" || !targetEmail) return;

  const createdAt = new Date().toISOString();
  const notif = {
    id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt,
    read: false,
    ...data, // { type, message, communityId, communityName, ... }
  };

  try {
    const store = JSON.parse(localStorage.getItem("notifications") || "{}");
    const list = store[targetEmail] || [];
    store[targetEmail] = [notif, ...list];
    localStorage.setItem("notifications", JSON.stringify(store));

    // tell Topbar a new notification arrived
    window.dispatchEvent(
      new CustomEvent("confique:new-notification", { detail: notif })
    );
  } catch (e) {
    console.error("Failed to push notification", e);
  }
};

// --- CONSTANTS ---
const INITIAL_DISPLAY_LIMIT = 5;
const JOINED_DISPLAY_LIMIT = 3;

// --- DUMMY DATA ---
const categories = [
  "For You",
  "Tech",
  "Entrepreneurship",
  "Gaming",
  "Sports",
  "Music",
  "Art",
];

const trendingCommunities = [
  {
    id: 101,
    name: "Pixel Warriors",
    members: "12.4k",
    membersCount: 12400,
    description: "Competitive pixel art & speedruns.",
    background: "bg-gradient-to-br from-black to-black",
    isImage: false,
    slug: "pixel-warriors",
    category: "Gaming",
  },
  {
    id: 102,
    name: "Goal Getters Club",
    members: "8.1k",
    membersCount: 8100,
    description: "Football tactics, matches and tips.",
    image: "/images/soccer-net.jpg",
    isImage: true,
    slug: "goal-getters-club",
    category: "Sports",
  },
  {
    id: 103,
    name: "Crypto Hub",
    members: "32.0k",
    membersCount: 32000,
    description: "News, trading strategies and research.",
    background: "bg-gradient-to-r from-yellow-500 to-amber-700",
    isImage: false,
    slug: "crypto-hub",
    category: "Tech",
  },
  {
    id: 104,
    name: "Foodies Delight",
    members: "15.9k",
    membersCount: 15900,
    description: "Recipes, restaurant recs and reviews.",
    background: "bg-gradient-to-r from-red-500 to-red-700",
    isImage: false,
    slug: "foodies-delight",
    category: "Food",
  },
  {
    id: 105,
    name: "Space Nerds",
    members: "9.3k",
    membersCount: 9300,
    description: "Astronomy, rockets and space news.",
    background: "bg-gradient-to-r from-purple-600",
    isImage: false,
    slug: "space-nerds",
    category: "Tech",
  },
  {
    id: 106,
    name: "Book Worms HQ",
    members: "11.2k",
    membersCount: 11200,
    description: "Book recs, reviews and reading groups.",
    background: "bg-gradient-to-r from-gray-700 to-gray-800",
    isImage: false,
    slug: "book-worms",
    category: "Art",
  },
];

const initialRecommendedCommunitiesData = [
  {
    id: 1,
    name: "Tech Innovators",
    members: "23.7k members",
    membersCount: 23700,
    description: "Discussions on next-gen tech.",
    icon: "/images/tech-icon.png",
    iconUrl: "/images/tech-icon.png",
    slug: "tech-innovators",
    category: "Tech",
  },
  {
    id: 2,
    name: "Adventurers Unite",
    members: "15.2k members",
    membersCount: 15200,
    description: "Share your travel stories & tips.",
    icon: "/images/adventure-icon.png",
    iconUrl: "/images/adventure-icon.png",
    slug: "adventurers-unite",
    category: "Travel",
  },
  {
    id: 3,
    name: "Bake Off Club",
    members: "9.8k members",
    membersCount: 9800,
    description: "Recipes, tips, and baking tricks.",
    icon: "/images/bake-icon.png",
    iconUrl: "/images/bake-icon.png",
    slug: "bake-off-club",
    category: "Food",
  },
  {
    id: 4,
    name: "Fitness Fanatics",
    members: "55.0k members",
    membersCount: 55000,
    description: "Workouts and nutrition advice.",
    icon: "/images/fitness-icon.png",
    iconUrl: "/images/fitness-icon.png",
    slug: "fitness-fanatics",
    category: "Sports",
  },
  {
    id: 5,
    name: "DIY Masters",
    members: "18.3k members",
    membersCount: 18300,
    description: "Home improvement and crafting.",
    icon: "/images/diy-icon.png",
    iconUrl: "/images/diy-icon.png",
    slug: "diy-masters",
    category: "Art",
  },
  {
    id: 6,
    name: "Photography Pros",
    members: "20.1k members",
    membersCount: 20100,
    description: "Share your best shots and gear talk.",
    icon: "/images/photo-icon.png",
    iconUrl: "/images/photo-icon.png",
    slug: "photography-pros",
    category: "Art",
  },
];

// --- SUB-COMPONENTS ---
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
    {community.isImage ? (
      <img
        src={community.image}
        alt={community.name}
        className="w-full h-28 object-cover"
      />
    ) : (
      <div className={`w-full h-28 ${community.background}`} />
    )}

    <div className="p-3 flex flex-col justify-start text-white bg-transparent">
      <p className="font-semibold text-sm leading-snug">{community.name}</p>
      {community.description && (
        <p className="text-xs text-gray-300 line-clamp-2 mt-1">
          {community.description}
        </p>
      )}

      <div className="mt-auto pt-2">
        <p className="text-xs text-gray-200">
          {community.members || `${community.membersCount || 0} members`}
        </p>
      </div>
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
  const buttonClasses = isJoined
    ? "bg-white text-black font-medium py-1.5 px-4 rounded-full text-sm transition-colors"
    : "bg-purple-600 hover:bg-purple-700 text-white font-medium py-1.5 px-4 rounded-full text-sm transition-colors";

  const buttonText = isJoined ? "Joined" : "Join";

  const contentClasses = `flex items-center flex-grow pr-4 rounded-lg -mx-2 px-2 py-1 transition-colors 
    ${isJoined ? "cursor-pointer hover:bg-gray-800" : "cursor-default"}`;

  const displayIconUrl = community.iconUrl || community.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
      <div
        className={contentClasses}
        onClick={() => isJoined && onNavigate(community)}
      >
        <div className="w-12 h-12 object-cover rounded-md mr-3 flex-shrink-0 bg-gray-600 flex items-center justify-center text-lg font-bold">
          {displayIconUrl ? (
            <img
              src={displayIconUrl}
              alt={`${community.name} icon`}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            community.name.charAt(0)
          )}
        </div>

        <div>
          <p className="font-medium text-white">{community.name}</p>
          <p className="text-sm text-gray-400">{community.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            {community.members || `${community.membersCount || 0} members`}
          </p>

          {community.createdByCurrentUser && (
            <p className="text-xs text-amber-400 font-semibold mt-1">
              ⭐ You&apos;re the admin
            </p>
          )}

          {community.category && (
            <p className="text-xs text-gray-400 mt-1">
              Category: {community.category}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
          className={buttonClasses}
          disabled={isJoined}
        >
          {buttonText}
        </button>

        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-full bg-red-900/40 hover:bg-red-800 text-red-300 transition-colors"
            title="Delete community"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const CreateCommunityButton = ({ onCreateCommunity }) => (
  <button
    onClick={onCreateCommunity}
    className="flex items-center bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors shadow-lg"
  >
    <Plus className="w-4 h-4 mr-2" />
    Create Community
  </button>
);

// --- CREATE COMMUNITY MODAL ---
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
    if (!formData.name) newErrors.name = "Community Name is required.";
    if (!formData.description)
      newErrors.description = "Description is required.";
    if (!formData.logoFile) newErrors.logoFile = "Logo is required.";
    // Banner not required anymore
    if (!formData.category) newErrors.category = "Category is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const slug = formData.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const logoUrl = formData.logoFile
      ? URL.createObjectURL(formData.logoFile)
      : `/images/${slug}-logo.png`;

    const bannerUrl = formData.bannerFile
      ? URL.createObjectURL(formData.bannerFile)
      : null;

    const ownerEmail = getCurrentUserEmail() || SITE_OWNER_EMAIL;

    const newCommunity = {
      id: Date.now(),
      name: formData.name,
      membersCount: 1,
      members: "1 member",
      description: formData.description,
      iconUrl: logoUrl,
      bannerUrl: bannerUrl,
      icon: logoUrl,
      slug,
      createdByCurrentUser: true,
      role: "admin",
      ownerEmail,
      category: formData.category,
    };

    onSubmitSuccess(newCommunity);
    alert(`Successfully created and published: ${formData.name}`);

    setFormData({
      name: "",
      description: "",
      bannerFile: null,
      logoFile: null,
      category: "Tech",
    });
    onClose();
  };

  if (!isOpen) return null;

  const FileInput = ({ label, name, file, inputRef, required, error }) => (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && "*"}
      </label>

      <div
        className={`flex items-center justify-between w-full h-12 px-3 border-2 rounded-lg bg-gray-800 ${
          error ? "border-red-500" : "border-dashed border-gray-600"
        }`}
      >
        <span
          className={`text-sm ${file ? "text-white" : "text-gray-400"} truncate`}
        >
          {file ? file.name : "No file selected"}
        </span>

        <button
          type="button"
          onClick={() => {
            if (file) {
              setFormData((prev) => ({ ...prev, [name]: null }));
            } else {
              inputRef.current?.click();
            }
          }}
          className="flex items-center text-gray-400 hover:text-white p-1"
        >
          {file ? <X className="w-4 h-4 mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
          {file ? "Remove" : "Upload"}
        </button>

        <input
          ref={inputRef}
          name={name}
          type="file"
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
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">🚀 Create New Community</h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose} type="button">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
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
            <label className="block text-sm font-medium mb-2 text-gray-300">
              1-Line Description *
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
            <label className="block text-sm font-medium mb-2 text-gray-300">Category *</label>
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
                  <option key={c} value={c} className="bg-gray-900 text-white">
                    {c}
                  </option>
                ))}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

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

// --- MAIN PAGE ---
export default function ExplorePage({
  onNavigateToCommunity,
  onCreateNewCommunity,
  onDeleteCommunity,
  userCreatedCommunities = [],
}) {
  const searchParams = useSearchParams();
  const invitedSlug = searchParams.get("invited");

  // initialize selectedCategory from query param (if present)
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
  const [recommendedCommunities, setRecommendedCommunities] = React.useState(
    initialRecommendedCommunitiesData
  );
  const [selectedCategory, setSelectedCategory] = React.useState(initCategory);
  const [joinedCommunities, setJoinedCommunities] = React.useState(
    userCreatedCommunities.reduce((acc, comm) => ({ ...acc, [comm.id]: true }), {})
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const currentUserEmail =
    typeof window !== "undefined" ? getCurrentUserEmail() : null;
  const isSiteOwner = currentUserEmail === SITE_OWNER_EMAIL;

  // if query param changes while on page (e.g. route from /groups?category=Tech), update selection
  React.useEffect(() => {
    try {
      const q = searchParams.get("category");
      if (q && q.length && q !== selectedCategory) {
        setSelectedCategory(q);
      }
    } catch (e) {
      // ignore
    }
    // only run when the search params string changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  // user clicks "Join"
  const handleJoin = (community) => {
    setJoinedCommunities((prev) => ({ ...prev, [community.id]: true }));

    // notify community owner when someone joins
    if (
      community.ownerEmail &&
      currentUserEmail &&
      community.ownerEmail !== currentUserEmail
    ) {
      pushNotification(community.ownerEmail, {
        type: "JOIN",
        message: `${currentUserEmail} joined your community "${community.name}".`,
        communityId: community.id,
        communityName: community.name,
      });
    }
  };

  // when click card → auto join if not joined, then go to feed
  const handleNavigate = (community) => {
    const isJoined =
      !!joinedCommunities[community.id] || community.createdByCurrentUser;

    if (!isJoined) {
      setJoinedCommunities((prev) => ({
        ...prev,
        [community.id]: true,
      }));
    }

    if (onNavigateToCommunity) {
      onNavigateToCommunity(community);
    }
  };

  const handleNewCommunitySubmission = (newCommunity) => {
    setRecommendedCommunities((prev) => [
      ...prev.filter((c) => c.id !== newCommunity.id),
      newCommunity,
    ]);
    setJoinedCommunities((prev) => ({ ...prev, [newCommunity.id]: true }));

    if (onCreateNewCommunity) {
      onCreateNewCommunity(newCommunity);
    }
  };

  // site owner / community owner delete
  const handleDeleteCommunity = (community) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Are you sure you want to delete the community "${community.name}"?`
      )
    ) {
      return;
    }

    setRecommendedCommunities((prev) =>
      prev.filter((c) => c.id !== community.id)
    );

    setJoinedCommunities((prev) => {
      const copy = { ...prev };
      delete copy[community.id];
      return copy;
    });

    if (onDeleteCommunity) {
      onDeleteCommunity(community);
    }

    alert(`Community "${community.name}" deleted.`);
  };

  const allCommunities = React.useMemo(() => {
    const finalSet = new Map();
    [...initialRecommendedCommunitiesData, ...userCreatedCommunities].forEach(
      (comm) => {
        finalSet.set(comm.id, comm);
      }
    );
    recommendedCommunities.forEach((comm) => {
      finalSet.set(comm.id, comm);
    });
    return Array.from(finalSet.values());
  }, [userCreatedCommunities, recommendedCommunities]);

  const userJoinedCommunities = React.useMemo(() => {
    return allCommunities.filter(
      (community) =>
        !!joinedCommunities[community.id] || community.createdByCurrentUser
    );
  }, [allCommunities, joinedCommunities]);

  const trendingByMembers = React.useMemo(() => {
    const map = new Map();

    [...trendingCommunities, ...allCommunities].forEach((comm) => {
      map.set(comm.id, comm);
    });

    // If user selected a specific category (not "For You"), only show trending in that category
    const list = Array.from(map.values()).sort(
      (a, b) => (b.membersCount || 0) - (a.membersCount || 0)
    );

    return selectedCategory && selectedCategory !== "For You"
      ? list.filter((c) => c.category === selectedCategory)
      : list;
  }, [allCommunities, selectedCategory]);

  const explorableViewCommunities = React.useMemo(() => {
    let list = allCommunities.filter(
      (community) =>
        !(!!joinedCommunities[community.id] || community.createdByCurrentUser)
    );

    // apply category filter (unless 'For You')
    if (selectedCategory && selectedCategory !== "For You") {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (invitedSlug) {
      const index = list.findIndex((community) => community.slug === invitedSlug);
      if (index > 0) {
        const [invitedCommunity] = list.splice(index, 1);
        list.unshift(invitedCommunity);
      }
    }

    return list;
  }, [allCommunities, joinedCommunities, invitedSlug, selectedCategory]);

  const filteredCommunities = React.useMemo(() => {
    // if there's a search term, search across all communities but also respect category
    const lowerSearch = searchTerm.toLowerCase();

    let base = allCommunities;
    if (selectedCategory && selectedCategory !== "For You") {
      base = base.filter((c) => c.category === selectedCategory);
    }

    if (!searchTerm)
      return base.filter(
        (community) =>
          !(!!joinedCommunities[community.id] || community.createdByCurrentUser)
      );

    return base.filter(
      (community) =>
        community.name.toLowerCase().includes(lowerSearch) ||
        (community.description || "").toLowerCase().includes(lowerSearch) ||
        (community.slug || "").includes(lowerSearch)
    );
  }, [allCommunities, searchTerm, joinedCommunities, selectedCategory]);

  // --- APPLYING LIMITS ---
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

  const showRecommendedSeeAll =
    !showAllRecommended &&
    explorableViewCommunities.length > INITIAL_DISPLAY_LIMIT &&
    !searchTerm;

  const showJoinedSeeAll =
    !showAllJoined &&
    userJoinedCommunities.length > JOINED_DISPLAY_LIMIT &&
    !searchTerm;

  const renderCommunityList = (communities) => (
    <div className="space-y-3">
      {communities.map((community) => {
        const isJoined =
          !!joinedCommunities[community.id] || community.createdByCurrentUser;

        const canDelete =
          isSiteOwner ||
          (community.ownerEmail &&
            currentUserEmail &&
            community.ownerEmail === currentUserEmail);

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
      {searchTerm && communities.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No communities found matching "{searchTerm}".
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-4 sm:p-6">
      <CreateCommunityForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSuccess={handleNewCommunitySubmission}
      />

      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Explore</h1>
          <CreateCommunityButton
            onCreateCommunity={() => setIsCreateModalOpen(true)}
          />
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

      {/* Categories */}
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

      {/* Trending Communities */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Trending Communities</h2>

          {trendingByMembers.length > INITIAL_DISPLAY_LIMIT && !showAllTrending && (
            <button
              onClick={() => setShowAllTrending(true)}
              className="text-purple-450 hover:text-purple-650 flex items-center text-sm font-medium"
            >
              See All <ChevronRight className="w-4 h-4 ml-1" />
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

      {/* Joined Communities */}
      {(userJoinedCommunities.length > 0 || searchTerm) && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {searchTerm && userJoinedCommunities.length > 0
                ? `Joined Results (${userJoinedCommunities.length})`
                : "Your Joined Communities"}
            </h2>

            {showJoinedSeeAll && (
              <button
                onClick={() => setShowAllJoined(true)}
                className="text-purple-450 hover:text-purple-450 flex items-center text-sm font-medium"
              >
                See All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>

          {userJoinedCommunities.length > 0 && renderCommunityList(displayJoined)}

          {searchTerm && userJoinedCommunities.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No joined communities match "{searchTerm}".
            </p>
          )}
        </section>
      )}

      {userJoinedCommunities.length > 0 && !searchTerm && (
        <hr className="border-gray-800 my-6" />
      )}

      {/* Communities For You / Search Results */}
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
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>

        {renderCommunityList(displayRecommended)}
      </section>
    </div>
  );
}
