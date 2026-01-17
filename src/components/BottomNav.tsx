import { motion } from "framer-motion";
import { Home, Search, MessageCircle, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "discover", icon: Home, label: "Discover" },
  { id: "coach", icon: Sparkles, label: "Coach" },
  { id: "matches", icon: MessageCircle, label: "Matches" },
  { id: "profile", icon: User, label: "Profile" },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full relative transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 gradient-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
