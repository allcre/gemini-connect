import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export const Logo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const iconSize = size === "large" ? "w-10 h-10" : "w-6 h-6";
  const textSize = size === "large" ? "text-3xl" : "text-xl";

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <motion.div
          className={`${iconSize} gradient-primary rounded-lg flex items-center justify-center shadow-soft`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Heart className="w-4 h-4 text-primary-foreground fill-current" />
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-3 h-3 text-accent" />
        </motion.div>
      </div>
      <span className={`${textSize} font-display font-semibold text-foreground`}>
        Bio<span className="text-gradient">Match</span>
      </span>
    </motion.div>
  );
};
