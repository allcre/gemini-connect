import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Github, Film, Music, Upload, ArrowRight, ArrowLeft, 
  Sparkles, User, MapPin, Target, MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingSteps } from "./OnboardingSteps";
import { Logo } from "./Logo";
import { UserProfile, PromptAnswer, FunFact, DataInsight, Photo } from "@/types/profile";
import { fetchYellowcakeData, generateContentFromYellowcake } from "@/lib/yellowcake";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile: UserProfile;
}

interface OnboardingFormData {
  displayName: string;
  age: string;
  location: string;
  githubUsername: string;
  letterboxdUsername: string;
  spotifyUsername: string;
  lookingFor: string;
  targetAudience: string;
  additionalInfo: string;
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

export const OnboardingWizard = ({ onComplete, initialProfile }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: initialProfile.displayName || "",
    age: initialProfile.age?.toString() || "",
    location: initialProfile.location || "",
    githubUsername: initialProfile.githubUsername || "",
    letterboxdUsername: initialProfile.letterboxdUsername || "",
    spotifyUsername: initialProfile.spotifyUsername || "",
    lookingFor: initialProfile.lookingFor || "",
    targetAudience: initialProfile.targetAudience || "",
    additionalInfo: "",
    photos: [],
  });

  const updateForm = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGenerateProfile = async () => {
    setIsGenerating(true);
    
    try {
      // Step 1: Fetch Yellowcake data
      const yellowcakeData = await fetchYellowcakeData({
        githubUsername: formData.githubUsername || undefined,
        letterboxdUsername: formData.letterboxdUsername || undefined,
        spotifyUsername: formData.spotifyUsername || undefined,
      });

      // Step 2: Generate content from yellowcake
      const { funFacts: rawFunFacts, insights: rawInsights } = generateContentFromYellowcake(yellowcakeData);

      // Step 3: Call AI to generate bio and prompts
      const { data, error } = await supabase.functions.invoke("generate-profile", {
        body: {
          type: "generate-profile",
          userInfo: {
            displayName: formData.displayName,
            age: formData.age ? parseInt(formData.age) : undefined,
            location: formData.location,
            lookingFor: formData.lookingFor,
            targetAudience: formData.targetAudience,
            additionalInfo: formData.additionalInfo,
          },
          yellowcakeData,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to generate profile");
      }

      // Step 4: Build the complete profile
      const promptAnswers: PromptAnswer[] = (data.promptAnswers || []).map(
        (p: { promptId: string; promptText: string; answerText: string }, i: number) => ({
          id: crypto.randomUUID(),
          promptId: p.promptId,
          promptText: p.promptText,
          answerText: p.answerText,
          source: "llm" as const,
          sortOrder: (i + 1) * 10 + 5, // Interleave with photos
        })
      );

      const funFacts: FunFact[] = rawFunFacts.map((f, i) => ({
        id: crypto.randomUUID(),
        label: f.label,
        value: f.value,
        source: "yellowcake" as const,
        icon: f.icon,
        sortOrder: 100 + i * 5,
      }));

      const dataInsights: DataInsight[] = rawInsights.map((d, i) => ({
        id: crypto.randomUUID(),
        type: d.type,
        title: d.title,
        description: d.description,
        metricKey: d.metricKey,
        metricValue: d.metricValue,
        visualizationHint: "pill" as const,
        source: "yellowcake" as const,
        sortOrder: 150 + i * 5,
      }));

      // Create placeholder photos
      const photos: Photo[] = [
        { id: crypto.randomUUID(), url: "/placeholder.svg", isPrimary: true, sortOrder: 0 },
        { id: crypto.randomUUID(), url: "/placeholder.svg", isPrimary: false, sortOrder: 20 },
        { id: crypto.randomUUID(), url: "/placeholder.svg", isPrimary: false, sortOrder: 40 },
      ];

      const completeProfile: UserProfile = {
        ...initialProfile,
        displayName: formData.displayName,
        age: formData.age ? parseInt(formData.age) : undefined,
        location: formData.location,
        githubUsername: formData.githubUsername || undefined,
        letterboxdUsername: formData.letterboxdUsername || undefined,
        spotifyUsername: formData.spotifyUsername || undefined,
        lookingFor: formData.lookingFor,
        targetAudience: formData.targetAudience,
        bio: data.bio || "",
        photos,
        promptAnswers,
        funFacts,
        dataInsights,
        yellowcakeData,
        updatedAt: new Date().toISOString(),
      };

      onComplete(completeProfile);
    } catch (err) {
      console.error("Profile generation error:", err);
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.displayName.trim().length > 0;
      case 1:
        return true; // Data connections are optional
      case 2:
        return true; // Photos optional for now
      case 3:
        return formData.targetAudience.trim().length > 0;
      default:
        return true;
    }
  };

  const steps = [
    {
      title: "Let's Get Started",
      subtitle: "Tell us about yourself",
      content: (
        <div className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Display name"
              className="pl-12"
              value={formData.displayName}
              onChange={(e) => updateForm("displayName", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Age"
              type="number"
              value={formData.age}
              onChange={(e) => updateForm("age", e.target.value)}
            />
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="pl-10"
                value={formData.location}
                onChange={(e) => updateForm("location", e.target.value)}
              />
            </div>
          </div>
          <Input
            placeholder="What are you looking for? (e.g., 'new friends', 'long-term')"
            value={formData.lookingFor}
            onChange={(e) => updateForm("lookingFor", e.target.value)}
          />
        </div>
      ),
    },
    {
      title: "Connect Your World",
      subtitle: "Let's gather some data to build your unique profile",
      content: (
        <div className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="GitHub username"
                className="pl-12"
                value={formData.githubUsername}
                onChange={(e) => updateForm("githubUsername", e.target.value)}
              />
            </div>
            <div className="relative">
              <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Letterboxd username"
                className="pl-12"
                value={formData.letterboxdUsername}
                onChange={(e) => updateForm("letterboxdUsername", e.target.value)}
              />
            </div>
            <div className="relative">
              <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Spotify username"
                className="pl-12"
                value={formData.spotifyUsername}
                onChange={(e) => updateForm("spotifyUsername", e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            We'll use this data to highlight your best features ✨
          </p>
        </div>
      ),
    },
    {
      title: "Show Your Best Self",
      subtitle: "Upload 3-6 photos that capture who you are",
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Tip: Show your hobbies, smile, and be authentic!
          </p>
        </div>
      ),
    },
    {
      title: "Who's Your Type?",
      subtitle: "Help us tailor your profile for your ideal match",
      content: (
        <div className="space-y-5">
          <div className="relative">
            <Target className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
            <Textarea
              placeholder="Describe who you're trying to attract (e.g., 'Introverted gamers who love indie films', 'Creative entrepreneurs with a travel bug')"
              className="pl-12 min-h-[100px] resize-none"
              value={formData.targetAudience}
              onChange={(e) => updateForm("targetAudience", e.target.value)}
            />
          </div>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
            <Textarea
              placeholder="Anything else you'd like to highlight about yourself? Quirks, passions, deal-breakers..."
              className="pl-12 min-h-[80px] resize-none"
              value={formData.additionalInfo}
              onChange={(e) => updateForm("additionalInfo", e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Building Your Profile",
      subtitle: "Our AI is crafting something special",
      content: (
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center shadow-elevated"
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <div className="text-center space-y-2">
            <p className="font-semibold">Analyzing your digital footprint...</p>
            <p className="text-sm text-muted-foreground">
              GitHub repos • Movie taste • Music vibes
            </p>
          </div>
          <motion.div
            className="w-full h-2 bg-muted rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
            />
          </motion.div>
          <p className="text-xs text-muted-foreground">
            Generating witty bio • Selecting perfect prompts
          </p>
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md space-y-8">
          {/* Steps Indicator */}
          <OnboardingSteps currentStep={step} totalSteps={totalSteps} />

          {/* Card */}
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-8">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="font-display text-2xl font-semibold">{steps[step].title}</h2>
                    <p className="text-muted-foreground">{steps[step].subtitle}</p>
                  </div>
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation */}
          {step < 4 && (
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
                <Button onClick={nextStep} disabled={!canProceed()} className="flex-1">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    nextStep();
                    handleGenerateProfile();
                  }} 
                  disabled={!canProceed() || isGenerating}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
