import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Film, Music, Upload, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingSteps } from "./OnboardingSteps";
import { Logo } from "./Logo";

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  githubUsername: string;
  letterboxdUsername: string;
  spotifyUsername: string;
  photos: File[];
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

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    githubUsername: "",
    letterboxdUsername: "",
    spotifyUsername: "",
    photos: [],
  });

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const steps = [
    {
      title: "Connect Your World",
      subtitle: "Let's gather some data to build your unique profile",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="GitHub username"
                className="pl-12"
                value={data.githubUsername}
                onChange={(e) => setData({ ...data, githubUsername: e.target.value })}
              />
            </div>
            <div className="relative">
              <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Letterboxd username"
                className="pl-12"
                value={data.letterboxdUsername}
                onChange={(e) => setData({ ...data, letterboxdUsername: e.target.value })}
              />
            </div>
            <div className="relative">
              <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Spotify username"
                className="pl-12"
                value={data.spotifyUsername}
                onChange={(e) => setData({ ...data, spotifyUsername: e.target.value })}
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
        <div className="space-y-6">
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
      title: "Almost There!",
      subtitle: "We're crunching the data to build your profile",
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
              transition={{ duration: 2 }}
            />
          </motion.div>
        </div>
      ),
    },
  ];

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
          <OnboardingSteps currentStep={step} totalSteps={3} />

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
            {step < 2 ? (
              <Button onClick={nextStep} className="flex-1">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Matching
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
