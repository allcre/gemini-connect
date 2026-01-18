import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, X, MessageCircle, Star, Code, Film, Music, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiscoverProfile } from "@/types/profile";

interface ProfileCardProps {
  profile: DiscoverProfile;
  onLike: () => void;
  onSkip: () => void;
  onLikeFeature: (feature: string) => void;
}

export const ProfileCard = ({ profile, onLike, onSkip, onLikeFeature }: ProfileCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const yellowcake = profile.yellowcakeData;
  const hasActivityData = yellowcake && (yellowcake.codingHours || yellowcake.movieHours);

  const maxActivity = hasActivityData
    ? Math.max(yellowcake.codingHours || 0, yellowcake.movieHours || 0)
    : 1;
  const codingWidth = hasActivityData ? ((yellowcake.codingHours || 0) / maxActivity) * 100 : 0;
  const movieWidth = hasActivityData ? ((yellowcake.movieHours || 0) / maxActivity) * 100 : 0;

  const nextPhoto = () => {
    if (profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = () => {
    if (profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto space-y-4 pb-24"
    >
      {/* Header Photo Section */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
        <img
          src={profile.photos[currentPhotoIndex]?.url || "/placeholder.svg"}
          alt={profile.displayName}
          className="w-full h-full object-cover"
        />

        {profile.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {profile.photos.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentPhotoIndex ? "bg-primary" : "bg-background/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Compatibility Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-4 right-4"
        >
          <Badge variant="match" className="text-sm px-3 py-1.5 shadow-elevated">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {profile.compatibilityScore}% Match
          </Badge>
        </motion.div>

        {/* Name & Location */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                {profile.displayName}{profile.age ? `, ${profile.age}` : ""}
              </h2>
              {profile.location && (
                <p className="text-white/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">About</h3>
        </div>
        <p className="text-foreground font-bio text-lg leading-relaxed">{profile.bio || "No bio yet"}</p>
      </Card>

      {/* Fun Facts */}
      {profile.funFacts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.funFacts.map((fact) => (
            <motion.button
              key={fact.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLikeFeature(`${fact.label}: ${fact.value}`)}
            >
              <Badge variant="outline" className="px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                <span className="font-medium">{fact.label}:</span>
                <span className="ml-1">{fact.value}</span>
              </Badge>
            </motion.button>
          ))}
        </div>
      )}

      {/* Prompt Answers */}
      {profile.promptAnswers.map((prompt) => (
        <motion.button
          key={prompt.id}
          whileHover={{ scale: 1.01 }}
          onClick={() => onLikeFeature(prompt.answerText)}
          className="w-full text-left"
        >
          <Card className="p-4 hover:shadow-soft transition-shadow cursor-pointer">
            <p className="text-sm font-medium font-display text-muted-foreground mb-2">{prompt.promptText}</p>
            <p className="text-foreground text-lg">{prompt.answerText}</p>
          </Card>
        </motion.button>
      ))}

      {/* Data Insights */}
      {profile.dataInsights.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {profile.dataInsights.map((insight) => (
            <motion.button
              key={insight.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onLikeFeature(insight.title)}
              className="text-left"
            >
              <Card className="p-3 hover:shadow-soft transition-shadow cursor-pointer h-full">
                <p className="text-2xl font-bold text-primary">{insight.metricValue}</p>
                <p className="text-sm font-medium font-display">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </Card>
            </motion.button>
          ))}
        </div>
      )}

      {/* Activity Chart */}
      {hasActivityData && (
        <Card className="p-4">
          <p className="text-sm font-medium font-display mb-3">Weekly Activity</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Code className="w-4 h-4 text-chart-1" />
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${codingWidth}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full bg-chart-1 rounded-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {yellowcake.codingHours}h
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Film className="w-4 h-4 text-chart-3" />
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${movieWidth}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full bg-chart-3 rounded-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {yellowcake.movieHours}h
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Best Features - Likeable */}
      {profile.bestFeatures.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Best Features
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.bestFeatures.map((feature, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLikeFeature(feature)}
                className="group"
              >
                <Badge variant="insight" className="cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Heart className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {feature}
                </Badge>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Music Genres */}
      {yellowcake?.musicGenres && yellowcake.musicGenres.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Music className="w-4 h-4 text-accent" />
          {yellowcake.musicGenres.map((genre, i) => (
            <Badge key={i} variant="data" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="skip" size="icon-lg" onClick={onSkip}>
            <X className="w-6 h-6" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="glass" size="icon" onClick={() => {}}>
            <MessageCircle className="w-5 h-5" />
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button variant="like" size="icon-lg" onClick={onLike}>
            <Heart className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
