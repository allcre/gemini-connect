import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import { mockProfiles, Profile } from "@/data/mockData";
import { toast } from "sonner";
import { Heart, Sparkles } from "lucide-react";

export const DiscoveryFeed = () => {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    setLiked(true);
    toast.success(
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 fill-current" />
        <span>You liked {currentProfile.name}!</span>
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

  const handleComment = (feature: string) => {
    if (feature) {
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>You liked "{feature}"</span>
        </div>
      );
    }
  };

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mb-6"
        >
          <Heart className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        <h2 className="font-display text-2xl font-semibold mb-2">All caught up!</h2>
        <p className="text-muted-foreground">Check back later for new matches ✨</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {liked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          >
            <div className="w-32 h-32 gradient-primary rounded-full flex items-center justify-center animate-heart-beat">
              <Heart className="w-16 h-16 text-primary-foreground fill-current" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <ProfileCard
          key={currentProfile.id}
          profile={currentProfile}
          onLike={handleLike}
          onSkip={handleSkip}
          onComment={handleComment}
        />
      </AnimatePresence>
    </div>
  );
};
