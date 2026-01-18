import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { BottomNav } from "@/components/BottomNav";
import { DiscoveryFeed } from "@/components/DiscoveryFeed";
import { GeminiCoach } from "@/components/GeminiCoach";
import { Messages } from "@/components/Messages";
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
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Clear selected conversation when leaving messages tab
    if (activeTab !== "messages") {
      setSelectedConversationId(null);
    }
  }, [activeTab]);

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down (and past 50px threshold)
        setShowHeader(false);
      }

      // Always show at very top
      if (currentScrollY < 10) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowProfilePreview(true);
  };

  const handleStartMatching = () => {
    setOnboarded(true);
    setShowProfilePreview(false);
    setActiveTab("discover");
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
        <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg shadow-sm">
          <div className="flex items-center justify-center p-4 max-w-md mx-auto">
            <Logo />
          </div>
        </header>
        <div className="h-[72px]" />
        <main className="max-w-md mx-auto p-4 pb-24">
          <h2 className="font-heading text-xl font-semibold text-center mb-4">Preview Your Profile</h2>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20 overscroll-contain"
            style={{ overscrollBehaviorY: 'contain' }}
          >
            <DiscoveryFeed
              onNavigateToMessages={(conversationId: string | null) => {
                setSelectedConversationId(conversationId);
                setActiveTab("messages");
              }}
            />
          </motion.div>
        );

      case "coach":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-4rem)] flex flex-col"
          >
            <GeminiCoach profile={profile} onProfileUpdate={setProfile} />
          </motion.div>
        );

      case "messages":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-4rem)] flex flex-col pt-0"
          >
            <Messages
              initialConversationId={selectedConversationId === null ? undefined : selectedConversationId}
              onConversationChange={setSelectedConversationId}
            />
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
      {/* Header - hidden on coach, matches, and messages tabs, auto-hides on scroll on other tabs */}
      {activeTab !== "coach" && activeTab !== "matches" && activeTab !== "messages" && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg shadow-sm transition-transform duration-300 ${
            showHeader ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center justify-center p-4 max-w-md mx-auto">
            <Logo />
          </div>
        </header>
      )}
      {/* Spacer for fixed header */}
      {activeTab !== "coach" && activeTab !== "matches" && activeTab !== "messages" && <div className="h-[72px]" />}
      <main className={activeTab === "coach" ? "w-full h-[calc(100vh-4rem)]" : "max-w-md mx-auto"}>{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
