import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Check, X, ChevronLeft, ChevronRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserProfile, PromptAnswer, FunFact, DataInsight } from "@/types/profile";

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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  const nextPhoto = () => {
    if (profile.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = () => {
    if (profile.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24">
      {/* Header Photo Section */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
        {profile.photos.length > 0 ? (
          <>
            <img
              src={profile.photos[currentPhotoIndex]?.url}
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                👤
              </div>
              <p>No photos yet</p>
            </div>
          </div>
        )}
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
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
                  className="font-display text-2xl font-semibold text-white cursor-pointer group flex items-center gap-2"
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
        </div>
      </div>

      {/* Bio */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">About</h3>
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
          <p className="text-foreground font-bio text-lg leading-relaxed">{profile.bio || "No bio yet"}</p>
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
            <p className="text-sm font-medium font-display text-muted-foreground">{prompt.promptText}</p>
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
            <p className="text-foreground text-lg">{prompt.answerText}</p>
          )}
        </Card>
      ))}

      {/* Data Insights */}
      {profile.dataInsights.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {profile.dataInsights.map((insight) => (
            <Card key={insight.id} className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{insight.metricValue}</p>
              <p className="text-sm font-medium font-display">{insight.title}</p>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Best Features */}
      {profile.bestFeatures && profile.bestFeatures.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
        <Button onClick={onStartMatching} className="w-full" size="lg">
          <Sparkles className="w-5 h-5 mr-2" />
          {isInitialSetup ? "Start Matching" : "Keep Matching"}
        </Button>
        {isInitialSetup && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            You can always edit your profile later
          </p>
        )}
      </motion.div>
    </div>
  );
};
