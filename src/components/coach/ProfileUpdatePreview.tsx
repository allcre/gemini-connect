import { motion } from "framer-motion";
import { Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/icon-circle";
import type { UserProfile } from "@/types/profile";

interface ProfileUpdatePreviewProps {
  update: any;
  previewProfile: UserProfile | null;
  isValid: boolean;
  onApply: () => void;
  onDecline: () => void;
}

export const ProfileUpdatePreview = ({
  update,
  previewProfile,
  isValid,
  onApply,
  onDecline,
}: ProfileUpdatePreviewProps) => {
  // Show error message if update exists but is invalid
  if (!isValid) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="px-4 pb-2"
      >
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <IconCircle variant="destructive" size="md">
              <X className="w-5 h-5" />
            </IconCircle>
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-caption text-destructive">Formatting Issue</h4>
                <p className="text-caption mt-1">
                  The coach tried to suggest changes, but there was a formatting issue. You can
                  ask them to try again or rephrase your request.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Show normal preview for valid updates
  if (!previewProfile || !update) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="px-4 pb-2 space-y-2"
    >
      <Card className="p-4 space-y-3 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 text-caption text-primary">
          <Sparkles className="w-4 h-4" />
          Preview Changes
        </div>

        {update.field === "bio" && (
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-wide">
              New Bio:
            </p>
            <p className="text-body text-foreground whitespace-pre-wrap bg-background/50 p-3 rounded-lg border border-border">
              {previewProfile.bio}
            </p>
          </div>
        )}

        {update.field === "promptAnswers" && update.action === "add" && (
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-wide">
              New Prompt:
            </p>
            <div className="bg-background/50 p-3 rounded-lg border border-border space-y-2">
              <p className="text-caption">
                {update.data.promptText}
              </p>
              <p className="text-body text-foreground whitespace-pre-wrap">
                {update.data.answerText}
              </p>
            </div>
          </div>
        )}

        {update.field === "promptAnswers" && update.action === "replace" && (
          <div className="space-y-2">
            {Array.isArray(update.data) ? (
              <>
                <p className="text-caption uppercase tracking-wide">
                  Updated Prompts ({update.data.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {update.data.map((prompt: any, i: number) => (
                    <div
                      key={i}
                      className="bg-background/50 p-3 rounded-lg border border-border space-y-1"
                    >
                      <p className="text-caption">
                        {prompt.promptText}
                      </p>
                      <p className="text-body text-foreground whitespace-pre-wrap">
                        {prompt.answerText}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <p className="text-caption text-destructive">
                  Invalid data format: Expected array for replace action
                </p>
              </div>
            )}
          </div>
        )}

        {update.field === "funFacts" && (
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-wide">
              New Fun Fact:
            </p>
            <div className="bg-background/50 p-3 rounded-lg border border-border">
              <p className="text-body text-foreground">
                <span className="font-semibold">{update.data.label}:</span> {update.data.value}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Apply/Decline Buttons */}
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1" size="lg">
          <Check className="w-4 h-4 mr-2" />
          Apply Changes
        </Button>
        <Button onClick={onDecline} variant="outline" size="lg" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Decline
        </Button>
      </div>
    </motion.div>
  );
};
