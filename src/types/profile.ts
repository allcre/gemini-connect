// Hinge-style Profile Data Model

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
  topRepos: { name: string; stars: number; language: string }[];
  musicGenres: string[];
  recentReviews: { title: string; rating: number; type: string }[];
  sentimentAnalysis: { mood: string; score: number };
  codingHours: number;
  movieHours: number;
  topArtists?: string[];
  playlistSongs?: Array<{ track_name: string; artist_name: string }>;
  githubRepos?: Array<{ name: string; description: string }>;
  tweets?: Array<{ text: string }>;
  substackPosts?: Array<{ title: string; text: string }>;
  steamGames?: Array<{ game_name: string; hours_played?: any }>;
  letterboxdFilms?: Array<{ film_title: string; rating: string | number | null }>;
  avgLetterboxdRating?: number;
  totalFilmsWatched?: number;
  commitCount?: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  age: number | null;
  location: string;
  gender?: string;
  orientation?: string;
  photos: Photo[];
  lookingFor: string;
  targetAudience: string;
  bio: string;
  promptAnswers: PromptAnswer[];
  funFacts: FunFact[];
  dataInsights: DataInsight[];
  yellowcakeData: YellowcakeData | null;
  socialUsernames: {
    github?: string;
    letterboxd?: string;
    spotify?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Content item for interleaved display
export type ProfileContentItem =
  | { type: "photo"; data: Photo }
  | { type: "prompt"; data: PromptAnswer }
  | { type: "funFact"; data: FunFact }
  | { type: "dataInsight"; data: DataInsight };

// For discovery feed profiles (other users)
export interface DiscoverProfile extends UserProfile {
  compatibilityScore: number;
  bestFeatures: string[];
}
