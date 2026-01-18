import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingSteps } from "./OnboardingSteps";
import { Logo } from "./Logo";
import { IconCircle } from "@/components/ui/icon-circle";
import {
  BasicInfoStep,
  basicInfoStepConfig,
  PlatformsStep,
  platformsStepConfig,
  PersonalityStep,
  personalityStepConfig,
  PhotosStep,
  photosStepConfig,
  type OnboardingFormData,
} from "./onboarding";
import type { UserProfile, YellowcakeData, Photo } from "@/types/profile";
import {
  extractSpotifyPlaylistsFromUsername,
  extractLetterboxdFilms,
  extractGitHubRepos,
  extractTweets,
  extractSubstackPosts,
  extractSteamGames,
  type PlaylistInfo,
} from "@/integrations/yellowcake/client";
import { getHardcodedData } from "@/data/hardcodedYellowcakeData";

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/**
 * Transform PlaylistInfo[] from Yellowcake into YellowcakeData format
 */
const transformPlaylistsToYellowcakeData = (playlists: PlaylistInfo[]): Partial<YellowcakeData> => {
  // Extract all songs and artists from all playlists
  const playlistSongs: Array<{ track_name: string; artist_name: string }> = [];

  for (const playlist of playlists) {
    for (const track of playlist.tracks) {
      playlistSongs.push({
        track_name: track.track_name,
        artist_name: track.artist_name,
      });
    }
  }

  return {
    playlistSongs,
  };
};

