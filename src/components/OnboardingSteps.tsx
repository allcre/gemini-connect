import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                isCompleted && "gradient-primary text-primary-foreground shadow-soft",
                isCurrent && "border-2 border-primary bg-primary/10 text-primary",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
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
            </div>
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
