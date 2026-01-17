import { useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { GeminiCoach } from "@/components/GeminiCoach";
import { OnboardingWizard, OnboardingData } from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Settings, Camera, Edit2, Code, Film, Music } from "lucide-react";

const Index = () => {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log("Onboarding complete:", data);
    setHasOnboarded(true);
  };

  if (!hasOnboarded) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
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
            <GeminiCoach />
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
            className="p-4 pb-24 space-y-6"
          >
            {/* Profile Header */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center text-5xl shadow-elevated">
                  🧑‍💻
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-soft">
                  <Camera className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold">Your Profile</h2>
                <p className="text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>

            {/* Bio Card */}
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">Bio</h3>
                <Button variant="ghost" size="icon-sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-muted-foreground">
                Code by day, cinema by night. My Letterboxd is basically my love language. 
                Looking for someone to debug life's edge cases with.
              </p>
            </Card>

            {/* Data Insights Card */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold">Your Data Insights</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-1/20 flex items-center justify-center">
                    <Code className="w-5 h-5 text-chart-1" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">3 repos connected</p>
                  </div>
                  <Badge variant="insight">Active</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                    <Film className="w-5 h-5 text-chart-3" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Letterboxd</p>
                    <p className="text-sm text-muted-foreground">142 films logged</p>
                  </div>
                  <Badge variant="insight">Active</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Spotify</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Button variant="secondary" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
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
