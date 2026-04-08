"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Workshop } from "@/components/workshop";
import { MissionHub } from "@/components/mission-hub";
import { LaunchSimulation } from "@/components/launch-simulation";
import { Leaderboard } from "@/components/leaderboard";
import { DailyChallenges } from "@/components/daily-challenges";
import { PlayerStats } from "@/components/player-stats";
import { GameNavigation, GameHeader } from "@/components/game-navigation";
import { GamePersistenceSync } from "@/components/game-persistence-sync";
import { useGameStore } from "@/lib/game-store";

// Pre-generated star positions to avoid hydration mismatch
const STAR_DATA = [
  { left: 12.5, top: 23.4, duration: 2.3, delay: 0.1 },
  { left: 87.2, top: 45.6, duration: 3.1, delay: 1.2 },
  { left: 34.8, top: 78.9, duration: 2.8, delay: 0.5 },
  { left: 56.3, top: 12.1, duration: 3.5, delay: 1.8 },
  { left: 91.7, top: 67.3, duration: 2.1, delay: 0.3 },
  { left: 23.4, top: 89.2, duration: 3.2, delay: 1.5 },
  { left: 67.8, top: 34.5, duration: 2.6, delay: 0.8 },
  { left: 45.2, top: 56.7, duration: 3.8, delay: 0.2 },
  { left: 78.9, top: 23.8, duration: 2.4, delay: 1.1 },
  { left: 15.6, top: 45.3, duration: 3.3, delay: 0.6 },
  { left: 92.3, top: 78.4, duration: 2.9, delay: 1.9 },
  { left: 38.7, top: 12.6, duration: 2.2, delay: 0.4 },
  { left: 61.4, top: 91.2, duration: 3.6, delay: 1.3 },
  { left: 84.1, top: 56.8, duration: 2.7, delay: 0.9 },
  { left: 27.9, top: 34.2, duration: 3.4, delay: 1.6 },
  { left: 53.6, top: 67.9, duration: 2.5, delay: 0.7 },
  { left: 96.2, top: 23.1, duration: 3.1, delay: 1.4 },
  { left: 19.8, top: 89.5, duration: 2.8, delay: 0.1 },
  { left: 72.4, top: 45.9, duration: 3.7, delay: 1.7 },
  { left: 41.7, top: 12.3, duration: 2.3, delay: 0.5 },
  { left: 88.5, top: 78.1, duration: 3.2, delay: 1.2 },
  { left: 31.2, top: 56.4, duration: 2.6, delay: 0.8 },
  { left: 64.9, top: 34.7, duration: 3.5, delay: 1.5 },
  { left: 8.3, top: 91.6, duration: 2.4, delay: 0.3 },
  { left: 75.6, top: 23.5, duration: 3.3, delay: 1.8 },
  { left: 48.1, top: 67.2, duration: 2.9, delay: 0.6 },
  { left: 93.8, top: 45.1, duration: 2.1, delay: 1.1 },
  { left: 22.7, top: 78.6, duration: 3.6, delay: 0.4 },
  { left: 59.4, top: 12.9, duration: 2.7, delay: 1.9 },
  { left: 86.1, top: 89.3, duration: 3.4, delay: 0.9 },
  { left: 35.8, top: 34.9, duration: 2.2, delay: 1.3 },
  { left: 68.5, top: 56.2, duration: 3.8, delay: 0.2 },
  { left: 12.9, top: 67.5, duration: 2.5, delay: 1.6 },
  { left: 79.6, top: 23.9, duration: 3.1, delay: 0.7 },
  { left: 46.3, top: 91.8, duration: 2.8, delay: 1.4 },
  { left: 94.7, top: 45.4, duration: 3.5, delay: 0.1 },
  { left: 25.4, top: 78.2, duration: 2.3, delay: 1.7 },
  { left: 62.1, top: 12.5, duration: 3.2, delay: 0.5 },
  { left: 89.8, top: 34.1, duration: 2.6, delay: 1.2 },
  { left: 33.5, top: 56.9, duration: 3.7, delay: 0.8 },
  { left: 71.2, top: 89.6, duration: 2.4, delay: 1.5 },
  { left: 16.9, top: 23.2, duration: 3.3, delay: 0.3 },
  { left: 54.6, top: 67.8, duration: 2.9, delay: 1.8 },
  { left: 98.3, top: 45.7, duration: 2.1, delay: 0.6 },
  { left: 28.7, top: 12.8, duration: 3.6, delay: 1.1 },
  { left: 65.4, top: 78.3, duration: 2.7, delay: 0.4 },
  { left: 11.1, top: 91.4, duration: 3.4, delay: 1.9 },
  { left: 82.8, top: 34.6, duration: 2.2, delay: 0.9 },
  { left: 39.5, top: 56.1, duration: 3.8, delay: 1.3 },
  { left: 76.2, top: 67.4, duration: 2.5, delay: 0.2 },
];

function StarField() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {STAR_DATA.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-foreground rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function RocketCommanderGame() {
  const { currentView, isLaunching } = useGameStore();

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <GamePersistenceSync />
      <StarField />
      
      <div className="relative z-10 pb-24 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <GameHeader />
          
          {!isLaunching && currentView !== "launch" && (
            <>
              <PlayerStats />
              <div className="mt-4">
                <GameNavigation />
              </div>
            </>
          )}

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {currentView === "workshop" && (
                <motion.div
                  key="workshop"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Workshop />
                </motion.div>
              )}

              {currentView === "missions" && (
                <motion.div
                  key="missions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <MissionHub />
                </motion.div>
              )}

              {currentView === "launch" && (
                <motion.div
                  key="launch"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <LaunchSimulation />
                </motion.div>
              )}

              {currentView === "leaderboard" && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Leaderboard />
                </motion.div>
              )}

              {currentView === "challenges" && (
                <motion.div
                  key="challenges"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <DailyChallenges />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
