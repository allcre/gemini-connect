import { useState, useEffect, useCallback } from "react";
import { UserProfile, createEmptyProfile, PromptAnswer, FunFact, DataInsight, Photo } from "@/types/profile";

const PROFILE_STORAGE_KEY = "biomatch_profile";
const ONBOARDED_KEY = "biomatch_onboarded";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    const onboarded = localStorage.getItem(ONBOARDED_KEY);
    
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        setProfile(createEmptyProfile());
      }
    } else {
      setProfile(createEmptyProfile());
    }
    
    setHasOnboarded(onboarded === "true");
    setIsLoading(false);
  }, []);

  // Save profile to localStorage whenever it changes
  const saveProfile = useCallback((updatedProfile: UserProfile) => {
    const profileToSave = {
      ...updatedProfile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
    setProfile(profileToSave);
  }, []);

  // Mark onboarding as complete
  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    setHasOnboarded(true);
  }, []);

  // Update specific profile fields
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!profile) return;
    saveProfile({ ...profile, ...updates });
  }, [profile, saveProfile]);

  // Update bio
  const updateBio = useCallback((bio: string) => {
    updateProfile({ bio });
  }, [updateProfile]);

  // Add/update prompt answer
  const upsertPromptAnswer = useCallback((promptAnswer: PromptAnswer) => {
    if (!profile) return;
    const existing = profile.promptAnswers.findIndex(p => p.id === promptAnswer.id);
    const promptAnswers = [...profile.promptAnswers];
    
    if (existing >= 0) {
      promptAnswers[existing] = promptAnswer;
    } else {
      promptAnswers.push(promptAnswer);
    }
    
    saveProfile({ ...profile, promptAnswers });
  }, [profile, saveProfile]);

  // Remove prompt answer
  const removePromptAnswer = useCallback((id: string) => {
    if (!profile) return;
    saveProfile({
      ...profile,
      promptAnswers: profile.promptAnswers.filter(p => p.id !== id),
    });
  }, [profile, saveProfile]);

  // Add/update fun fact
  const upsertFunFact = useCallback((funFact: FunFact) => {
    if (!profile) return;
    const existing = profile.funFacts.findIndex(f => f.id === funFact.id);
    const funFacts = [...profile.funFacts];
    
    if (existing >= 0) {
      funFacts[existing] = funFact;
    } else {
      funFacts.push(funFact);
    }
    
    saveProfile({ ...profile, funFacts });
  }, [profile, saveProfile]);

  // Remove fun fact
  const removeFunFact = useCallback((id: string) => {
    if (!profile) return;
    saveProfile({
      ...profile,
      funFacts: profile.funFacts.filter(f => f.id !== id),
    });
  }, [profile, saveProfile]);

  // Add/update data insight
  const upsertDataInsight = useCallback((dataInsight: DataInsight) => {
    if (!profile) return;
    const existing = profile.dataInsights.findIndex(d => d.id === dataInsight.id);
    const dataInsights = [...profile.dataInsights];
    
    if (existing >= 0) {
      dataInsights[existing] = dataInsight;
    } else {
      dataInsights.push(dataInsight);
    }
    
    saveProfile({ ...profile, dataInsights });
  }, [profile, saveProfile]);

  // Remove data insight
  const removeDataInsight = useCallback((id: string) => {
    if (!profile) return;
    saveProfile({
      ...profile,
      dataInsights: profile.dataInsights.filter(d => d.id !== id),
    });
  }, [profile, saveProfile]);

  // Update photos
  const updatePhotos = useCallback((photos: Photo[]) => {
    if (!profile) return;
    saveProfile({ ...profile, photos });
  }, [profile, saveProfile]);

  // Bulk update from AI generation
  const applyAIGeneratedProfile = useCallback((
    generated: {
      bio?: string;
      promptAnswers?: PromptAnswer[];
      funFacts?: FunFact[];
      dataInsights?: DataInsight[];
    }
  ) => {
    if (!profile) return;
    saveProfile({
      ...profile,
      ...(generated.bio && { bio: generated.bio }),
      ...(generated.promptAnswers && { promptAnswers: generated.promptAnswers }),
      ...(generated.funFacts && { funFacts: generated.funFacts }),
      ...(generated.dataInsights && { dataInsights: generated.dataInsights }),
    });
  }, [profile, saveProfile]);

  // Reset profile (for debugging/testing)
  const resetProfile = useCallback(() => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(ONBOARDED_KEY);
    setProfile(createEmptyProfile());
    setHasOnboarded(false);
  }, []);

  return {
    profile,
    isLoading,
    hasOnboarded,
    saveProfile,
    updateProfile,
    updateBio,
    upsertPromptAnswer,
    removePromptAnswer,
    upsertFunFact,
    removeFunFact,
    upsertDataInsight,
    removeDataInsight,
    updatePhotos,
    applyAIGeneratedProfile,
    completeOnboarding,
    resetProfile,
  };
}
