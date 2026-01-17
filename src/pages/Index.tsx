import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { GeminiCoach } from "@/components/GeminiCoach";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { ProfilePreview } from "@/components/ProfilePreview";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { UserProfile } from "@/types/profile";

const Index = () => {
  const { 
    profile, 
    isLoading, 
    hasOnboarded, 
    saveProfile, 
    updateProfile,
    completeOnboarding 
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState("discover");

  const handleOnboardingComplete = (completedProfile: UserProfile) => {
    saveProfile(completedProfile);
    completeOnboarding();
    setActiveTab("profile"); // Go to profile preview after onboarding
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    updateProfile(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasOnboarded && profile) {
    return (
      <OnboardingWizard 
        onComplete={handleOnboardingComplete} 
        initialProfile={profile}
      />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Something went wrong. Please refresh.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20"
          >
            <DiscoveryFeed />
          </motion.div>
        );

      case "coach":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 pb-24"
          >
            <GeminiCoach 
              profile={profile} 
              onProfileUpdate={handleProfileUpdate}
            />
          </motion.div>
        );

      case "matches":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 pb-24 space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold">Matches</h2>
            
            {/* Match Cards */}
            <div className="space-y-3">
              {[
                { name: "Maya Chen", time: "2h ago", message: "Loved your neural-art-generator repo!", unread: true },
                { name: "Jordan Rivera", time: "1d ago", message: "That Dune review was spot on 🎬", unread: false },
              ].map((match, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-4 cursor-pointer hover:shadow-elevated transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl">
                        🧑‍💻
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{match.name}</h3>
                          {match.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{match.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{match.time}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Keep swiping to find more matches!</p>
            </div>
          </motion.div>
        );

      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            <ProfilePreview 
              profile={profile} 
              onEdit={() => setActiveTab("coach")}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Logo />
          <Button variant="ghost" size="icon-sm">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
