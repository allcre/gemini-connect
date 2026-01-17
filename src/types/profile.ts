// Profile data model inspired by Hinge

export interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PromptAnswer {
  id: string;
  promptId: string;
  promptText: string;
  answerText: string;
  source: "user" | "llm";
  sortOrder: number;
}

export interface FunFact {
  id: string;
  label: string;
  value: string;
  source: "yellowcake" | "user" | "llm";
  icon?: string;
  sortOrder: number;
}

export interface DataInsight {
  id: string;
  type: "stat" | "badge" | "chart";
  title: string;
  description: string;
  metricKey: string;
  metricValue: number | string;
  visualizationHint?: "pill" | "bar" | "simple";
  source: "yellowcake" | "llm";
  sortOrder: number;
}

export interface YellowcakeData {
  topRepos: string[];
  musicGenres: string[];
  recentReviews: string[];
  sentimentAnalysis: {
    overall: string;
    keywords: string[];
  };
  stats: {
    totalCommits?: number;
    moviesWatched?: number;
    avgRating?: number;
    topArtist?: string;
    hoursListened?: number;
  };
}

export interface UserProfile {
  id: string;
  displayName: string;
  age?: number;
  location?: string;
  gender?: string;
  orientation?: string;
  lookingFor: string;
  targetAudience: string;
  bio: string;
  
  // External usernames for data fetching
  githubUsername?: string;
  letterboxdUsername?: string;
  spotifyUsername?: string;
  
  // Content
  photos: Photo[];
  promptAnswers: PromptAnswer[];
  funFacts: FunFact[];
  dataInsights: DataInsight[];
  
  // Raw scraped data
  yellowcakeData?: YellowcakeData;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Prompt catalog for Hinge-style prompts
export const PROMPT_CATALOG = [
  { id: "shower-thought", text: "A shower thought I recently had..." },
  { id: "green-flag", text: "A green flag I look for..." },
  { id: "unpopular-opinion", text: "My most unpopular opinion..." },
  { id: "typical-sunday", text: "A typical Sunday looks like..." },
  { id: "never-shut-up", text: "I'll never shut up about..." },
  { id: "together-we-could", text: "Together we could..." },
  { id: "geek-out", text: "I geek out on..." },
  { id: "simple-pleasures", text: "My simple pleasures..." },
  { id: "love-language", text: "My love language is..." },
  { id: "proudest-moment", text: "I'm weirdly proud of..." },
  { id: "dating-me", text: "Dating me is like..." },
  { id: "worst-idea", text: "The worst idea I've ever had..." },
] as const;

export type PromptId = typeof PROMPT_CATALOG[number]["id"];

// Content item for interleaved rendering
export type ProfileContentItem = 
  | { type: "photo"; data: Photo }
  | { type: "prompt"; data: PromptAnswer }
  | { type: "funFact"; data: FunFact }
  | { type: "dataInsight"; data: DataInsight };

// Helper to create interleaved content for profile display
export function getInterleavedContent(profile: UserProfile): ProfileContentItem[] {
  const items: ProfileContentItem[] = [
    ...profile.photos.map(p => ({ type: "photo" as const, data: p })),
    ...profile.promptAnswers.map(p => ({ type: "prompt" as const, data: p })),
    ...profile.funFacts.map(f => ({ type: "funFact" as const, data: f })),
    ...profile.dataInsights.map(d => ({ type: "dataInsight" as const, data: d })),
  ];
  
  return items.sort((a, b) => a.data.sortOrder - b.data.sortOrder);
}

// Default empty profile
export function createEmptyProfile(): UserProfile {
  return {
    id: crypto.randomUUID(),
    displayName: "",
    lookingFor: "",
    targetAudience: "",
    bio: "",
    photos: [],
    promptAnswers: [],
    funFacts: [],
    dataInsights: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
