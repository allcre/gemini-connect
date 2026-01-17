import { motion } from "framer-motion";
import { Edit2, MapPin, Code, Film, Music, Star, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile, getInterleavedContent, ProfileContentItem } from "@/types/profile";

interface ProfilePreviewProps {
  profile: UserProfile;
  onEdit: () => void;
  isEditable?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  film: Film,
  music: Music,
  star: Star,
  headphones: Headphones,
};

export const ProfilePreview = ({ profile, onEdit, isEditable = true }: ProfilePreviewProps) => {
  const content = getInterleavedContent(profile);
  
  const renderPhoto = (item: ProfileContentItem & { type: "photo" }) => (
    <motion.div
      key={item.data.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted"
    >
      <img
        src={item.data.url}
        alt="Profile photo"
        className="w-full h-full object-cover"
      />
      {item.data.isPrimary && (
        <Badge className="absolute top-3 left-3" variant="secondary">
          Primary
        </Badge>
      )}
    </motion.div>
  );

  const renderPrompt = (item: ProfileContentItem & { type: "prompt" }) => (
    <motion.div
      key={item.data.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-5 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {item.data.promptText}
        </p>
        <p className="text-lg font-display">{item.data.answerText}</p>
        {item.data.source === "llm" && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>AI Generated</span>
          </div>
        )}
      </Card>
    </motion.div>
  );

  const renderFunFacts = (facts: Array<ProfileContentItem & { type: "funFact" }>) => {
    if (facts.length === 0) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {facts.map((item) => {
          const IconComponent = item.data.icon ? iconMap[item.data.icon] : null;
          return (
            <Badge
              key={item.data.id}
              variant="insight"
              className="flex items-center gap-1.5 py-1.5 px-3"
            >
              {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
              <span className="font-medium">{item.data.label}:</span>
              <span>{item.data.value}</span>
            </Badge>
          );
        })}
      </motion.div>
    );
  };

  const renderDataInsight = (item: ProfileContentItem & { type: "dataInsight" }) => (
    <motion.div
      key={item.data.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4 bg-secondary/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{item.data.title}</p>
            <p className="text-sm text-muted-foreground">{item.data.description}</p>
          </div>
          {item.data.type === "badge" && (
            <Badge variant="match">{item.data.metricValue}</Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );

  // Group fun facts together for rendering
  const funFactItems = content.filter((c): c is ProfileContentItem & { type: "funFact" } => c.type === "funFact");
  const otherContent = content.filter(c => c.type !== "funFact");

  return (
    <div className="space-y-6 pb-24">
      {/* Header Section */}
      <div className="text-center space-y-4">
        {/* Primary Photo */}
        {profile.photos.length > 0 && (
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary/20">
            <img
              src={profile.photos.find(p => p.isPrimary)?.url || profile.photos[0]?.url || "/placeholder.svg"}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div>
          <h1 className="font-display text-3xl font-bold">
            {profile.displayName}
            {profile.age && <span className="font-normal text-muted-foreground ml-2">{profile.age}</span>}
          </h1>
          {profile.location && (
            <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {profile.location}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="p-4 text-left">
            <p className="text-foreground">{profile.bio}</p>
          </Card>
        )}

        {/* Looking For */}
        {profile.lookingFor && (
          <Badge variant="outline" className="text-sm">
            Looking for: {profile.lookingFor}
          </Badge>
        )}

        {isEditable && (
          <Button variant="outline" onClick={onEdit} className="mt-2">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Fun Facts Row */}
      {funFactItems.length > 0 && renderFunFacts(funFactItems)}

      {/* Interleaved Content */}
      <div className="space-y-4">
        {otherContent.map((item) => {
          switch (item.type) {
            case "photo":
              return renderPhoto(item);
            case "prompt":
              return renderPrompt(item);
            case "dataInsight":
              return renderDataInsight(item);
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
