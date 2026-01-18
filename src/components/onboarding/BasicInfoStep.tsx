import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { StepProps } from "./types";

export const BasicInfoStep = ({ formData, updateField }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Your name"
            className="pl-12"
            value={formData.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="Age"
            className="w-24"
            value={formData.age}
            onChange={(e) => updateField("age", e.target.value)}
          />
          <Input
            placeholder="City, State"
            className="flex-1"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export const basicInfoStepConfig = {
  title: "Let's Meet You",
  subtitle: "The basics to get started",
  isValid: (formData: { displayName: string }) => formData.displayName.length > 0,
};
