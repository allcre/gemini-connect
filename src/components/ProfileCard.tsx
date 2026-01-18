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
      className="w-full max-w-md mx-auto space-y-2 pb-24"
    >
      {/* Photo + Bio Section */}
      <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
        <div className="space-y-2">
          {/* Photo */}
          <div className="relative rounded-md overflow-hidden aspect-square">
            <PhotoCarousel
              photos={profile.photos}
              aspectRatio="square"
              showDots
              showNavigation
              className="rounded-md"
              overlay={
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-[2rem] font-heading text-white">
                      {profile.displayName}{profile.age ? `, ${profile.age}` : ""}
                    </h2>
                    {profile.location && (
                      <p className="text-xs text-white/80 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
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
              className="absolute top-2 right-2 z-10"
            >
              <Badge variant="match" className="text-xs px-2 py-1 shadow-lg">
                <Star className="w-2.5 h-2.5 mr-1 fill-current" />
                {profile.compatibilityScore}%
              </Badge>
            </motion.div>
          </div>

          {/* Bio */}
          <div className="rounded-md p-3 bg-background">
            <p className="text-body text-foreground">{profile.bio || "No bio yet"}</p>
          </div>
        </div>
      </Card>

      {/* Fun Facts Section */}
      {profile.funFacts.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Quick Facts</h3>
          <div className="flex flex-wrap gap-2">
            {profile.funFacts.map((fact) => (
              <div key={fact.id} className="rounded-md px-3 py-1.5 bg-background">
                <span className="font-medium text-caption">{fact.label}:</span>
                <span className="ml-1 text-caption">{fact.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Questions + Answers Section */}
      {profile.promptAnswers.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Questions & Answers</h3>
          <div className="space-y-2">
            {profile.promptAnswers.map((prompt) => (
              <div key={prompt.id} className="rounded-md p-3 bg-background">
                <p className="text-caption mb-2 font-medium">{prompt.promptText}</p>
                <p className="text-body text-foreground">{prompt.answerText}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Data Insights Section */}
      {profile.dataInsights.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Data Insights</h3>
          <div className="grid grid-cols-2 gap-2">
            {profile.dataInsights.map((insight) => (
              <div key={insight.id} className="rounded-md p-3 h-full bg-background">
                <p className="text-caption text-primary font-semibold">{insight.metricValue}</p>
                <p className="text-caption font-medium">{insight.title}</p>
                <p className="text-caption text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Chart Section */}
      {hasActivityData && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Weekly Activity</h3>
          <div className="space-y-2">
            <div className="rounded-md p-3 bg-background">
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
            </div>
            <div className="rounded-md p-3 bg-background">
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
          </div>
        </Card>
      )}

      {/* Best Features Section */}
      {profile.bestFeatures.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3 tracking-wide">
            Best Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.bestFeatures.map((feature, i) => (
              <div key={i} className="rounded-md px-3 py-1.5 bg-background">
                <span className="text-caption">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Music Genres Section */}
      {yellowcake?.musicGenres && yellowcake.musicGenres.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-accent" />
            <h3 className="text-lg font-heading font-medium text-foreground">Music Taste</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {yellowcake.musicGenres.map((genre, i) => (
              <div key={i} className="rounded-md px-3 py-1.5 bg-background">
                <span className="text-caption text-xs">{genre}</span>
              </div>
            ))}
          </div>
        </Card>
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
