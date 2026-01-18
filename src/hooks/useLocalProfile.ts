import { useState, useEffect, useCallback } from "react";
import type { UserProfile, DiscoverProfile } from "@/types/profile";
import { savePhoto, loadPhoto, deletePhotos } from "@/lib/photoStorage";

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
  bestFeatures: [],
  yellowcakeData: null,
  socialUsernames: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useLocalProfile = () => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboardedState] = useState(false);

  // Load profile from localStorage on mount and load photos from IndexedDB
  useEffect(() => {
    const loadProfile = async () => {
      const stored = localStorage.getItem(PROFILE_KEY);
      const onboarded = localStorage.getItem(ONBOARDED_KEY);

      if (stored) {
        try {
          const parsedProfile = JSON.parse(stored);

          // Load photos from IndexedDB and populate URLs
          const photosWithUrls = await Promise.all(
            parsedProfile.photos.map(async (photo: { id: string; url?: string; isPrimary: boolean; sortOrder: number }) => {
              // If URL is already a data URL (legacy data), keep it
              // Otherwise load from IndexedDB
              if (photo.url && photo.url.startsWith("data:")) {
                // Save legacy photos to IndexedDB and clear URL from localStorage
                try {
                  await savePhoto(photo.id, photo.url);
                } catch (error) {
                  console.error(`Error migrating photo ${photo.id} to IndexedDB:`, error);
                }
              }

              // Load from IndexedDB
              const url = await loadPhoto(photo.id);
              return {
                ...photo,
                url: url || photo.url || "", // Fallback to existing URL or empty
              };
            })
          );

          setProfileState({
            ...parsedProfile,
            photos: photosWithUrls,
            bestFeatures: parsedProfile.bestFeatures || [], // Ensure bestFeatures exists for backward compatibility
          });
        } catch (e) {
          console.error("Failed to parse stored profile:", e);
          setProfileState(createEmptyProfile());
        }
      } else {
        setProfileState(createEmptyProfile());
      }

      setHasOnboardedState(onboarded === "true");
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  // Save profile to localStorage (without photo URLs - photos stored in IndexedDB)
  const setProfile = useCallback((updater: UserProfile | ((prev: UserProfile | null) => UserProfile)) => {
    setProfileState((prev) => {
      const newProfile = typeof updater === "function" ? updater(prev) : updater;
      const updated = { ...newProfile, updatedAt: new Date().toISOString() };

      // Store photos in IndexedDB asynchronously (fire-and-forget)
      const photosToSave = updated.photos.filter(photo => photo.url && photo.url.startsWith("data:"));
      if (photosToSave.length > 0) {
        // Save new photos to IndexedDB asynchronously (don't await)
        Promise.all(
          photosToSave.map(photo => savePhoto(photo.id, photo.url))
        ).catch(error => {
          console.error("Error saving photos to IndexedDB:", error);
        });
      }

      // Create profile copy without photo URLs for localStorage
      const profileForStorage = {
        ...updated,
        photos: updated.photos.map(({ id, isPrimary, sortOrder }) => ({
          id,
          isPrimary,
          sortOrder,
          url: "", // Don't store data URLs in localStorage
        })),
      };

      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profileForStorage));
      } catch (error) {
        // If still hitting quota, try with photos completely removed
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
          console.warn("localStorage quota exceeded, storing profile without photos metadata");
          const minimalProfile = {
            ...profileForStorage,
            photos: [],
          };
          try {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(minimalProfile));
          } catch (retryError) {
            console.error("Failed to save profile even without photos:", retryError);
          }
        } else {
          throw error;
        }
      }

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
    // Delete photos from IndexedDB asynchronously (fire-and-forget)
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        const parsedProfile = JSON.parse(stored);
        if (parsedProfile.photos && parsedProfile.photos.length > 0) {
          const photoIds = parsedProfile.photos.map((photo: { id: string }) => photo.id);
          // Delete photos asynchronously (don't await)
          deletePhotos(photoIds).catch(error => {
            console.error("Error deleting photos from IndexedDB:", error);
          });
        }
      } catch (error) {
        console.error("Error parsing profile for photo deletion:", error);
      }
    }

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
