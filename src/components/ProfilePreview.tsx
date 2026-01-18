import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoCarousel } from "@/components/ui/photo-carousel";
import type { UserProfile } from "@/types/profile";

interface ProfilePreviewProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onStartMatching: () => void;
  isEditable?: boolean;
  isInitialSetup?: boolean;
}

export const ProfilePreview = ({ profile, onSave, onStartMatching, isEditable = true, isInitialSetup = false }: ProfilePreviewProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (field: string, value: string) => {
    if (!isEditable) return;
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (!editingField) return;

    const updated = { ...profile };

    if (editingField === "bio") {
      updated.bio = editValue;
    } else if (editingField === "displayName") {
      updated.displayName = editValue;
    } else if (editingField.startsWith("prompt-")) {
      const index = parseInt(editingField.split("-")[1]);
      updated.promptAnswers = profile.promptAnswers.map((p, i) =>
        i === index ? { ...p, answerText: editValue, source: "user" as const } : p
      );
    }

    onSave(updated);
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24">
      {/* Header Photo Section */}
      <PhotoCarousel
        photos={profile.photos}
        aspectRatio="portrait"
        showDots
        showNavigation
        overlay={
          <div className="flex items-end justify-between">
            <div>
              {editingField === "displayName" ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="bg-background/90 w-40"
                    autoFocus
                  />
                  <Button size="icon-sm" onClick={saveEdit}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={cancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <h2
                  className="text-heading text-white cursor-pointer group flex items-center gap-2"
                  onClick={() => startEdit("displayName", profile.displayName)}
                >
                  {profile.displayName}{profile.age ? `, ${profile.age}` : ""}
                  {isEditable && <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </h2>
              )}
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

      {/* Bio */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-caption">About</h3>
          {isEditable && editingField !== "bio" && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => startEdit("bio", profile.bio)}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        {editingField === "bio" ? (
          <div className="space-y-2">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" onClick={saveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-body text-foreground">{profile.bio || "No bio yet"}</p>
        )}
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
      {profile.promptAnswers.map((prompt, index) => (
        <Card key={prompt.id} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-caption">{prompt.promptText}</p>
            {isEditable && editingField !== `prompt-${index}` && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => startEdit(`prompt-${index}`, prompt.answerText)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          {editingField === `prompt-${index}` ? (
            <div className="space-y-2">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={saveEdit}>Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-body text-foreground">{prompt.answerText}</p>
          )}
        </Card>
      ))}

      {/* Data Insights */}
      {profile.dataInsights.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {profile.dataInsights.map((insight) => (
            <Card key={insight.id} className="p-3 text-center">
              <p className="text-caption text-primary">{insight.metricValue}</p>
              <p className="text-caption">{insight.title}</p>
              <p className="text-caption">{insight.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Best Features */}
      {profile.bestFeatures && profile.bestFeatures.length > 0 && (
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

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pt-4"
      >
        <Button onClick={onStartMatching} variant="default" className="w-full" size="lg">
          <Sparkles className="w-5 h-5 mr-2" />
          {isInitialSetup ? "Start Matching" : "Keep Matching"}
        </Button>
        {isInitialSetup && (
          <p className="text-center text-caption mt-2">
            You can always edit your profile later
          </p>
        )}
      </motion.div>
    </div>
  );
};
