"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ExplorePage from "./ExplorePage";
import CommunityFeedPage from "./CommunityFeedPage";

export default function AppContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. State for current view
  const [currentPage, setCurrentPage] = useState("explore");
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  // 2. Sync URL with State
  useEffect(() => {
    const cParam = searchParams.get('c');
    if (cParam) {
      try {
        const community = JSON.parse(atob(cParam));
        setSelectedCommunity(community);
        setCurrentPage("feed");
      } catch (e) {
        setSelectedCommunity(null);
        setCurrentPage("explore");
      }
    } else {
      setSelectedCommunity(null);
      setCurrentPage("explore");
    }
  }, [searchParams]);

  // 3. Communities created by user in this session
  const [userCreatedCommunities, setUserCreatedCommunities] = useState([]);

  // ---- NAVIGATION HANDLERS ----

  const handleNavigateToCommunity = (community) => {
    const encoded = btoa(JSON.stringify(community));
    router.push(`/groups?c=${encoded}`);
  };

  const handleGoBack = () => {
    router.push(`/groups`);
  };

  const handleCreateNewCommunity = (newCommunity) => {
    setUserCreatedCommunities((prev) => {
      if (prev.some(c => c.id === newCommunity.id)) return prev;
      return [...prev, newCommunity];
    });
    handleNavigateToCommunity(newCommunity);
  };

  const handleDeleteCommunity = (community) => {
    setUserCreatedCommunities((prev) =>
      prev.filter((c) => c.id !== community.id)
    );
    if (selectedCommunity && selectedCommunity.id === community.id) {
      handleGoBack();
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