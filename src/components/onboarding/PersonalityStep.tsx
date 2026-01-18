import { Target, Users, Heart, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { StepProps } from "./types";

export const PersonalityStep = ({ formData, updateField }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-caption mb-2 block">What are you looking for?</label>
          <RadioGroup
            value={formData.lookingFor}
            onValueChange={(value) => updateField("lookingFor", value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friend" id="friend" />
              <Label htmlFor="friend" className="flex items-center gap-2 cursor-pointer font-normal">
                <Users className="w-4 h-4" />
                Friend
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="romantic" id="romantic" />
              <Label
                htmlFor="romantic"
                className="flex items-center gap-2 cursor-pointer font-normal"
              >
                <Heart className="w-4 h-4" />
                Romantic Partner
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hackathon" id="hackathon" />
              <Label
                htmlFor="hackathon"
                className="flex items-center gap-2 cursor-pointer font-normal"
              >
                <Code2 className="w-4 h-4" />
                Hackathon Buddy
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <label className="text-caption mb-1.5 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Who are you trying to attract?
          </label>
          <Textarea
            placeholder="e.g., Creative introverts who love A24 films, cozy coffee shops, and late-night coding sessions..."
            className="min-h-[80px] resize-none"
            value={formData.targetAudience}
            onChange={(e) => updateField("targetAudience", e.target.value)}
          />
        </div>
        <div>
          <label className="text-caption mb-1.5 block">Anything else about yourself?</label>
          <Textarea
            placeholder="Your vibe, hobbies, what makes you tick..."
            className="min-h-[70px] resize-none"
            value={formData.aboutMe}
            onChange={(e) => updateField("aboutMe", e.target.value)}
          />
        </div>
        <div>
          <label className="text-caption mb-1.5 block">What do you want to highlight?</label>
          <Input
            placeholder="e.g., My indie film taste, open source projects..."
            value={formData.highlights}
            onChange={(e) => updateField("highlights", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export const personalityStepConfig = {
  title: "Tell Us More",
  subtitle: "Help us craft the perfect profile for you",
  isValid: (formData: { lookingFor: string; targetAudience: string }) =>
    formData.lookingFor.length > 0 && formData.targetAudience.length > 0,
};
