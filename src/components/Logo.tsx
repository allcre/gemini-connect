import { motion } from "framer-motion";

export const Logo = ({ size = "default" }: { size?: "default" | "large" }) => {
  const textSize = size === "large" ? "text-3xl" : "text-xl";

  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className={`${textSize} font-heading italic font-semibold text-foreground`}>
        koveri
      </span>
    </motion.div>
  );
};
