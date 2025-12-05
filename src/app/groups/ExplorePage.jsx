// /groups/ExplorePage.jsx
"use client";
import React from "react";
import { Search, ChevronRight, Plus, X, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation"; // 🔴 NEW IMPORT

// --- CONSTANTS ---
const INITIAL_DISPLAY_LIMIT = 5;
const JOINED_DISPLAY_LIMIT = 3;

// --- DUMMY DATA ---
const categories = ["For You", "Gaming", "Sports", "Music", "Tech", "Art"];

const trendingCommunities = [
  {
    id: 101,
    name: "Pixel Warriors",
    members: "12.4k",
    background: "bg-gradient-to-br from-black to-black",
    isImage: false,
    slug: "pixel-warriors",
  },
  {
    id: 102,
    name: "Goal Getters Club",
    members: "8.1k",
    image: "/images/soccer-net.jpg",
    isImage: true,
    slug: "goal-getters-club",
  },
  {
    id: 103,
    name: "Crypto Hub",
    members: "32.0k",
    background: "bg-gradient-to-r from-yellow-500 to-amber-700",
    isImage: false,
    slug: "crypto-hub",
  },
  {
    id: 104,
    name: "Foodies Delight",
    members: "15.9k",
    background: "bg-gradient-to-r from-red-500 to-red-700",
    isImage: false,
    slug: "foodies-delight",
  },
  {
    id: 105,
    name: "Space Nerds",
    members: "9.3k",
    background: "bg-gradient-to-r from-purple-600",
    isImage: false,
    slug: "space-nerds",
  },
  {
    id: 106,
    name: "Book Worms HQ",
    members: "11.2k",
    background: "bg-gradient-to-r from-gray-700 to-gray-800",
    isImage: false,
    slug: "book-worms",
  },
];

const initialRecommendedCommunitiesData = [
  {
    id: 1,
    name: "Tech Innovators",
    members: "23.7k members",
    description: "Discussions on next-gen tech.",
    icon: "/images/tech-icon.png",
    iconUrl: "/images/tech-icon.png",
    slug: "tech-innovators",
  },
  {
    id: 2,
    name: "Adventurers Unite",
    members: "15.2k members",
    description: "Share your travel stories & tips.",
    icon: "/images/adventure-icon.png",
    iconUrl: "/images/adventure-icon.png",
    slug: "adventurers-unite",
  },
  {
    id: 3,
    name: "Bake Off Club",
    members: "9.8k members",
    description: "Recipes, tips, and baking tricks.",
    icon: "/images/bake-icon.png",
    iconUrl: "/images/bake-icon.png",
    slug: "bake-off-club",
  },
  {
    id: 4,
    name: "Fitness Fanatics",
    members: "55.0k members",
    description: "Workouts and nutrition advice.",
    icon: "/images/fitness-icon.png",
    iconUrl: "/images/fitness-icon.png",
    slug: "fitness-fanatics",
  },
  {
    id: 5,
    name: "DIY Masters",
    members: "18.3k members",
    description: "Home improvement and crafting.",
    icon: "/images/diy-icon.png",
    iconUrl: "/images/diy-icon.png",
    slug: "diy-masters",
  },
  {
    id: 6,
    name: "Photography Pros",
    members: "20.1k members",
    description: "Share your best shots and gear talk.",
    icon: "/images/photo-icon.png",
    iconUrl: "/images/photo-icon.png",
    slug: "photography-pros",
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
        className="w-full h-full object-cover"
      />
    ) : (
      <div className={`w-full h-full ${community.background}`} />
    )}

    <div className="absolute inset-0 p-3 flex flex-col justify-end text-white bg-black bg-opacity-30">
      <p className="font-semibold text-base leading-snug">{community.name}</p>
      <p className="text-xs text-gray-200">{community.members} members</p>
    </div>
  </div>
);

