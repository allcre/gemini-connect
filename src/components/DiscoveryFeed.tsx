import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import { mockProfiles } from "@/data/mockData";
import { toast } from "sonner";
import { Heart, Sparkles, MessageCircle } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";
import type { DiscoverProfile } from "@/types/profile";
import { useLocalMatches } from "@/hooks/useLocalProfile";
import { useLocalMessages } from "@/hooks/useLocalMessages";
import { useLocalProfile } from "@/hooks/useLocalProfile";

interface DiscoveryFeedProps {
  onNavigateToMessages?: (conversationId: string | null) => void;
}

export const DiscoveryFeed = ({ onNavigateToMessages }: DiscoveryFeedProps) => {
  const [profiles] = useState<DiscoverProfile[]>(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const { likeProfile, hasLiked } = useLocalMatches();
  const { profile } = useLocalProfile();
  const { startConversation } = useLocalMessages();

  const currentProfile = profiles[currentIndex];

  const handleMessage = () => {
    if (!currentProfile || !profile) return;

    // Start conversation and get conversation ID
    const conversationId = startConversation(currentProfile, profile.id);

    // Navigate to messages tab with conversation ID
    if (onNavigateToMessages) {
      onNavigateToMessages(conversationId);
    }
  };

  // Scroll to top when profile changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  const handleLike = (likedFeature?: string) => {
    if (!currentProfile) return;

    setLiked(true);
    likeProfile(currentProfile.id, likedFeature);

    toast.success(
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 fill-current" />
        <span>You liked {currentProfile.displayName}!</span>
      </div>
    );

    setTimeout(() => {
      setLiked(false);
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        toast.info("You've seen all profiles! More coming soon 💫");
      }
    }, 500);
  };

  const handleSkip = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info("You've seen all profiles! More coming soon 💫");
    }
  };

  const handleLikeFeature = (feature: string) => {
    // Just a placeholder for the click interaction
    // No toast, no action - keeps the animations but removes the notification
  };

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
          <IconCircle variant="primary" size="xl">
            <Heart className="w-12 h-12" />
          </IconCircle>
        </motion.div>
        <h2 className="font-display text-2xl font-semibold mb-2">All caught up!</h2>
        <p className="text-muted-foreground">Check back later for new matches</p>
      </div>
    );
  }

  return (
    <div className="relative p-4">
      <AnimatePresence mode="wait">
        {liked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          >
            <IconCircle variant="primary" className="w-32 h-32 animate-heart-beat">
              <Heart className="w-16 h-16 fill-current" />
            </IconCircle>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <ProfileCard
          key={currentProfile.id}
          profile={currentProfile}
          onLike={() => handleLike()}
          onSkip={handleSkip}
          onLikeFeature={handleLikeFeature}
          onMessage={handleMessage}
        />
      </AnimatePresence>
    </div>
  );
};
