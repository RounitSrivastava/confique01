// /groups/ExplorePage.jsx
"use client";
import React from 'react';
import { Search, ChevronRight } from 'lucide-react'; 

// --- Dummy Data ---
const categories = ['For You', 'Gaming', 'Sports', 'Music', 'Tech', 'Art'];
const trendingCommunities = [
  { id: 101, name: 'Pixel Warriors', members: '12.4k', background: 'bg-gradient-to-br from-black to-black', isImage: false, slug: 'pixel-warriors' },
  { id: 102, name: 'Goal Getters Club', members: '8.1k', image: '/images/soccer-net.jpg', isImage: true, slug: 'goal-getters-club' },
];
const recommendedCommunitiesData = [
  { id: 1, name: 'Tech Innovators', members: '23.7k', description: 'Discussions on next-gen tech.', icon: '/images/tech-icon.png', slug: 'tech-innovators' },
  { id: 2, name: 'Adventurers Unite', members: '15.2k', description: 'Share your travel stories & tips.', icon: '/images/adventure-icon.png', slug: 'adventurers-unite' },
  { id: 3, name: 'Bake Off Club', members: '9.8k', description: 'Recipes, tips, and baking tricks.', icon: '/images/bake-icon.png', slug: 'bake-off-club' },
];


// --- Sub-Components ---

const CategoryPill = ({ name, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 whitespace-nowrap
      ${isSelected
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
    {/* Background/Image Section */}
    {community.isImage ? (
      <img
        src={community.image}
        alt={community.name}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className={`w-full h-full ${community.background}`}></div>
    )}

    {/* Text Overlay */}
    <div className="absolute inset-0 p-3 flex flex-col justify-end text-white bg-black bg-opacity-30">
      <p className="font-semibold text-base leading-snug">{community.name}</p>
      <p className="text-xs text-gray-200">{community.members} members</p>
    </div>
  </div>
);

const RecommendedItem = ({ community, isJoined, onJoin, onNavigate }) => {
    // Determine button classes and text based on the joined status
    const buttonClasses = isJoined
      ? 'bg-white text-black font-medium py-1.5 px-4 rounded-full text-sm transition-colors'
      : 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-full text-sm transition-colors';
    
    const buttonText = isJoined ? 'Joined' : 'Join';

    // Logic: Only navigate via content click if the user is ALREADY joined.
    const handleContentClick = () => {
        if (isJoined && onNavigate) { 
            onNavigate(community);
        }
    };

    // Change cursor based on joined status for visual feedback
    const contentClasses = `flex items-center flex-grow pr-4 rounded-lg -mx-2 px-2 py-1 transition-colors 
        ${isJoined ? 'cursor-pointer hover:bg-gray-800' : 'cursor-default'}`;

    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
            {/* Clickable Area for Community Content */}
            <div 
                className={contentClasses}
                onClick={handleContentClick} 
            >
                {/* Icon/Image */}
                <img
                    src={community.icon}
                    alt={`${community.name} icon`}
                    className="w-12 h-12 object-cover rounded-md mr-3 flex-shrink-0"
                />
                {/* Text */}
                <div>
                    <p className="font-medium text-white">{community.name}</p>
                    <p className="text-sm text-gray-400">{community.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{community.members} members</p>
                </div>
            </div>
            {/* Join Button: This only updates state */}
            <button 
                // e.stopPropagation prevents the outer div's handleContentClick from firing
                onClick={(e) => { e.stopPropagation(); onJoin(); }} 
                className={buttonClasses}
                disabled={isJoined}
            >
                {buttonText}
            </button>
        </div>
    );
};

// --- Main Component ---

export default function ExplorePage({ onNavigateToCommunity }) {
    
    const [selectedCategory, setSelectedCategory] = React.useState('For You');
    const [joinedCommunities, setJoinedCommunities] = React.useState({}); 

    // 🛑 CRITICAL CHANGE: handleJoin ONLY updates the state. It does NOT navigate.
    // Navigation is now handled by the subsequent click on the row content.
    const handleJoin = (community) => {
        // 1. Update state to 'Joined', which updates the button visually.
        setJoinedCommunities(prev => ({
            ...prev,
            [community.id]: true 
        }));
        
        // 2. Navigation trigger removed!
    };
    
    // Universal handler for navigating (used by content clicks and trending cards)
    const handleNavigate = (community) => {
        if (onNavigateToCommunity) {
             onNavigateToCommunity(community);
        }
    };


    return (
        <div className="min-h-screen bg-black-900 text-white p-4 sm:p-6">
            
            <header className="mb-6">
                <h1 className="text-3xl font-bold mb-4">Explore</h1>
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search communities..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </header>

            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Categories</h2>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <CategoryPill
                            key={category}
                            name={category}
                            isSelected={category === selectedCategory}
                            onClick={() => setSelectedCategory(category)}
                        />
                    ))}
                </div>
            </section>

            <hr className="border-gray-800 my-6" />

            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Trending Communities</h2>
                    <button className="text-blue-400 hover:text-blue-300 flex items-center text-sm font-medium">
                        See All <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                <div className="flex overflow-x-auto pb-2 -mr-4">
                    {trendingCommunities.map((community) => (
                        <TrendingCard 
                            key={community.id} 
                            community={community} 
                            onNavigate={handleNavigate} 
                        />
                    ))}
                </div>
            </section>

            <hr className="border-gray-800 my-6" />

            {/* Communities For You */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Communities For You</h2>
                    <button className="text-blue-400 hover:text-blue-300 flex items-center text-sm font-medium">
                        See All <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
                <div className="space-y-3">
                    {recommendedCommunitiesData.map((community) => (
                        <RecommendedItem 
                            key={community.id} 
                            community={community}
                            isJoined={!!joinedCommunities[community.id]} 
                            onJoin={() => handleJoin(community)} 
                            onNavigate={handleNavigate}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}