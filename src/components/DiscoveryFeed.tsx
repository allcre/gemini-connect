import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import { useProfiles, useCreateMatch, Profile } from "@/hooks/useProfiles";
import { toast } from "sonner";
import { Heart, Sparkles, Loader2 } from "lucide-react";

// Import profile images
import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";

// Map profile names to images
const profileImages: Record<string, string> = {
  "Maya Chen": profile1,
  "Jordan Rivera": profile2,
  "Alex Kim": profile3,
};

export const DiscoveryFeed = () => {
  const { data: profiles, isLoading, error } = useProfiles();
  const createMatch = useCreateMatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // Filter out skipped profiles
  const availableProfiles = profiles?.filter(p => !skippedIds.has(p.id)) || [];
  const currentProfile = availableProfiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    
    setLiked(true);
    toast.success(
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 fill-current" />
        <span>You liked {currentProfile.name}!</span>
      </div>
    );
    
    // Create match in database
    try {
      await createMatch.mutateAsync({
        userId: "00000000-0000-0000-0000-000000000000", // Placeholder since no auth
        matchedUserId: currentProfile.id,
      });
    } catch (error) {
      console.error("Failed to create match:", error);
    }
    
    setTimeout(() => {
      setLiked(false);
      if (currentIndex < availableProfiles.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
        toast.info("You've seen all profiles! Starting over 💫");
      }
    }, 500);
  };

  const handleSkip = () => {
    if (!currentProfile) return;
    
    setSkippedIds(prev => new Set([...prev, currentProfile.id]));
    
    if (currentIndex >= availableProfiles.length - 1) {
      setCurrentIndex(0);
      if (availableProfiles.length <= 1) {
        toast.info("You've seen all profiles! Refreshing... 💫");
        setSkippedIds(new Set());
      }
    }
  };

  const handleComment = async (feature: string) => {
    if (!currentProfile) return;
    
    if (feature) {
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>You liked "{feature}"</span>
        </div>
      );
      
      // Create match with liked feature
      try {
        await createMatch.mutateAsync({
          userId: "00000000-0000-0000-0000-000000000000",
          matchedUserId: currentProfile.id,
          likedFeature: feature,
        });
      } catch (error) {
        console.error("Failed to create match:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] p-8">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] p-8 text-center">
        <p className="text-destructive mb-2">Failed to load profiles</p>
        <p className="text-muted-foreground text-sm">{String(error)}</p>
      </div>
    );
  }

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

  // Get image for profile
  const profileImage = profileImages[currentProfile.name] || profile1;

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
          photoUrl={profileImage}
          onLike={handleLike}
          onSkip={handleSkip}
          onComment={handleComment}
        />
      </AnimatePresence>
    </div>
  );
};
