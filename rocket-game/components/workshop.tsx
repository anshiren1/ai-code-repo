"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, Rocket, Gauge, Fuel, Weight, Zap, Navigation, Box } from "lucide-react";
import { RocketVisual } from "./rocket-visual";
import {
  useGameStore,
  NOSE_CONES,
  CABINS,
  FUEL_TANKS,
  THRUSTERS,
  calculateRocketStats,
  NoseConeType,
  CabinType,
  FuelTankType,
  ThrusterType,
} from "@/lib/game-store";

export function Workshop() {
  const {
    rocketConfig,
    setRocketConfig,
    unlockedNoseCones,
    unlockedCabins,
    unlockedFuelTanks,
    unlockedThrusters,
    unlockItem,
  } = useGameStore();

  const stats = calculateRocketStats(rocketConfig);
  const noseConePart = NOSE_CONES.find((n) => n.type === rocketConfig.noseCone)!;
  const cabinPart = CABINS.find((c) => c.type === rocketConfig.cabin)!;
  const fuelPart = FUEL_TANKS.find((f) => f.type === rocketConfig.fuelTank)!;
  const thrusterPart = THRUSTERS.find((t) => t.type === rocketConfig.thruster)!;

  const handleUnlock = (
    type: "noseCone" | "cabin" | "fuelTank" | "thruster",
    id: string
  ) => {
    unlockItem(type, id);
  };

  const renderPartSelector = <T extends { id: string; name: string; weight: number; xpRequired: number }>(
    parts: T[],
    currentType: string,
    unlocked: string[],
    onSelect: (type: string) => void,
    getType: (part: T) => string,
    partType: "noseCone" | "cabin" | "fuelTank" | "thruster",
    renderDetails: (part: T) => React.ReactNode
  ) => (
    <div className="grid gap-3">
      {parts.map((part) => {
        const type = getType(part);
        const isUnlocked = unlocked.includes(type);
        const isSelected = currentType === type;

        return (
          <motion.div
            key={part.id}
            whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
            whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
          >
            <Card
              className={`touch-manipulation cursor-pointer transition-all border ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : isUnlocked
                  ? "border-white/10 bg-white/5 hover:border-primary/50"
                  : "border-white/5 bg-black/20 opacity-80"
              } backdrop-blur-sm`}
              onClick={() => isUnlocked && onSelect(type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{part.name}</h4>
                      {isSelected && (
                        <Badge variant="default" className="text-xs bg-primary">
                          Equipped
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {renderDetails(part)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                      <Weight className="h-3 w-3" />
                      <span>{part.weight} kg</span>
                      {!isUnlocked && (
                        <Badge variant="outline" className="text-[10px] ml-2 border-white/20 text-white/70">
                          {part.xpRequired} XP
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isUnlocked ? (
                      <Unlock className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 border border-white/10 hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(partType, part.id);
                        }}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Unlock
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Rocket Preview */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Rocket className="h-5 w-5 text-primary" />
            Your Rocket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex flex-1 items-center justify-center min-h-[260px] lg:min-h-[320px]">
              <RocketVisual config={rocketConfig} />
            </div>

            <aside className="w-full shrink-0 space-y-3 lg:w-56" aria-label="Installed components">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Components
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Nose cone</div>
                    <div className="truncate text-sm font-semibold text-card-foreground">
                      {noseConePart.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Box className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Cabin</div>
                    <div className="truncate text-sm font-semibold text-card-foreground">
                      {cabinPart.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Fuel className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Fuel tank</div>
                    <div className="truncate text-sm font-semibold text-card-foreground">
                      {fuelPart.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Engine</div>
                    <div className="truncate text-sm font-semibold text-card-foreground">
                      {thrusterPart.name}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Stats Dashboard */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Weight className="h-4 w-4" />
                Total Weight
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stats.totalWeight} kg</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Zap className="h-4 w-4" />
                Thrust Ratio
              </div>
              <p
                className={`text-2xl font-bold ${
                  stats.canLaunch ? "text-accent" : "text-destructive"
                }`}
              >
                {stats.thrustToWeight.toFixed(2)}x
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Fuel className="h-4 w-4" />
                Max Range
              </div>
              <p className="text-2xl font-bold text-card-foreground">{Math.round(stats.maxRange)} km</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Gauge className="h-4 w-4" />
                Stability
              </div>
              <div className="flex items-center gap-2">
                <Progress value={stats.stability} className="flex-1" />
                <span className="text-sm font-medium text-card-foreground">{Math.round(stats.stability)}%</span>
              </div>
            </div>
          </div>

          {!stats.canLaunch && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive"
            >
              Warning: Thrust ratio below 1.0! Your rocket cannot lift off. Add more powerful engines or reduce weight.
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Part Selection */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-card-foreground">Rocket Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nosecone" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="nosecone">Nose</TabsTrigger>
              <TabsTrigger value="cabin">Cabin</TabsTrigger>
              <TabsTrigger value="fuel">Fuel</TabsTrigger>
              <TabsTrigger value="thruster">Engine</TabsTrigger>
            </TabsList>

            <TabsContent value="nosecone" className="max-h-96 overflow-y-auto">
              {renderPartSelector(
                NOSE_CONES,
                rocketConfig.noseCone,
                unlockedNoseCones,
                (type) => setRocketConfig({ noseCone: type as NoseConeType }),
                (p) => p.type,
                "noseCone",
                (p) => (
                  <span>
                    Stability: {p.stability}% | Aero: {p.aerodynamics}%
                  </span>
                )
              )}
            </TabsContent>

            <TabsContent value="cabin" className="max-h-96 overflow-y-auto">
              {renderPartSelector(
                CABINS,
                rocketConfig.cabin,
                unlockedCabins,
                (type) => setRocketConfig({ cabin: type as CabinType }),
                (p) => p.type,
                "cabin",
                (p) => (
                  <span>
                    {p.carriesRover && "Rover"} {p.carriesRover && p.carriesAstronauts && "+"}{" "}
                    {p.carriesAstronauts && "Crew"}
                  </span>
                )
              )}
            </TabsContent>

            <TabsContent value="fuel" className="max-h-96 overflow-y-auto">
              {renderPartSelector(
                FUEL_TANKS,
                rocketConfig.fuelTank,
                unlockedFuelTanks,
                (type) => setRocketConfig({ fuelTank: type as FuelTankType }),
                (p) => p.type,
                "fuelTank",
                (p) => <span>Fuel: {p.fuel}L | Range: {p.range} km</span>
              )}
            </TabsContent>

            <TabsContent value="thruster" className="max-h-96 overflow-y-auto">
              {renderPartSelector(
                THRUSTERS,
                rocketConfig.thruster,
                unlockedThrusters,
                (type) => setRocketConfig({ thruster: type as ThrusterType }),
                (p) => p.type,
                "thruster",
                (p) => (
                  <span>
                    Thrust: {p.thrust} | Efficiency: {p.efficiency}%
                  </span>
                )
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
