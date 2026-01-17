import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

// Mock profile data for the discovery feed
export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  photo: string;
  bio: string;
  targetAudience: string;
  yellowcakeData: {
    topRepos: { name: string; stars: number; language: string }[];
    musicGenres: string[];
    recentReviews: { title: string; rating: number; type: string }[];
    sentimentAnalysis: { mood: string; score: number };
    codingHours: number;
    movieHours: number;
  };
  compatibilityScore: number;
  bestFeatures: string[];
}

export const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Maya Chen",
    age: 26,
    location: "San Francisco, CA",
    photo: profile1,
    bio: "Code by day, cinema by night. My Letterboxd is basically my love language. Looking for someone to debug life's edge cases with.",
    targetAudience: "Thoughtful tech enthusiasts",
    yellowcakeData: {
      topRepos: [
        { name: "neural-art-generator", stars: 342, language: "Python" },
        { name: "indie-film-api", stars: 89, language: "TypeScript" },
      ],
      musicGenres: ["Indie Folk", "Lo-fi", "Jazz Hop"],
      recentReviews: [
        { title: "Past Lives", rating: 5, type: "movie" },
        { title: "Everything Everywhere All at Once", rating: 5, type: "movie" },
        { title: "Aftersun", rating: 4.5, type: "movie" },
      ],
      sentimentAnalysis: { mood: "Contemplative", score: 0.78 },
      codingHours: 32,
      movieHours: 14,
    },
    compatibilityScore: 94,
    bestFeatures: ["A24 film connoisseur", "Open source contributor", "Cozy coffee shop energy"],
  },
  {
    id: "2",
    name: "Jordan Rivera",
    age: 28,
    location: "Austin, TX",
    photo: profile2,
    bio: "Full-stack human. Building startups, playlists, and hopefully something real. My GitHub activity graph is greener than my thumb.",
    targetAudience: "Creative entrepreneurs",
    yellowcakeData: {
      topRepos: [
        { name: "startup-boilerplate", stars: 1204, language: "TypeScript" },
        { name: "music-viz-react", stars: 567, language: "JavaScript" },
      ],
      musicGenres: ["Electronic", "Synthwave", "Alternative Rock"],
      recentReviews: [
        { title: "Dune: Part Two", rating: 4.5, type: "movie" },
        { title: "The Bear (Season 2)", rating: 5, type: "show" },
      ],
      sentimentAnalysis: { mood: "Energetic", score: 0.85 },
      codingHours: 45,
      movieHours: 8,
    },
    compatibilityScore: 87,
    bestFeatures: ["1000+ GitHub stars", "Festival energy", "Actually replies to texts"],
  },
  {
    id: "3",
    name: "Alex Kim",
    age: 24,
    location: "Brooklyn, NY",
    photo: profile3,
    bio: "Pixel artist turned software engineer. My commit messages are poetry. Let's get lost in a museum or a really good README.",
    targetAudience: "Art-loving introverts",
    yellowcakeData: {
      topRepos: [
        { name: "pixel-art-editor", stars: 2341, language: "Rust" },
        { name: "generative-patterns", stars: 432, language: "Processing" },
      ],
      musicGenres: ["Ambient", "Classical Crossover", "Chillwave"],
      recentReviews: [
        { title: "The Last of Us", rating: 5, type: "show" },
        { title: "Spider-Man: Across the Spider-Verse", rating: 5, type: "movie" },
      ],
      sentimentAnalysis: { mood: "Creative", score: 0.92 },
      codingHours: 28,
      movieHours: 18,
    },
    compatibilityScore: 91,
    bestFeatures: ["Viral pixel art creator", "Museum regular", "Makes the best playlists"],
  },
];

// Mock Yellowcake API response
export const mockYellowcakeResponse = {
  top_repos: [
    { name: "my-awesome-project", stars: 45, language: "TypeScript" },
    { name: "dotfiles", stars: 12, language: "Shell" },
  ],
  music_genres: ["Indie", "Electronic", "Hip-Hop"],
  recent_reviews: [
    { title: "Oppenheimer", rating: 4.5, type: "movie" },
    { title: "Succession", rating: 5, type: "show" },
  ],
  sentiment_analysis: { mood: "Curious", score: 0.82 },
};
