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
    <div className="max-w-md mx-auto space-y-2 pb-24">
      {/* Header Photo Section */}
      <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
        <div className="space-y-2">
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
                        className="text-[2rem] font-heading text-white cursor-pointer group flex items-center gap-2"
                        onClick={() => startEdit("displayName", profile.displayName)}
                      >
                        {profile.displayName}{profile.age ? `, ${profile.age}` : ""}
                        {isEditable && <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </h2>
                    )}
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
          </div>

          {/* Bio */}
          <div className="rounded-md p-3 bg-background">
            {isEditable && editingField !== "bio" && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => startEdit("bio", profile.bio)}
                className="float-right"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
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
          </div>
        </div>
      </Card>

      {/* Fun Facts */}
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

      {/* Prompt Answers */}
      {profile.promptAnswers.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Questions & Answers</h3>
          <div className="space-y-3">
            {profile.promptAnswers.map((prompt, index) => (
              <div key={prompt.id} className="rounded-md p-3 bg-background">
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
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Data Insights */}
      {profile.dataInsights.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Data Insights</h3>
          <div className="grid grid-cols-2 gap-3">
            {profile.dataInsights.map((insight) => (
              <div key={insight.id} className="rounded-md p-3 bg-background text-center">
                <p className="text-caption text-primary">{insight.metricValue}</p>
                <p className="text-caption">{insight.title}</p>
                <p className="text-caption">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Best Features */}
      {profile.bestFeatures && profile.bestFeatures.length > 0 && (
        <Card className="rounded-md p-4 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-heading font-medium text-foreground mb-3">Best Features</h3>
          <div className="flex flex-wrap gap-2">
            {profile.bestFeatures.map((feature, i) => (
              <div key={i} className="rounded-md px-3 py-1.5 bg-background">
                <span className="text-caption">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
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
