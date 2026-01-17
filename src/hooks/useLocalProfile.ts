import { useState, useEffect, useCallback } from "react";
import type { UserProfile, DiscoverProfile } from "@/types/profile";

const PROFILE_KEY = "biomatch_profile";
const ONBOARDED_KEY = "biomatch_onboarded";
const MATCHES_KEY = "biomatch_matches";
const LIKED_KEY = "biomatch_liked";

// Generate a simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Create empty profile
const createEmptyProfile = (): UserProfile => ({
  id: generateId(),
  displayName: "",
  age: null,
  location: "",
  photos: [],
  lookingFor: "",
  targetAudience: "",
  bio: "",
  promptAnswers: [],
  funFacts: [],
  dataInsights: [],
  yellowcakeData: null,
  socialUsernames: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useLocalProfile = () => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboardedState] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    const onboarded = localStorage.getItem(ONBOARDED_KEY);
    
    if (stored) {
      try {
        setProfileState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored profile:", e);
        setProfileState(createEmptyProfile());
      }
    } else {
      setProfileState(createEmptyProfile());
    }
    
    setHasOnboardedState(onboarded === "true");
    setIsLoading(false);
  }, []);

  // Save profile to localStorage
  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile | null) => UserProfile)) => {
    setProfileState((prev) => {
      const newProfile = typeof updater === "function" ? updater(prev) : updater;
      const updated = { ...newProfile, updatedAt: new Date().toISOString() };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update specific fields
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return createEmptyProfile();
      return { ...prev, ...updates };
    });
  }, [setProfile]);

  // Mark onboarding complete
  const setOnboarded = useCallback((value: boolean) => {
    localStorage.setItem(ONBOARDED_KEY, String(value));
    setHasOnboardedState(value);
  }, []);

  // Reset everything
  const resetProfile = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.removeItem(MATCHES_KEY);
    localStorage.removeItem(LIKED_KEY);
    setProfileState(createEmptyProfile());
    setHasOnboardedState(false);
  }, []);

  return {
    profile,
    setProfile,
    updateProfile,
    isLoading,
    hasOnboarded,
    setOnboarded,
    resetProfile,
  };
};

// Hook for managing likes and matches
export const useLocalMatches = () => {
  const [likedProfiles, setLikedProfilesState] = useState<string[]>([]);
  const [matches, setMatchesState] = useState<DiscoverProfile[]>([]);

  useEffect(() => {
    const liked = localStorage.getItem(LIKED_KEY);
    const matchesData = localStorage.getItem(MATCHES_KEY);
    
    if (liked) setLikedProfilesState(JSON.parse(liked));
    if (matchesData) setMatchesState(JSON.parse(matchesData));
  }, []);

  const likeProfile = useCallback((profileId: string, likedFeature?: string) => {
    setLikedProfilesState((prev) => {
      const updated = [...prev, profileId];
      localStorage.setItem(LIKED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addMatch = useCallback((profile: DiscoverProfile) => {
    setMatchesState((prev) => {
      const updated = [...prev, profile];
      localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasLiked = useCallback((profileId: string) => {
    return likedProfiles.includes(profileId);
  }, [likedProfiles]);

  return {
    likedProfiles,
    matches,
    likeProfile,
    addMatch,
    hasLiked,
  };
};
