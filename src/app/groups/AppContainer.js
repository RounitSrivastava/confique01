// /groups/AppContainer.js
"use client";
import React, { useState } from 'react';
import ExplorePage from './ExplorePage'; 
import CommunityFeedPage from './CommunityFeedPage';

export default function AppContainer() {
    const [currentPage, setCurrentPage] = useState('explore');
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    const handleNavigateToCommunity = (community) => {
        setSelectedCommunity(community);
        setCurrentPage('feed');
    };

    const handleGoBack = () => {
        setSelectedCommunity(null);
        setCurrentPage('explore');
    };

    if (currentPage === 'feed' && selectedCommunity) {
        return <CommunityFeedPage community={selectedCommunity} onGoBack={handleGoBack} />;
    }

    return <ExplorePage onNavigateToCommunity={handleNavigateToCommunity} />;
}