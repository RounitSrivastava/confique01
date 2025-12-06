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
    setUserCreatedCommunities((prev) => [...prev, newCommunity]);
    // Optional: directly open the new community in Feed
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
        onDeleteCommunity={handleDeleteCommunity} // ⭐ site owner / admin delete
      />
    );
  }

  // Default: show Explore
  return (
    <ExplorePage
      onNavigateToCommunity={handleNavigateToCommunity}
      onCreateNewCommunity={handleCreateNewCommunity} // from CreateCommunityForm
      onDeleteCommunity={handleDeleteCommunity}       // from Explore delete
      userCreatedCommunities={userCreatedCommunities}
    />
  );
}
