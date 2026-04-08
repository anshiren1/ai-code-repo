"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  CheckCircle,
  AlertTriangle,
  Target,
  MapPin,
  Wind,
  Users,
  Bot,
  FlaskConical,
  Rocket,
} from "lucide-react";
import {
  useGameStore,
  MISSIONS,
  calculateSuccessProbability,
  calculateRocketStats,
  sortMissionsByProgression,
  isBeginnerFriendlyMission,
  Mission,
} from "@/lib/game-store";

export function MissionHub() {
  const {
    rocketConfig,
    completedMissions,
    unlockedMissions,
    selectedMission,
    selectMission,
    startLaunch,
  } = useGameStore();

  const missionsInProgressionOrder = useMemo(
    () => sortMissionsByProgression(MISSIONS),
    []
  );

  const getEnvironmentIcon = (factor: string) => {
    if (factor.includes("Gravity")) return "🌍";
    if (factor.includes("Storm") || factor.includes("Atmosphere")) return "🌪️";
    if (factor.includes("Cold")) return "❄️";
    if (factor.includes("Radiation")) return "☢️";
    if (factor.includes("Dust")) return "🏜️";
    if (factor.includes("Visibility")) return "🌫️";
    return "⚠️";
  };

  const getDestinationImage = (destination: string) => {
    switch (destination) {
      case "Moon":
        return "🌙";
      case "Mars":
        return "🔴";
      case "Europa":
        return "🧊";
      case "Titan":
        return "🟠";
      default:
        return "🌍";
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-accent text-accent-foreground";
    if (difficulty <= 4) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Mission List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Available Missions</h2>
        <p className="text-sm text-muted-foreground mb-4 rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
          Progression tip: start with <strong className="text-foreground">Moon</strong> missions — lower gravity
          and shorter distance are easier on your rocket. Unlock farther destinations as you complete flights.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {missionsInProgressionOrder.map((mission, index) => {
            const isUnlocked = unlockedMissions.includes(mission.id);
            const isCompleted = completedMissions.includes(mission.id);
            const isSelected = selectedMission?.id === mission.id;
            const successRate = calculateSuccessProbability(rocketConfig, mission);
            const beginnerFriendly =
              isBeginnerFriendlyMission(mission) && isUnlocked && !isCompleted;

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all border-2 ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isUnlocked
                      ? "border-border hover:border-primary/50"
                      : "border-muted opacity-60"
                  }`}
                  onClick={() => isUnlocked && selectMission(mission)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{getDestinationImage(mission.destination)}</span>
                        <div>
                          <h3 className="font-bold text-card-foreground">{mission.name}</h3>
                          <p className="text-sm text-muted-foreground">{mission.destination}</p>
                        </div>
                      </div>
                      {!isUnlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                      {isCompleted && <CheckCircle className="h-5 w-5 text-accent" />}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {beginnerFriendly && (
                        <Badge variant="outline" className="border-accent text-accent">
                          Suggested first
                        </Badge>
                      )}
                      <Badge className={getDifficultyColor(mission.difficulty)}>
                        Lvl {mission.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {mission.distance} km
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        +{mission.xpReward} XP
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {mission.environmentFactors.map((factor, i) => (
                        <span
                          key={i}
                          className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                        >
                          {getEnvironmentIcon(factor)} {factor}
                        </span>
                      ))}
                    </div>

                    {isUnlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span
                            className={`font-bold ${
                              successRate >= 70
                                ? "text-accent"
                                : successRate >= 40
                                ? "text-warning"
                                : "text-destructive"
                            }`}
                          >
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
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mission Details Panel */}
      <div className="space-y-4">
        <Card className="bg-card/50 backdrop-blur sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Target className="h-5 w-5 text-primary" />
              Mission Briefing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMission ? (
              <MissionDetails
                mission={selectedMission}
                successRate={calculateSuccessProbability(rocketConfig, selectedMission)}
                onLaunch={startLaunch}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a mission to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MissionDetails({
  mission,
  successRate,
  onLaunch,
}: {
  mission: Mission;
  successRate: number;
  onLaunch: () => void;
}) {
  const rocketConfig = useGameStore((state) => state.rocketConfig);
  const stats = useMemo(() => calculateRocketStats(rocketConfig), [rocketConfig]);

  const canLaunchProperly = stats.canLaunch && stats.maxRange >= mission.distance;
  // Force success rate to 0% if rocket cannot properly launch
  const displayedSuccessRate = canLaunchProperly ? successRate : 0;

  const getWarnings = () => {
    const warnings: string[] = [];
    if (!stats.canLaunch) {
      warnings.push("Thrust ratio too low! Add more powerful engines.");
    }
    if (stats.maxRange < mission.distance) {
      warnings.push(`Insufficient range! Need ${mission.distance} km, have ${Math.round(stats.maxRange)} km.`);
    }
    if (mission.requiresRover && !stats.cabin.carriesRover) {
      warnings.push("This mission requires a Rover! Use Cargo or Hybrid cabin.");
    }
    if (mission.requiresHuman && !stats.cabin.carriesAstronauts) {
      warnings.push("This mission requires a Crew! Use Crew or Hybrid cabin.");
    }
    return warnings;
  };

  const warnings = getWarnings();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="text-center py-4 bg-muted/50 rounded-lg">
        <span className="text-5xl mb-2 block">
          {mission.destination === "Moon" && "🌙"}
          {mission.destination === "Mars" && "🔴"}
          {mission.destination === "Europa" && "🧊"}
          {mission.destination === "Titan" && "🟠"}
        </span>
        <h3 className="text-xl font-bold text-card-foreground">{mission.name}</h3>
        <p className="text-muted-foreground">{mission.destination}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Distance</span>
          <span className="font-semibold text-card-foreground">{mission.distance} km</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">XP Reward</span>
          <Badge variant="default">+{mission.xpReward} XP</Badge>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-sm font-medium mb-2 text-card-foreground">Requirements</p>
          <div className="flex gap-2">
            {mission.requiresRover && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Bot className="h-3 w-3" /> Rover
              </Badge>
            )}
            {mission.requiresHuman && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" /> Crew
              </Badge>
            )}
            {mission.isComplexScience && (
              <Badge variant="outline" className="flex items-center gap-1">
                <FlaskConical className="h-3 w-3" /> Science
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-sm font-medium mb-2 text-card-foreground">Environment</p>
          <div className="flex flex-wrap gap-2">
            {mission.environmentFactors.map((factor, i) => (
              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                <Wind className="h-3 w-3" /> {factor}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-card-foreground">Success Probability</span>
          <span
            className={`text-2xl font-bold ${
              displayedSuccessRate >= 70
                ? "text-accent"
                : displayedSuccessRate >= 40
                ? "text-warning"
                : "text-destructive"
            }`}
          >
            {displayedSuccessRate}%
          </span>
        </div>
        <Progress
          value={displayedSuccessRate}
          className={`h-3 ${
            displayedSuccessRate >= 70
              ? "[&>div]:bg-accent"
              : displayedSuccessRate >= 40
              ? "[&>div]:bg-warning"
              : "[&>div]:bg-destructive"
          }`}
        />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{warning}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Launch Button - Always clickable so kids can learn from failure */}
      <Button
        type="button"
        className="w-full touch-manipulation py-6 text-lg font-bold"
        size="lg"
        onClick={onLaunch}
      >
        <Rocket className="h-5 w-5 mr-2" />
        Launch Mission!
      </Button>
    </motion.div>
  );
}
