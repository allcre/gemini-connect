import { Github, Film, Music, MessageSquare, BookOpen, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { StepProps } from "./types";

const platforms = [
  { key: "github", label: "GitHub", icon: Github, placeholder: "GitHub username" },
  { key: "letterboxd", label: "Letterboxd", icon: Film, placeholder: "Letterboxd username" },
  { key: "spotify", label: "Spotify", icon: Music, placeholder: "Spotify username" },
  { key: "twitter", label: "X/Twitter", icon: MessageSquare, placeholder: "X/Twitter username" },
  { key: "substack", label: "Substack", icon: BookOpen, placeholder: "Substack username" },
  { key: "steam", label: "Steam", icon: Gamepad2, placeholder: "Steam username" },
] as const;

type PlatformKey = (typeof platforms)[number]["key"];

const usernameFieldMap: Record<PlatformKey, keyof StepProps["formData"]> = {
  github: "githubUsername",
  letterboxd: "letterboxdUsername",
  spotify: "spotifyUsername",
  twitter: "twitterUsername",
  substack: "substackUsername",
  steam: "steamUsername",
};

interface PlatformsStepProps extends StepProps {
  selectedPlatforms: string[];
  setSelectedPlatforms: (platforms: string[]) => void;
}

export const PlatformsStep = ({
  formData,
  updateField,
  selectedPlatforms,
  setSelectedPlatforms,
}: PlatformsStepProps) => {
  const handlePlatformToggle = (platformKey: PlatformKey, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platformKey]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platformKey));
      updateField(usernameFieldMap[platformKey], "");
    }
  };

  const getUsernameValue = (platformKey: PlatformKey): string => {
    return formData[usernameFieldMap[platformKey]] as string;
  };

  const setUsernameValue = (platformKey: PlatformKey, value: string) => {
    updateField(usernameFieldMap[platformKey], value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-caption">Select platforms to connect:</Label>
        <div className="grid grid-cols-1 gap-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.key);
            return (
              <div key={platform.key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.key}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handlePlatformToggle(platform.key, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={platform.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    {platform.label}
                  </Label>
                </div>
                {isSelected && (
                  <div className="relative pl-6">
                    <Input
                      placeholder={platform.placeholder}
                      className="pl-10"
                      value={getUsernameValue(platform.key)}
                      onChange={(e) => setUsernameValue(platform.key, e.target.value)}
                    />
                    <Icon className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-caption text-center">
        We'll use this to highlight your unique interests
      </p>
    </div>
  );
};

export const platformsStepConfig = {
  title: "Connect Your World",
  subtitle: "Select which platforms to connect and analyze",
  isValid: () => true,
};