const RecommendedItem = ({ community, isJoined, onJoin, onNavigate }) => {
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
          <p className="text-xs text-gray-500 mt-1">{community.members}</p>

          {community.createdByCurrentUser && (
            <p className="text-xs text-amber-400 font-semibold mt-1">
              ⭐ You&apos;re the admin
            </p>
          )}
        </div>
      </div>

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
    if (!formData.description) newErrors.description = "Description is required.";
    if (!formData.logoFile) newErrors.logoFile = "Logo is required.";
    if (!formData.bannerFile) newErrors.bannerFile = "Banner is required.";

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
      : `/images/${slug}-banner.jpg`;

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
    };

    onSubmitSuccess(newCommunity);
    alert(`Successfully created and published: ${formData.name}`);

    setFormData({
      name: "",
      description: "",
      bannerFile: null,
      logoFile: null,
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
          className={`text-sm ${
            file ? "text-white" : "text-gray-400"
          } truncate`}
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
          <button
            className="text-gray-400 hover:text-white"
            onClick={onClose}
            type="button"
          >
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
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
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
              label="Community Banner"
              name="bannerFile"
              file={formData.bannerFile}
              required
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
  userCreatedCommunities = [],
}) {
  // 🔴 Read invite slug from query
  const searchParams = useSearchParams();
  const invitedSlug = searchParams.get("invited");

  const [showAllTrending, setShowAllTrending] = React.useState(false);
  const [showAllRecommended, setShowAllRecommended] = React.useState(false);
  const [showAllJoined, setShowAllJoined] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [recommendedCommunities, setRecommendedCommunities] = React.useState(
    initialRecommendedCommunitiesData
  );
  const [selectedCategory, setSelectedCategory] = React.useState("For You");
  const [joinedCommunities, setJoinedCommunities] = React.useState(
    userCreatedCommunities.reduce(
      (acc, comm) => ({ ...acc, [comm.id]: true }),
      {}
    )
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleJoin = (community) => {
    setJoinedCommunities((prev) => ({ ...prev, [community.id]: true }));
  };

  const handleNavigate = (community) => {
    if (onNavigateToCommunity) onNavigateToCommunity(community);
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

  // 🔴 Explorable communities (unjoined) + "invited" reordering
  const explorableViewCommunities = React.useMemo(() => {
    let list = allCommunities.filter(
      (community) =>
        !(!!joinedCommunities[community.id] || community.createdByCurrentUser)
    );

    // If user came via invite link, move that community to the top
    if (invitedSlug) {
      const index = list.findIndex(
        (community) => community.slug === invitedSlug
      );
      if (index > 0) {
        const [invitedCommunity] = list.splice(index, 1);
        list.unshift(invitedCommunity);
      }
    }

    return list;
  }, [allCommunities, joinedCommunities, invitedSlug]);

  const filteredCommunities = React.useMemo(() => {
    if (!searchTerm) return explorableViewCommunities;

    const lowerSearch = searchTerm.toLowerCase();

    return allCommunities.filter(
      (community) =>
        community.name.toLowerCase().includes(lowerSearch) ||
        community.description.toLowerCase().includes(lowerSearch) ||
        community.slug.includes(lowerSearch)
    );
  }, [allCommunities, searchTerm, explorableViewCommunities]);

  // --- APPLYING LIMITS ---
  const displayTrending = showAllTrending
    ? trendingCommunities
    : trendingCommunities.slice(0, INITIAL_DISPLAY_LIMIT);

  const displayJoined = showAllJoined || searchTerm
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
      {communities.map((community) => (
        <RecommendedItem
          key={community.id}
          community={community}
          isJoined={
            !!joinedCommunities[community.id] || community.createdByCurrentUser
          }
          onJoin={() => handleJoin(community)}
          onNavigate={handleNavigate}
        />
      ))}
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

          {trendingCommunities.length > INITIAL_DISPLAY_LIMIT &&
            !showAllTrending && (
              <button
                onClick={() => setShowAllTrending(true)}
                className="text-purple-450 hover:text-purple-650 flex items-center text-sm font-medium"
              >
                See All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
        </div>

        <div className="flex overflow-x-auto pb-2 -mr-4">
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

          {userJoinedCommunities.length > 0 &&
            renderCommunityList(displayJoined)}

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
