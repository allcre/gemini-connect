import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Star, Code, Film, Music, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoCarousel } from "@/components/ui/photo-carousel";
import type { DiscoverProfile } from "@/types/profile";

interface ProfileCardProps {
  profile: DiscoverProfile;
  onLike: () => void;
  onSkip: () => void;
  onLikeFeature: (feature: string) => void;
}

export const ProfileCard = ({ profile, onLike, onSkip, onLikeFeature }: ProfileCardProps) => {
  const yellowcake = profile.yellowcakeData;
  const hasActivityData = yellowcake && (yellowcake.codingHours || yellowcake.movieHours);

  const maxActivity = hasActivityData
    ? Math.max(yellowcake.codingHours || 0, yellowcake.movieHours || 0)
    : 1;
  const codingWidth = hasActivityData ? ((yellowcake.codingHours || 0) / maxActivity) * 100 : 0;
  const movieWidth = hasActivityData ? ((yellowcake.movieHours || 0) / maxActivity) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto space-y-4 pb-24"
    >
      {/* Header Photo Section */}
      <div className="relative">
        <PhotoCarousel
          photos={profile.photos}
          aspectRatio="portrait"
          showDots
          showNavigation
          overlay={
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-heading text-white">
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
          }
        />

        {/* Compatibility Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute top-4 right-4 z-10"
        >
          <Badge variant="match" className="text-sm px-3 py-1.5 shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {profile.compatibilityScore}% Match
          </Badge>
        </motion.div>
      </div>

      {/* Bio */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-caption">About</h3>
        </div>
        <p className="text-body text-foreground">{profile.bio || "No bio yet"}</p>
      </Card>

      {/* Fun Facts */}
      {profile.funFacts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.funFacts.map((fact) => (
            <Badge key={fact.id} variant="outline" className="px-3 py-1.5">
              <span className="font-medium">{fact.label}:</span>
              <span className="ml-1">{fact.value}</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Prompt Answers */}
      {profile.promptAnswers.map((prompt) => (
        <Card key={prompt.id} className="p-4">
          <p className="text-caption mb-2">{prompt.promptText}</p>
          <p className="text-body text-foreground">{prompt.answerText}</p>
        </Card>
      ))}

      {/* Data Insights */}
      {profile.dataInsights.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {profile.dataInsights.map((insight) => (
            <Card key={insight.id} className="p-3 h-full">
              <p className="text-caption text-primary">{insight.metricValue}</p>
              <p className="text-caption">{insight.title}</p>
              <p className="text-caption">{insight.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Chart */}
      {hasActivityData && (
        <Card className="p-4">
          <p className="text-caption mb-3">Weekly Activity</p>
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
              <span className="text-caption w-12 text-right">
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
              <span className="text-caption w-12 text-right">
                {yellowcake.movieHours}h
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Best Features */}
      {profile.bestFeatures.length > 0 && (
        <div className="space-y-2">
          <p className="text-caption uppercase tracking-wide">
            Best Features
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.bestFeatures.map((feature, i) => (
              <Badge key={i} variant="insight" className="px-3 py-1.5">
                {feature}
              </Badge>
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
          <Button variant="outline" size="icon-lg" onClick={onSkip}>
            <ArrowRight className="w-6 h-6" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="default" size="icon-lg" onClick={() => {}}>
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
