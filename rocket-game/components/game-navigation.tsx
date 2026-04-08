"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Target, 
  Trophy, 
  Calendar,
  Rocket 
} from "lucide-react";
import { useGameStore } from "@/lib/game-store";

const navItems = [
  { id: "workshop", label: "Workshop", icon: Wrench },
  { id: "missions", label: "Missions", icon: Target },
  { id: "challenges", label: "Daily", icon: Calendar },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
] as const;

export function GameNavigation() {
  const { currentView, setCurrentView } = useGameStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-50 md:relative md:border-t-0 md:bg-transparent">
      <div className="flex items-center justify-center gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="button"
                variant={isActive ? "default" : "ghost"}
                className={`touch-manipulation flex flex-col items-center gap-1 h-auto py-3 px-4 md:flex-row md:gap-2 ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onTouchStart={() => setCurrentView(item.id)}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm">{item.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

export function GameHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Rocket className="h-10 w-10 text-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Rocket Commander
        </h1>
      </div>
      <p className="text-muted-foreground text-lg">
        Build. Launch. Explore the Cosmos!
      </p>
    </motion.header>
  );
}
