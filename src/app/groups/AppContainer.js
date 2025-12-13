// /groups/AppContainer.js
"use client";
import React, { useState } from "react";
import ExplorePage from "./ExplorePage";
import CommunityFeedPage from "./CommunityFeedPage";

export default function AppContainer() {
  // 1. Which page is visible?
  const [currentPage, setCurrentPage] = useState("explore");

  // 2. Which community is currently opened in Feed?
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  // 3. All communities created by users in this session
  const [userCreatedCommunities, setUserCreatedCommunities] = useState([]);

  // ---- NAVIGATION HANDLERS ----

  // When user clicks a community in Explore → open Feed
  const handleNavigateToCommunity = (community) => {
    setSelectedCommunity(community);
    setCurrentPage("feed");
  };

  // Go back from Feed to Explore
  const handleGoBack = () => {
    setSelectedCommunity(null);
    setCurrentPage("explore");
  };

  // When a new community is created from Explore
  const handleCreateNewCommunity = (newCommunity) => {
    // Add to user-created list only if it doesn't already exist (defensive against duplicates)
    setUserCreatedCommunities((prev) => {
      if (prev.some(c => c.id === newCommunity.id)) return prev;
      return [...prev, newCommunity];
    });
    setSelectedCommunity(newCommunity);
    setCurrentPage("feed");
  };

  // When a community is deleted (from Explore OR Feed)
  const handleDeleteCommunity = (community) => {
    // Remove from user-created list
    setUserCreatedCommunities((prev) =>
      prev.filter((c) => c.id !== community.id)
    );

    // If we are currently inside that community's Feed, go back to Explore
    if (selectedCommunity && selectedCommunity.id === community.id) {
      setSelectedCommunity(null);
      setCurrentPage("explore");
    }
  };

  // ---- CONDITIONAL RENDER ----
  if (currentPage === "feed" && selectedCommunity) {
    return (
      <CommunityFeedPage
        community={selectedCommunity}
        onGoBack={handleGoBack}
        onDeleteCommunity={handleDeleteCommunity}
      />
    );
  }

  if (currentPage === "explore") {
    // Default: show Explore
    return (
      <ExplorePage
        onNavigateToCommunity={handleNavigateToCommunity}
        onCreateNewCommunity={handleCreateNewCommunity}
        onDeleteCommunity={handleDeleteCommunity}
        userCreatedCommunities={userCreatedCommunities}
      />
    );
  }

  // Fallback for any unknown state (highly unlikely)
  return null; 
}