import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Film, Music, Upload, ArrowRight, ArrowLeft, Sparkles, User, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingSteps } from "./OnboardingSteps";
import { Logo } from "./Logo";
import type { UserProfile, YellowcakeData, Photo } from "@/types/profile";

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
}

interface OnboardingFormData {
  displayName: string;
  age: string;
  location: string;
  githubUsername: string;
  letterboxdUsername: string;
  spotifyUsername: string;
  aboutMe: string;
  targetAudience: string;
  highlights: string;
  photos: string[];
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

// Mock Yellowcake API response (simulates data scraping)
const mockYellowcakeAPI = async (usernames: { github?: string; letterboxd?: string; spotify?: string }): Promise<YellowcakeData> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  return {
    topRepos: usernames.github ? [
      { name: "awesome-project", stars: 142, language: "TypeScript" },
      { name: "dotfiles", stars: 23, language: "Shell" },
      { name: "ml-experiments", stars: 67, language: "Python" },
    ] : [],
    musicGenres: usernames.spotify ? ["Indie", "Electronic", "Lo-fi Hip Hop"] : [],
    recentReviews: usernames.letterboxd ? [
      { title: "Past Lives", rating: 5, type: "movie" },
      { title: "Aftersun", rating: 4.5, type: "movie" },
      { title: "Everything Everywhere All at Once", rating: 5, type: "movie" },
    ] : [],
    sentimentAnalysis: { mood: "Contemplative", score: 0.82 },
    codingHours: usernames.github ? 34 : 0,
    movieHours: usernames.letterboxd ? 18 : 0,
    topArtists: usernames.spotify ? ["Mitski", "Phoebe Bridgers", "Japanese Breakfast"] : [],
    avgLetterboxdRating: usernames.letterboxd ? 3.8 : undefined,
    totalFilmsWatched: usernames.letterboxd ? 247 : undefined,
    commitCount: usernames.github ? 892 : undefined,
  };
};

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: "",
    age: "",
    location: "",
    githubUsername: "",
    letterboxdUsername: "",
    spotifyUsername: "",
    aboutMe: "",
    targetAudience: "",
    highlights: "",
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
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos.slice(0, 5), dataUrl], // Max 6 photos
        }));
      };
      reader.readAsDataURL(file);
    });
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

    try {
      // 1. Call mock Yellowcake API
      const yellowcakeData = await mockYellowcakeAPI({
        github: formData.githubUsername,
        letterboxd: formData.letterboxdUsername,
        spotify: formData.spotifyUsername,
      });

      // 2. Call Gemini to generate profile content
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
        lookingFor: "Something meaningful",
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
      title: "Let's Meet You",
      subtitle: "The basics to get started",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Your name"
                className="pl-12"
                value={formData.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Age"
                className="w-24"
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
              />
              <Input
                placeholder="City, State"
                className="flex-1"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
      isValid: () => formData.displayName.length > 0,
    },
    {
      title: "Connect Your World",
      subtitle: "We'll analyze your digital footprint to find what makes you unique",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="GitHub username (optional)"
                className="pl-12"
                value={formData.githubUsername}
                onChange={(e) => updateField("githubUsername", e.target.value)}
              />
            </div>
            <div className="relative">
              <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Letterboxd username (optional)"
                className="pl-12"
                value={formData.letterboxdUsername}
                onChange={(e) => updateField("letterboxdUsername", e.target.value)}
              />
            </div>
            <div className="relative">
              <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Spotify username (optional)"
                className="pl-12"
                value={formData.spotifyUsername}
                onChange={(e) => updateField("spotifyUsername", e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            We'll use this to highlight your unique interests ✨
          </p>
        </div>
      ),
      isValid: () => true, // Optional step
    },
    {
      title: "Tell Us More",
      subtitle: "Help us craft the perfect profile for you",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Who are you trying to attract?
              </label>
              <Textarea
                placeholder="e.g., Creative introverts who love A24 films, cozy coffee shops, and late-night coding sessions..."
                className="min-h-[80px] resize-none"
                value={formData.targetAudience}
                onChange={(e) => updateField("targetAudience", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Anything else about yourself?
              </label>
              <Textarea
                placeholder="Your vibe, hobbies, what makes you tick..."
                className="min-h-[70px] resize-none"
                value={formData.aboutMe}
                onChange={(e) => updateField("aboutMe", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                What do you want to highlight?
              </label>
              <Input
                placeholder="e.g., My indie film taste, open source projects..."
                value={formData.highlights}
                onChange={(e) => updateField("highlights", e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
      isValid: () => formData.targetAudience.length > 0,
    },
    {
      title: "Show Your Best Self",
      subtitle: "Upload photos that capture who you are",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: formData.photos[i] ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors relative overflow-hidden"
              >
                {formData.photos[i] ? (
                  <>
                    <img 
                      src={formData.photos[i]} 
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex items-center justify-center cursor-pointer">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Tip: Show your hobbies, smile, and be authentic!
          </p>
        </div>
      ),
      isValid: () => true, // Photos optional
    },
  ];

  // Generating state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center shadow-elevated mx-auto"
          >
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold">Creating Your Profile...</h2>
            <p className="text-muted-foreground">
              Analyzing your data & crafting something special ✨
            </p>
          </div>
          <motion.div
            className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto"
          >
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
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
                    <h2 className="font-display text-xl font-semibold">{steps[step].title}</h2>
                    <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
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
