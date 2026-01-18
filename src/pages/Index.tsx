import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { GeminiCoach } from "@/components/GeminiCoach";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { ProfilePreview } from "@/components/ProfilePreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, LogOut } from "lucide-react";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import type { UserProfile } from "@/types/profile";

const Index = () => {
  const { profile, setProfile, updateProfile, isLoading, hasOnboarded, setOnboarded, resetProfile } = useLocalProfile();
  const [activeTab, setActiveTab] = useState("discover");
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowProfilePreview(true);
  };

  const handleStartMatching = () => {
    setOnboarded(true);
    setShowProfilePreview(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!hasOnboarded && !showProfilePreview) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  if (showProfilePreview && profile) {
    return (
      <div className="min-h-screen">
        <header className="z-40 bg-transparent backdrop-blur-lg border-b border-border/30">
          <div className="flex items-center justify-center p-4 max-w-md mx-auto">
            <Logo />
          </div>
        </header>
        <main className="max-w-md mx-auto p-4 pb-24">
          <h2 className="font-display text-xl font-semibold text-center mb-4">Preview Your Profile</h2>
          <ProfilePreview
            profile={profile}
            onSave={setProfile}
            onStartMatching={handleStartMatching}
            isInitialSetup={true}
          />
        </main>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
            <DiscoveryFeed />
          </motion.div>
        );

      case "coach":
        return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="h-[calc(100vh-9rem)] p-4"
          >
            <GeminiCoach profile={profile} onProfileUpdate={setProfile} />
          </motion.div>
        );

      case "matches":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-24 space-y-4">
            <h2 className="font-display text-2xl font-semibold">Matches</h2>
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Keep swiping to find matches!</p>
            </div>
          </motion.div>
        );

      case "profile":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-24 space-y-6">
            {profile && (
              <ProfilePreview
                profile={profile}
                onSave={setProfile}
                onStartMatching={() => setActiveTab("discover")}
                isEditable={true}
                isInitialSetup={false}
              />
            )}
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={resetProfile}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Clear Data
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="z-40 bg-transparent backdrop-blur-lg border-b border-border/30">
        <div className="flex items-center justify-center p-4 max-w-md mx-auto">
          <Logo />
        </div>
      </header>
      <main className={activeTab === "coach" ? "w-full" : "max-w-md mx-auto"}>{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
