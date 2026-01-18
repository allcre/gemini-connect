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
        className="pb-2"
      >
        <Card className="p-3 border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-2">
            <IconCircle variant="destructive" size="sm">
              <X className="w-4 h-4" />
            </IconCircle>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-semibold text-destructive">Formatting Issue</h4>
              <p className="text-xs text-muted-foreground break-words">
                The coach tried to suggest changes, but there was a formatting issue. You can
                ask them to try again or rephrase your request.
              </p>
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
      className="pb-2 space-y-2"
    >
      <Card className="p-3 space-y-3 border-primary/50 bg-card/50 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-caption text-foreground">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Preview Changes</span>
        </div>

        {update.field === "bio" && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              New Bio:
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap bg-background/50 p-2.5 rounded-lg border border-border break-words">
              {previewProfile.bio}
            </p>
          </div>
        )}

        {update.field === "promptAnswers" && update.action === "add" && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              New Prompt:
            </p>
            <div className="bg-background/50 p-2.5 rounded-lg border border-border space-y-1.5">
              <p className="text-xs text-muted-foreground break-words">
                {update.data.promptText}
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {update.data.answerText}
              </p>
            </div>
          </div>
        )}

        {update.field === "promptAnswers" && update.action === "replace" && (
          <div className="space-y-1.5">
            {Array.isArray(update.data) ? (
              <>
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Updated Prompts ({update.data.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {update.data.map((prompt: any, i: number) => (
                    <div
                      key={i}
                      className="bg-background/50 p-2.5 rounded-lg border border-border space-y-1"
                    >
                      <p className="text-xs text-muted-foreground break-words">
                        {prompt.promptText}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {prompt.answerText}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                <p className="text-xs text-destructive break-words">
                  Invalid data format: Expected array for replace action
                </p>
              </div>
            )}
          </div>
        )}

        {update.field === "funFacts" && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              New Fun Fact:
            </p>
            <div className="bg-background/50 p-2.5 rounded-lg border border-border">
              <p className="text-sm text-foreground break-words">
                <span className="font-semibold">{update.data.label}:</span> {update.data.value}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Apply/Decline Buttons*/}
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1 bg-match hover:bg-match/90 text-match-foreground" size="sm">
          <Check className="w-3.5 h-3.5 mr-1.5" />
          <span className="text-xs">Apply</span>
        </Button>
        <Button onClick={onDecline} variant="ghost" size="sm" className="flex-1 bg-background/80 hover:bg-background">
          <X className="w-3.5 h-3.5 mr-1.5" />
          <span className="text-xs">Decline</span>
        </Button>
      </div>
    </motion.div>
  );
};
