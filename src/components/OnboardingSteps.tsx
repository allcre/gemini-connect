import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconCircle } from "@/components/ui/icon-circle";

interface OnboardingStepsProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingSteps = ({ currentStep, totalSteps }: OnboardingStepsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            <IconCircle
              variant={isCompleted ? "primary" : isCurrent ? "ghost" : "default"}
              size="md"
              className={cn(
                "font-semibold transition-all duration-300",
                isCompleted && "shadow-md",
                isCurrent && "border-2 border-primary bg-primary/10 text-primary"
              )}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                index + 1
              )}
            </IconCircle>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-8 h-1 mx-1 rounded-full transition-all duration-300",
                  isCompleted ? "gradient-primary" : "bg-muted"
                )}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
