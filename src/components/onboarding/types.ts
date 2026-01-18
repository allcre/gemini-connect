export interface OnboardingFormData {
  displayName: string;
  age: string;
  location: string;
  githubUsername: string;
  letterboxdUsername: string;
  spotifyUsername: string;
  twitterUsername: string;
  substackUsername: string;
  steamUsername: string;
  aboutMe: string;
  targetAudience: string;
  highlights: string;
  lookingFor: string;
  photos: string[];
}

export interface StepProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: string | string[]) => void;
  selectedPlatforms?: string[];
  setSelectedPlatforms?: (platforms: string[]) => void;
}