// Mock Yellowcake API response (fallback for GitHub/Letterboxd or when Spotify scraping fails)
// For demo: only returns hardcoded data, no fake fallback
const mockYellowcakeAPI = async (usernames: { github?: string; letterboxd?: string; spotify?: string; twitter?: string }): Promise<YellowcakeData> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

  // Try to get hardcoded data first
  const hardcoded = getHardcodedData(usernames);
  if (hardcoded) {
    return {
      topRepos: [],
      musicGenres: [],
      recentReviews: [],
      sentimentAnalysis: { mood: "Neutral", score: 0.5 },
      codingHours: 0,
      movieHours: 0,
      ...hardcoded,
    } as YellowcakeData;
  }

  // For demo: return empty/minimal data instead of fake fallback
  return {
    topRepos: [],
    musicGenres: [],
    recentReviews: [],
    sentimentAnalysis: { mood: "Neutral", score: 0.5 },
    codingHours: 0,
    movieHours: 0,
  };
};

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingProgress, setScrapingProgress] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: "",
    age: "",
    location: "",
    githubUsername: "",
    letterboxdUsername: "",
    spotifyUsername: "",
    twitterUsername: "",
    substackUsername: "",
    steamUsername: "",
    aboutMe: "",
    targetAudience: "",
    highlights: "",
    lookingFor: "",
    photos: [],
  });

  const updateField = (field: keyof OnboardingFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert files to data URLs for localStorage storage
    // Process all files and place them in empty slots
    const fileArray = Array.from(files);

    // Convert all files to data URLs using Promises
    const filePromises = fileArray.map(file =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          resolve(dataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    );

    // Once all files are read, update state with photos placed in empty slots
    Promise.all(filePromises).then(dataUrls => {
      setFormData(prev => {
        const newPhotos = [...prev.photos];

        // Place each new photo in the first available empty slot
        for (const dataUrl of dataUrls) {
          // Find the first empty slot (undefined, null, or empty string)
          let targetIndex = newPhotos.findIndex(photo => !photo);

          // If no empty slot found, append at the end (up to max 6 photos)
          if (targetIndex === -1) {
            targetIndex = newPhotos.length;
          }

          // Don't add if we've reached the max (6 photos, indices 0-5)
          if (targetIndex < 6) {
            newPhotos[targetIndex] = dataUrl;
          }
        }

        return {
          ...prev,
          photos: newPhotos,
        };
      });
    }).catch(error => {
      console.error('Error reading photo files:', error);
    });

    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const generateProfile = async () => {
    setIsGenerating(true);
    setError(null);
    setScrapingProgress(null);

    try {
      // 1. Get Spotify playlist data using Yellowcake (if username provided)
      // Check if we should use hardcoded data (skip real scraping for demo)
      const shouldUseHardcodedData =
        formData.githubUsername?.toLowerCase() === "dory" ||
        formData.letterboxdUsername?.toLowerCase() === "dory" ||
        formData.spotifyUsername?.toLowerCase() === "dory" ||
        formData.twitterUsername?.toLowerCase() === "dory";

      let spotifyData: Partial<YellowcakeData> = {};

      if (formData.spotifyUsername && !shouldUseHardcodedData) {
        try {
          setScrapingProgress("Extracting playlist links...");
          const playlists = await extractSpotifyPlaylistsFromUsername(
            formData.spotifyUsername,
            3, // Limit to first 3 playlists to avoid long scraping times
            (stage, message, details) => {
              if (stage === 'links') {
                setScrapingProgress(message);
              } else if (stage === 'playlists') {
                const progress = details?.current && details?.total
                  ? `Extracting songs from playlists (${details.current}/${details.total})...`
                  : message;
                setScrapingProgress(progress);
              }
            }
          );

          // Transform playlist data to YellowcakeData format
          spotifyData = transformPlaylistsToYellowcakeData(playlists);
          setScrapingProgress("Spotify data extracted!");
        } catch (spotifyError) {
          console.error("❌ Spotify scraping failed:", spotifyError);
          if (spotifyError instanceof Error) {
            console.error("Error message:", spotifyError.message);
            console.error("Error stack:", spotifyError.stack);
          }
          // Continue with mock data instead of failing entirely
          setScrapingProgress("Spotify scraping failed, using fallback data...");
        }
      }

      // 2. Get Letterboxd films and ratings using Yellowcake (if username provided)
      let letterboxdData: Partial<YellowcakeData> = {};

      if (formData.letterboxdUsername && !shouldUseHardcodedData) {
        try {
          setScrapingProgress("Extracting Letterboxd films and ratings...");
          const letterboxdURL = `https://letterboxd.com/${formData.letterboxdUsername}/films/`;
          const films = await extractLetterboxdFilms(letterboxdURL, (progressEvent) => {
            setScrapingProgress(progressEvent.message || "Extracting films...");
          });

          letterboxdData = {
            letterboxdFilms: films,
          };
          setScrapingProgress("Letterboxd data extracted!");
        } catch (letterboxdError) {
          console.error("❌ Letterboxd scraping failed:", letterboxdError);
          if (letterboxdError instanceof Error) {
            console.error("Error message:", letterboxdError.message);
            console.error("Error stack:", letterboxdError.stack);
          }
          // Continue with mock data instead of failing entirely
          setScrapingProgress("Letterboxd scraping failed, using fallback data...");
        }
      }

      // 3. Get GitHub repositories using Yellowcake (if username provided)
      let githubData: Partial<YellowcakeData> = {};

      if (formData.githubUsername && !shouldUseHardcodedData) {
        try {
          setScrapingProgress("Extracting GitHub repositories...");
          const githubURL = `https://github.com/${formData.githubUsername}?tab=repositories`;
          const repos = await extractGitHubRepos(githubURL, (progressEvent) => {
            setScrapingProgress(progressEvent.message || "Extracting repositories...");
          });

          githubData = {
            githubRepos: repos,
          };
          setScrapingProgress("GitHub data extracted!");
        } catch (githubError) {
          console.error("❌ GitHub scraping failed:", githubError);
          if (githubError instanceof Error) {
            console.error("Error message:", githubError.message);
            console.error("Error stack:", githubError.stack);
          }
          // Continue with mock data instead of failing entirely
          setScrapingProgress("GitHub scraping failed, using fallback data...");
        }
      }

      // 4. Get X/Twitter tweets using Yellowcake (if username provided)
      let twitterData: Partial<YellowcakeData> = {};

      if (formData.twitterUsername && !shouldUseHardcodedData) {
        try {
          setScrapingProgress("Extracting X/Twitter tweets...");
          const xURL = `https://xcancel.com/${formData.twitterUsername}`;
          const tweets = await extractTweets(xURL, (progressEvent) => {
            setScrapingProgress(progressEvent.message || "Extracting tweets...");
          });

          twitterData = {
            tweets,
          };
          setScrapingProgress("Twitter data extracted!");
        } catch (twitterError) {
          console.error("❌ Twitter scraping failed:", twitterError);
          if (twitterError instanceof Error) {
            console.error("Error message:", twitterError.message);
            console.error("Error stack:", twitterError.stack);
          }
          // Continue with mock data instead of failing entirely
          setScrapingProgress("Twitter scraping failed, using fallback data...");
        }
      }

      // 5. Get Substack posts using Yellowcake (if username provided)
      let substackData: Partial<YellowcakeData> = {};

      if (formData.substackUsername) {
        try {
          setScrapingProgress("Extracting Substack posts...");
          const substackURL = `https://substack.com/@${formData.substackUsername}`;
          const posts = await extractSubstackPosts(substackURL, (progressEvent) => {
            setScrapingProgress(progressEvent.message || "Extracting posts...");
          });

          substackData = {
            substackPosts: posts,
          };
          setScrapingProgress("Substack data extracted!");
        } catch (substackError) {
          console.error("❌ Substack scraping failed:", substackError);
          if (substackError instanceof Error) {
            console.error("Error message:", substackError.message);
            console.error("Error stack:", substackError.stack);
          }
          // Continue with mock data instead of failing entirely
          setScrapingProgress("Substack scraping failed, using fallback data...");
        }
      }

      // 6. Get Steam games using Yellowcake (if username provided)
      let steamData: Partial<YellowcakeData> = {};

      if (formData.steamUsername) {
        try {
          setScrapingProgress("Extracting Steam games...");
          const steamURL = `https://steamcommunity.com/id/${formData.steamUsername}`;
          const games = await extractSteamGames(steamURL, (progressEvent) => {
            setScrapingProgress(progressEvent.message || "Extracting games...");
          });

          steamData = {
            steamGames: games,
          };
          setScrapingProgress("Steam data extracted!");
        } catch (steamError) {
          console.error("❌ Steam scraping failed:", steamError);
          if (steamError instanceof Error) {
            console.error("Error message:", steamError.message);
            console.error("Error stack:", steamError.stack);
          }
          // Continue with mock data instead of failing entirely
          setScrapingProgress("Steam scraping failed, using fallback data...");
        }
      }

      // 7. Get mock data for GitHub/Letterboxd (or as fallback for Spotify)
      const mockData = await mockYellowcakeAPI({
        github: formData.githubUsername,
        letterboxd: formData.letterboxdUsername,
        spotify: formData.spotifyUsername && Object.keys(spotifyData).length === 0 ? formData.spotifyUsername : undefined,
        twitter: formData.twitterUsername,
      });

      // 8. Merge real scraping data with mock data
      const yellowcakeData: YellowcakeData = {
        ...mockData,
        ...spotifyData, // Override with real Spotify data if available
        ...letterboxdData, // Override with real Letterboxd data if available
        ...githubData, // Override with real GitHub data if available
        ...twitterData, // Override with real Twitter data if available
        ...substackData, // Override with real Substack data if available
        ...steamData, // Override with real Steam data if available
      };

      // 9. Call Gemini to generate profile content
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "generate",
          yellowcakeData,
          targetAudience: formData.targetAudience,
          aboutMe: formData.aboutMe,
          highlights: formData.highlights,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate profile");
      }

      const generatedContent = await response.json();

      // 3. Build complete profile
      const photos: Photo[] = formData.photos.map((url, i) => ({
        id: `photo-${i}`,
        url,
        isPrimary: i === 0,
        sortOrder: i,
      }));

      const profile: UserProfile = {
        id: Math.random().toString(36).substring(2, 15),
        displayName: formData.displayName,
        age: formData.age ? parseInt(formData.age) : null,
        location: formData.location,
        photos,
        lookingFor: formData.lookingFor || "friend",
        targetAudience: formData.targetAudience,
        bio: generatedContent.bio || "",
        promptAnswers: (generatedContent.promptAnswers || []).map((p: any, i: number) => ({
          id: `prompt-${i}`,
          promptId: p.promptId || `prompt-${i}`,
          promptText: p.promptText,
          answerText: p.answerText,
          source: "llm" as const,
          sortOrder: i,
        })),
        funFacts: (generatedContent.funFacts || []).map((f: any, i: number) => ({
          id: `fact-${i}`,
          label: f.label,
          value: f.value,
          source: "llm" as const,
          sortOrder: i,
        })),
        dataInsights: (generatedContent.dataInsights || []).map((d: any, i: number) => ({
          id: `insight-${i}`,
          type: d.type || "stat",
          title: d.title,
          description: d.description,
          metricKey: d.title.toLowerCase().replace(/\s+/g, "_"),
          metricValue: d.metricValue,
          visualizationHint: "pill" as const,
          source: "llm" as const,
          sortOrder: i,
        })),
        bestFeatures: generatedContent.bestFeatures || [],
        yellowcakeData,
        socialUsernames: {
          github: formData.githubUsername || undefined,
          letterboxd: formData.letterboxdUsername || undefined,
          spotify: formData.spotifyUsername || undefined,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onComplete(profile);
    } catch (err) {
      console.error("Profile generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate profile");
      setIsGenerating(false);
    }
  };

  const steps = [
    {
      ...basicInfoStepConfig,
      content: <BasicInfoStep formData={formData} updateField={updateField} />,
      isValid: () => basicInfoStepConfig.isValid(formData),
    },
    {
      ...platformsStepConfig,
      content: (
        <PlatformsStep
          formData={formData}
          updateField={updateField}
          selectedPlatforms={selectedPlatforms}
          setSelectedPlatforms={setSelectedPlatforms}
        />
      ),
      isValid: platformsStepConfig.isValid,
    },
    {
      ...personalityStepConfig,
      content: <PersonalityStep formData={formData} updateField={updateField} />,
      isValid: () => personalityStepConfig.isValid(formData),
    },
    {
      ...photosStepConfig,
      content: (
        <PhotosStep
          formData={formData}
          updateField={updateField}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={removePhoto}
        />
      ),
      isValid: photosStepConfig.isValid,
    },
  ];

  // Generating state
  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <IconCircle variant="primary" size="xl" className="shadow-lg mx-auto">
              <Sparkles className="w-12 h-12" />
            </IconCircle>
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-heading">Creating Your Profile...</h2>
            <p className="text-caption">
              {scrapingProgress || "Analyzing your data & crafting something special"}
            </p>
          </div>
          <motion.div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex justify-center">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md space-y-6">
          <OnboardingSteps currentStep={step} totalSteps={4} />

          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-1">
                    <h2 className="text-heading">{steps[step].title}</h2>
                    <p className="text-caption">{steps[step].subtitle}</p>
                  </div>
                  {steps[step].content}
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="flex-1"
                disabled={!steps[step].isValid()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generateProfile}
                className="flex-1"
                disabled={!steps[step].isValid()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
