"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Gift,
  CheckCircle,
  Rocket,
  Target,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  useGameStore,
  calculateSuccessProbability,
} from "@/lib/game-store";

export function DailyChallenges() {
  const {
    initDailyChallenge,
    rocketConfig,
    selectMission,
    startLaunch,
    setCurrentView,
    dailyChallenge,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState("");

  // Initialize daily challenge on mount (in useEffect to avoid setState during render)
  useEffect(() => {
    initDailyChallenge();
  }, [initDailyChallenge]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state until daily challenge is initialized
  if (!dailyChallenge) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading daily challenge...</p>
        </div>
      </div>
    );
  }

  const successRate = calculateSuccessProbability(rocketConfig, dailyChallenge.mission);

  const handleStartChallenge = () => {
    selectMission(dailyChallenge.mission);
    setCurrentView("workshop");
  };

  const handleLaunchChallenge = () => {
    selectMission(dailyChallenge.mission);
    startLaunch();
  };

  // Generate weekly challenges (static for demo)
  const weeklyProgress = [
    { day: "Mon", completed: true },
    { day: "Tue", completed: true },
    { day: "Wed", completed: true },
    { day: "Thu", completed: dailyChallenge.completed },
    { day: "Fri", completed: false },
    { day: "Sat", completed: false },
    { day: "Sun", completed: false },
  ];

  const streak = weeklyProgress.filter((d) => d.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-4"
        >
          <Calendar className="h-10 w-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Daily Challenges</h1>
        <p className="text-muted-foreground">Complete daily missions for bonus XP!</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Challenge */}
        <Card className={`${dailyChallenge.completed ? "bg-accent/10 border-accent" : "bg-primary/10 border-primary"}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Target className="h-5 w-5 text-primary" />
                Today&apos;s Challenge
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{timeLeft}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyChallenge.completed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold text-accent mb-2">Challenge Complete!</h3>
                <p className="text-muted-foreground">Come back tomorrow for a new challenge</p>
              </motion.div>
            ) : (
              <>
                <div className="text-center py-4 bg-card/50 rounded-lg">
                  <span className="text-5xl mb-2 block">
                    {dailyChallenge.mission.destination === "Moon" && "🌙"}
                    {dailyChallenge.mission.destination === "Mars" && "🔴"}
                    {dailyChallenge.mission.destination === "Europa" && "🧊"}
                    {dailyChallenge.mission.destination === "Titan" && "🟠"}
                  </span>
                  <h3 className="text-xl font-bold text-card-foreground">{dailyChallenge.mission.name}</h3>
                  <p className="text-muted-foreground">{dailyChallenge.mission.destination}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">
                    Difficulty: {dailyChallenge.mission.difficulty}
                  </Badge>
                  <Badge variant="secondary">
                    Distance: {dailyChallenge.mission.distance} km
                  </Badge>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className={`font-bold ${
                      successRate >= 70 ? "text-accent" : successRate >= 40 ? "text-warning" : "text-destructive"
                    }`}>
                      {successRate}%
                    </span>
                  </div>
                  <Progress
                    value={successRate}
                    className={`h-2 ${
                      successRate >= 70
                        ? "[&>div]:bg-accent"
                        : successRate >= 40
                        ? "[&>div]:bg-warning"
                        : "[&>div]:bg-destructive"
                    }`}
                  />
                </div>

                <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold text-primary">
                    <Gift className="h-5 w-5" />
                    <span>+{dailyChallenge.mission.xpReward} XP</span>
                    <span className="text-accent">+{dailyChallenge.bonusXp} Bonus!</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleStartChallenge}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Prepare Rocket
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={successRate === 0}
                    onClick={handleLaunchChallenge}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Launch Now
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Streak & Progress */}
        <div className="space-y-6">
          {/* Streak Card */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Flame className="h-5 w-5 text-primary" />
                Weekly Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-primary">{streak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </motion.div>
              </div>

              <div className="flex justify-between gap-2">
                {weeklyProgress.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        day.completed
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {day.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-xs">{day.day}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rewards Card */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Gift className="h-5 w-5 text-primary" />
                Streak Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { days: 3, reward: "100 Bonus XP", unlocked: streak >= 3 },
                { days: 5, reward: "Unlock Eco Engine", unlocked: streak >= 5 },
                { days: 7, reward: "500 Bonus XP", unlocked: streak >= 7 },
              ].map((reward, index) => (
                <motion.div
                  key={reward.days}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    reward.unlocked
                      ? "bg-accent/10 border-accent"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        reward.unlocked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {reward.unlocked ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{reward.days}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{reward.days} Day Streak</p>
                      <p className="text-sm text-muted-foreground">{reward.reward}</p>
                    </div>
                  </div>
                  {reward.unlocked && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Claimed
                    </Badge>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
