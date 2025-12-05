// /groups/AppContainer.js
"use client";
import React, { useState } from 'react';
import ExplorePage from './ExplorePage'; 
import CommunityFeedPage from './CommunityFeedPage';

export default function AppContainer() {
    // 1. State to track the current view and selected data
    const [currentPage, setCurrentPage] = useState('explore');
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    // 2. Navigation Handler: Switches from Explore to Feed
    const handleNavigateToCommunity = (community) => {
        // Store the community data
        setSelectedCommunity(community);
        // Switch the view
        setCurrentPage('feed');
    };

    // 3. Navigation Handler: Switches back from Feed to Explore
    const handleGoBack = () => {
        // Clear the community data
        setSelectedCommunity(null);
        // Switch the view back
        setCurrentPage('explore');
    };

    // 4. Conditional Rendering Logic: If a community is selected, show the feed.
    if (currentPage === 'feed' && selectedCommunity) {
        return <CommunityFeedPage community={selectedCommunity} onGoBack={handleGoBack} />;
    }

    // 5. Default Rendering: Otherwise, show the explore page.
    return <ExplorePage onNavigateToCommunity={handleNavigateToCommunity} />;
}