import type { YellowcakeData } from "@/types/profile";
import { getHardcodedLetterboxdData } from "./hardcodedLetterboxdData";
import { getHardcodedSpotifyData } from "./hardcodedSpotifyData";
import { getHardcodedTwitterData } from "./hardcodedTwitterData";

// Hardcoded scraped data for live demo - keyed by username "dory"
export const hardcodedYellowcakeData: Record<string, Partial<YellowcakeData>> = {
  // Dory's data - combines all hardcoded Letterboxd, Spotify, and Twitter data
  "dory": {
    ...getHardcodedLetterboxdData(),
    ...getHardcodedSpotifyData(),
    ...getHardcodedTwitterData(),
    // Additional fields if needed
    topRepos: [],
    recentReviews: [],
    sentimentAnalysis: { mood: "Neutral", score: 0.5 },
    codingHours: 0,
    commitCount: 0,
  },
};

// Helper function to get data by username (tries all provided usernames)
export function getHardcodedData(usernames: {
  github?: string;
  letterboxd?: string;
  spotify?: string;
  twitter?: string;
}): Partial<YellowcakeData> | null {
  // Try to match by any provided username
  const keys = [
    usernames.github,
    usernames.spotify,
    usernames.twitter,
    usernames.letterboxd,
  ].filter(Boolean) as string[];

  for (const key of keys) {
    if (hardcodedYellowcakeData[key]) {
      return hardcodedYellowcakeData[key];
    }
  }

  return null;
}
