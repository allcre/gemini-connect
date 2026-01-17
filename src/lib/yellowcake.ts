// Mock Yellowcake API - simulates scraping data from GitHub, Letterboxd, Spotify

import { YellowcakeData } from "@/types/profile";

export interface YellowcakeInput {
  githubUsername?: string;
  letterboxdUsername?: string;
  spotifyUsername?: string;
}

// Simulated delay to feel like a real API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchYellowcakeData(input: YellowcakeInput): Promise<YellowcakeData> {
  await delay(1500); // Simulate API latency
  
  // Generate mock data based on usernames provided
  const data: YellowcakeData = {
    topRepos: [],
    musicGenres: [],
    recentReviews: [],
    sentimentAnalysis: {
      overall: "thoughtful",
      keywords: [],
    },
    stats: {},
  };

  if (input.githubUsername) {
    data.topRepos = [
      "neural-art-generator",
      "react-component-library",
      "cli-productivity-tools",
    ];
    data.stats.totalCommits = Math.floor(Math.random() * 500) + 100;
    data.sentimentAnalysis.keywords.push("technical", "creative", "problem-solver");
  }

  if (input.letterboxdUsername) {
    data.recentReviews = [
      "Gave 'Past Lives' 5 stars - 'A meditation on paths not taken'",
      "Loved 'Everything Everywhere All at Once' - 'Chaotic, beautiful, perfect'",
      "Reviewed 'Aftersun' - 'Quietly devastating'",
    ];
    data.stats.moviesWatched = Math.floor(Math.random() * 200) + 50;
    data.stats.avgRating = Number((3.5 + Math.random()).toFixed(1));
    data.sentimentAnalysis.keywords.push("cinephile", "introspective", "artistic");
    data.sentimentAnalysis.overall = "introspective";
  }

  if (input.spotifyUsername) {
    data.musicGenres = ["indie rock", "shoegaze", "lo-fi beats", "art pop"];
    data.stats.topArtist = ["Mitski", "Phoebe Bridgers", "Japanese Breakfast", "boygenius"][
      Math.floor(Math.random() * 4)
    ];
    data.stats.hoursListened = Math.floor(Math.random() * 1000) + 200;
    data.sentimentAnalysis.keywords.push("melancholic", "eclectic", "deep-listener");
  }

  // Determine overall sentiment
  if (data.sentimentAnalysis.keywords.length > 0) {
    const sentiments = ["thoughtful", "creative", "introspective", "adventurous", "passionate"];
    data.sentimentAnalysis.overall = sentiments[
      Math.floor(Math.random() * sentiments.length)
    ];
  }

  return data;
}

// Convert yellowcake data to fun facts and insights
export function generateContentFromYellowcake(data: YellowcakeData) {
  const funFacts: Array<{ label: string; value: string; icon: string }> = [];
  const insights: Array<{
    type: "stat" | "badge";
    title: string;
    description: string;
    metricKey: string;
    metricValue: string | number;
  }> = [];

  if (data.stats.totalCommits) {
    funFacts.push({
      label: "Commits this year",
      value: data.stats.totalCommits.toString(),
      icon: "code",
    });
    insights.push({
      type: "stat",
      title: "Code Warrior",
      description: `${data.stats.totalCommits} commits and counting`,
      metricKey: "commits",
      metricValue: data.stats.totalCommits,
    });
  }

  if (data.stats.moviesWatched) {
    funFacts.push({
      label: "Movies watched",
      value: data.stats.moviesWatched.toString(),
      icon: "film",
    });
    insights.push({
      type: "badge",
      title: "Film Buff",
      description: `Logged ${data.stats.moviesWatched} films`,
      metricKey: "moviesWatched",
      metricValue: data.stats.moviesWatched,
    });
  }

  if (data.stats.avgRating) {
    funFacts.push({
      label: "Avg Letterboxd rating",
      value: `${data.stats.avgRating} ★`,
      icon: "star",
    });
  }

  if (data.stats.topArtist) {
    funFacts.push({
      label: "Top artist",
      value: data.stats.topArtist,
      icon: "music",
    });
    insights.push({
      type: "badge",
      title: "Music Taste",
      description: `Currently obsessed with ${data.stats.topArtist}`,
      metricKey: "topArtist",
      metricValue: data.stats.topArtist,
    });
  }

  if (data.stats.hoursListened) {
    funFacts.push({
      label: "Hours streamed",
      value: `${data.stats.hoursListened}+`,
      icon: "headphones",
    });
  }

  if (data.topRepos.length > 0) {
    insights.push({
      type: "badge",
      title: "Open Source",
      description: `Building ${data.topRepos[0]}`,
      metricKey: "topRepo",
      metricValue: data.topRepos[0],
    });
  }

  return { funFacts, insights };
}
