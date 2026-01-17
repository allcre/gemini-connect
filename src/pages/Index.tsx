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
import { Heart, MessageCircle, Settings, Code, Film, Music } from "lucide-react";
import { useLocalProfile } from "@/hooks/useLocalProfile";
import type { UserProfile } from "@/types/profile";

const Index = () => {
  const { profile, setProfile, updateProfile, isLoading, hasOnboarded, setOnboarded } = useLocalProfile();
  const [activeTab, setActiveTab] = useState("discover");
  const [showProfilePreview, setShowProfilePreview] = useState(false);

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
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-center p-4 max-w-md mx-auto">
            <Logo />
          </div>
        </header>
        <main className="max-w-md mx-auto p-4">
          <h2 className="font-display text-xl font-semibold text-center mb-4">Preview Your Profile</h2>
          <ProfilePreview 
            profile={profile} 
            onSave={setProfile}
            onStartMatching={handleStartMatching}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-24">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 pb-24">
            {profile && (
              <ProfilePreview 
                profile={profile} 
                onSave={setProfile}
                onStartMatching={() => {}}
                isEditable={true}
              />
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Logo />
          <Button variant="ghost" size="icon-sm">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>
      <main className="max-w-md mx-auto">{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
