import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import type { StepProps, OnboardingFormData } from "./types";

interface PhotosStepProps extends StepProps {
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
}

export const PhotosStep = ({ formData, onPhotoUpload, onRemovePhoto }: PhotosStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: formData.photos[i] ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors relative overflow-hidden"
          >
            {formData.photos[i] ? (
              <>
                <img
                  src={formData.photos[i]}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePhoto(i);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <label className="w-full h-full flex items-center justify-center cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onPhotoUpload}
                />
              </label>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-caption text-center">
        Tip: Show your hobbies, smile, and be authentic!
      </p>
    </div>
  );
};

export const photosStepConfig = {
  title: "Show Your Best Self",
  subtitle: "Upload photos that capture who you are",
  isValid: () => true,
};
