import { motion } from "framer-motion";
import { Heart, X, MessageCircle, Star, Code, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/hooks/useProfiles";

interface ProfileCardProps {
  profile: Profile;
  photoUrl: string;
  onLike: () => void;
  onSkip: () => void;
  onComment: (feature: string) => void;
}

export const ProfileCard = ({ profile, photoUrl, onLike, onSkip, onComment }: ProfileCardProps) => {
  const yellowcake = profile.yellowcake_data || {};
  const codingHours = yellowcake.codingHours || 0;
  const movieHours = yellowcake.movieHours || 0;
  const maxHours = Math.max(codingHours, movieHours, 1);
  const codingWidth = (codingHours / maxHours) * 100;
  const movieWidth = (movieHours / maxHours) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <Card variant="profile" className="overflow-hidden">
        {/* Photo Section */}
        <div className="relative aspect-[4/5]">
          <img
            src={photoUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          
          {/* Compatibility Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute top-4 right-4"
          >
            <Badge variant="match" className="text-sm px-3 py-1.5 shadow-elevated">
              <Star className="w-3 h-3 mr-1 fill-current" />
              {profile.compatibility_score}% Match
            </Badge>
          </motion.div>

          {/* Name & Location */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 text-white">
            <h2 className="font-display text-2xl font-semibold">
              {profile.name}{profile.age ? `, ${profile.age}` : ""}
            </h2>
            {profile.location && (
              <p className="text-white/80 text-sm">{profile.location}</p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <p className="text-foreground leading-relaxed">{profile.bio}</p>
          )}

          {/* Best Features - Likeable */}
          {profile.best_features && profile.best_features.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Best Features
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.best_features.map((feature, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComment(feature)}
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

          {/* Data Insights */}
          {(yellowcake.topRepos || yellowcake.musicGenres) && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Data Insights
              </p>

              {/* Activity Chart */}
              {(codingHours > 0 || movieHours > 0) && (
                <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-medium">Weekly Activity</p>
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
                        {codingHours}h
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
                        {movieHours}h
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Repos */}
              {yellowcake.topRepos && yellowcake.topRepos.length > 0 && (
                <div className="space-y-2">
                  {yellowcake.topRepos.slice(0, 1).map((repo, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onComment(repo.name)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
                        <Code className="w-5 h-5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">{repo.language}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          ⭐ {repo.stars}
                        </Badge>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Music Genres */}
              {yellowcake.musicGenres && yellowcake.musicGenres.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Music className="w-4 h-4 text-accent" />
                  {yellowcake.musicGenres.map((genre, i) => (
                    <Badge key={i} variant="data" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 p-6 pt-0">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="skip" size="icon-lg" onClick={onSkip}>
              <X className="w-6 h-6" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="glass" size="icon" onClick={() => onComment("")}>
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
      </Card>
    </motion.div>
  );
};
