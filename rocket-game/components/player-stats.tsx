"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Trophy, Rocket } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

export function PlayerStats() {
  const { playerName, xp, level, missionsCompleted } = useGameStore();

  const xpForNextLevel = level * 500;
  const xpProgress = ((xp % 500) / 500) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-4 flex-wrap">
        {/* Avatar & Name */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-card-foreground">{playerName}</h3>
            <Badge variant="default" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Level {level}
            </Badge>
          </div>
        </div>

        {/* XP Progress */}
        <div className="flex-1 min-w-48">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              XP Progress
            </span>
            <span className="font-medium text-card-foreground">
              {xp} / {xpForNextLevel}
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{xp}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-accent flex items-center gap-1">
              <Trophy className="h-5 w-5" />
              {missionsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Missions</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
