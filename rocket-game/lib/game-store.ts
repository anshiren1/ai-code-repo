import { create } from "zustand";

// Types
export type NoseConeType = "standard" | "aerodynamic" | "reinforced";
export type CabinType = "cargo" | "human" | "hybrid";
export type FuelTankType = "small" | "medium" | "large" | "super";
export type ThrusterType = "basic" | "efficient" | "powerful" | "super-heavy";

// Launch simulation types
export type LaunchPhase = "countdown" | "liftoff" | "orbit" | "transit" | "landing" | "surface_mission" | "result";
export type FailureReason = "none" | "too_heavy" | "unstable" | "out_of_fuel" | "payload_crash" | "obstacle_crash";

export interface PhaseCheckResult {
  passed: boolean;
  failureReason: FailureReason;
  message: string;
  hint: string;
}

export interface RocketPart {
  id: string;
  name: string;
  weight: number;
  unlocked: boolean;
  xpRequired: number;
}

export interface NoseCone extends RocketPart {
  type: NoseConeType;
  stability: number;
  aerodynamics: number;
}

export interface Cabin extends RocketPart {
  type: CabinType;
  capacity: number;
  carriesRover: boolean;
  carriesAstronauts: boolean;
}

export interface FuelTank extends RocketPart {
  type: FuelTankType;
  fuel: number;
  range: number;
}

export interface Thruster extends RocketPart {
  type: ThrusterType;
  thrust: number;
  efficiency: number;
}

export interface Mission {
  id: string;
  name: string;
  destination: string;
  difficulty: number;
  distance: number;
  environmentFactors: string[];
  requiresRover: boolean;
  requiresHuman: boolean;
  isComplexScience: boolean;
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
}

export interface DailyChallenge {
  id: string;
  date: string;
  mission: Mission;
  bonusXp: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  missionsCompleted: number;
  level: number;
}

export interface RocketConfig {
  noseCone: NoseConeType;
  cabin: CabinType;
  fuelTank: FuelTankType;
  thruster: ThrusterType;
}

// Data
export const NOSE_CONES: NoseCone[] = [
  { id: "nc1", type: "standard", name: "Standard Cone", weight: 100, stability: 60, aerodynamics: 50, unlocked: true, xpRequired: 0 },
  { id: "nc2", type: "aerodynamic", name: "Aero Cone", weight: 80, stability: 50, aerodynamics: 90, unlocked: true, xpRequired: 500 },
  { id: "nc3", type: "reinforced", name: "Reinforced Cone", weight: 150, stability: 95, aerodynamics: 70, unlocked: true, xpRequired: 1500 },
];

export const CABINS: Cabin[] = [
  { id: "cb1", type: "cargo", name: "Cargo Bay", weight: 200, capacity: 500, carriesRover: true, carriesAstronauts: false, unlocked: true, xpRequired: 0 },
  { id: "cb2", type: "human", name: "Crew Cabin", weight: 400, capacity: 100, carriesRover: false, carriesAstronauts: true, unlocked: true, xpRequired: 0 },
  { id: "cb3", type: "hybrid", name: "Hybrid Module", weight: 600, capacity: 300, carriesRover: true, carriesAstronauts: true, unlocked: true, xpRequired: 2000 },
];

export const FUEL_TANKS: FuelTank[] = [
  { id: "ft1", type: "small", name: "Small Tank", weight: 150, fuel: 1000, range: 1000, unlocked: true, xpRequired: 0 },
  { id: "ft2", type: "medium", name: "Medium Tank", weight: 300, fuel: 2500, range: 2500, unlocked: true, xpRequired: 300 },
  { id: "ft3", type: "large", name: "Large Tank", weight: 500, fuel: 5000, range: 5000, unlocked: true, xpRequired: 1000 },
  { id: "ft4", type: "super", name: "Super Tank", weight: 800, fuel: 10000, range: 10000, unlocked: true, xpRequired: 3000 },
];

export const THRUSTERS: Thruster[] = [
  { id: "th1", type: "basic", name: "Basic Engine", weight: 200, thrust: 800, efficiency: 50, unlocked: true, xpRequired: 0 },
  { id: "th2", type: "efficient", name: "Eco Engine", weight: 250, thrust: 1000, efficiency: 85, unlocked: true, xpRequired: 400 },
  { id: "th3", type: "powerful", name: "Power Engine", weight: 400, thrust: 2000, efficiency: 60, unlocked: true, xpRequired: 1200 },
  { id: "th4", type: "super-heavy", name: "Super-Heavy", weight: 600, thrust: 4000, efficiency: 70, unlocked: true, xpRequired: 2500 },
];

export const MISSIONS: Mission[] = [
  {
    id: "m1", name: "Lunar Survey", destination: "Moon", difficulty: 1, distance: 500,
    environmentFactors: ["Low Gravity"], requiresRover: true, requiresHuman: false,
    isComplexScience: false, xpReward: 500, completed: false, unlocked: true
  },
  {
    id: "m2", name: "Moon Lab Setup", destination: "Moon", difficulty: 2, distance: 500,
    environmentFactors: ["Low Gravity"], requiresRover: false, requiresHuman: true,
    isComplexScience: true, xpReward: 1000, completed: false, unlocked: true
  },
  {
    id: "m3", name: "Mars Exploration", destination: "Mars", difficulty: 3, distance: 2000,
    environmentFactors: ["High Gravity", "Dust Storms"], requiresRover: true, requiresHuman: false,
    isComplexScience: false, xpReward: 2000, completed: false, unlocked: false
  },
  {
    id: "m4", name: "Mars Colony", destination: "Mars", difficulty: 4, distance: 2000,
    environmentFactors: ["High Gravity", "Dust Storms"], requiresRover: true, requiresHuman: true,
    isComplexScience: true, xpReward: 4000, completed: false, unlocked: false
  },
  {
    id: "m5", name: "Europa Ice Research", destination: "Europa", difficulty: 5, distance: 5000,
    environmentFactors: ["Extreme Cold", "Radiation"], requiresRover: true, requiresHuman: true,
    isComplexScience: true, xpReward: 7500, completed: false, unlocked: false
  },
  {
    id: "m6", name: "Titan Expedition", destination: "Titan", difficulty: 6, distance: 8000,
    environmentFactors: ["Stormy Atmosphere", "Low Visibility", "Extreme Cold"],
    requiresRover: true, requiresHuman: true, isComplexScience: true,
    xpReward: 12500, completed: false, unlocked: false
  },
];

// Calculate rocket stats
export function calculateRocketStats(config: RocketConfig) {
  const noseCone = NOSE_CONES.find(n => n.type === config.noseCone)!;
  const cabin = CABINS.find(c => c.type === config.cabin)!;
  const fuelTank = FUEL_TANKS.find(f => f.type === config.fuelTank)!;
  const thruster = THRUSTERS.find(t => t.type === config.thruster)!;

  const totalWeight = noseCone.weight + cabin.weight + fuelTank.weight + thruster.weight;
  const thrustToWeight = thruster.thrust / totalWeight;
  const maxRange = fuelTank.range * (thruster.efficiency / 100);
  const stability = (noseCone.stability + noseCone.aerodynamics) / 2;

  return {
    totalWeight,
    thrustToWeight,
    maxRange,
    stability,
    canLaunch: thrustToWeight > 1,
    noseCone,
    cabin,
    fuelTank,
    thruster,
  };
}

// Phase check functions for multi-stage launch simulation
export function checkLiftoff(config: RocketConfig): PhaseCheckResult {
  const stats = calculateRocketStats(config);
  const thruster = THRUSTERS.find(t => t.type === config.thruster)!;
  
  // Thrust must be greater than or equal to weight
  if (thruster.thrust < stats.totalWeight) {
    return {
      passed: false,
      failureReason: "too_heavy",
      message: "Oh no, too heavy!",
      hint: "We need a bigger engine to lift this much weight. Try upgrading to a more powerful thruster!",
    };
  }
  return { passed: true, failureReason: "none", message: "Lift-off successful!", hint: "" };
}

export function checkOrbit(config: RocketConfig, mission: Mission): PhaseCheckResult {
  const stats = calculateRocketStats(config);
  
  // Stability must be high enough to survive environment factors
  const requiredStability = 40 + (mission.environmentFactors.length * 10);
  
  if (stats.stability < requiredStability) {
    return {
      passed: false,
      failureReason: "unstable",
      message: "The rocket became unstable!",
      hint: `${mission.destination}'s ${mission.environmentFactors[0] || "atmosphere"} was too rough! Try using the Reinforced Cone for extra stability.`,
    };
  }
  return { passed: true, failureReason: "none", message: "Stable orbit achieved!", hint: "" };
}

export function checkTransit(config: RocketConfig, mission: Mission): PhaseCheckResult {
  const stats = calculateRocketStats(config);
  
  // Calculate transit duration: 1s per 1000km, minimum 4s
  const requiredDuration = Math.max(4, mission.distance / 1000);
  
  // Range must cover the mission distance
  if (stats.maxRange < mission.distance) {
    return {
      passed: false,
      failureReason: "out_of_fuel",
      message: "We ran out of fuel!",
      hint: `${mission.destination} is ${mission.distance.toLocaleString()} km away! We need a bigger fuel tank or a more efficient engine.`,
    };
  }
  return { passed: true, failureReason: "none", message: `Transit complete in ${requiredDuration.toFixed(1)}s!`, hint: "" };
}

export function checkLanding(config: RocketConfig, mission: Mission): PhaseCheckResult {
  const cabin = CABINS.find(c => c.type === config.cabin)!;
  
  // Payload compatibility check
  if (mission.requiresRover && !cabin.carriesRover) {
    return {
      passed: false,
      failureReason: "payload_crash",
      message: "The rover crashed on landing!",
      hint: "This mission needs a rover, but our Crew Cabin can't carry one. Try using a Cargo Bay or Hybrid Module!",
    };
  }
  
  if (mission.requiresHuman && !cabin.carriesAstronauts) {
    return {
      passed: false,
      failureReason: "payload_crash",
      message: "The astronauts couldn't complete the mission!",
      hint: "This mission needs astronauts, but our Cargo Bay can't carry people. Try using a Crew Cabin or Hybrid Module!",
    };
  }
  
  // Complex science missions need human oversight
  if (mission.isComplexScience && !cabin.carriesAstronauts) {
    // 50% chance of failure for complex science without humans
    if (Math.random() < 0.5) {
      return {
        passed: false,
        failureReason: "payload_crash",
        message: "The science experiment failed!",
        hint: "Complex science missions work better with astronauts on board. Try using a Crew Cabin or Hybrid Module!",
      };
    }
  }
  
  return { passed: true, failureReason: "none", message: "Perfect landing!", hint: "" };
}

// Calculate success probability
export function calculateSuccessProbability(config: RocketConfig, mission: Mission): number {
  const stats = calculateRocketStats(config);
  const cabin = CABINS.find(c => c.type === config.cabin)!;

  if (!stats.canLaunch) return 0;
  if (stats.maxRange < mission.distance) return 0;

  let baseProbability = 70;

  // Cabin compatibility
  if (mission.requiresRover && !cabin.carriesRover) return 0;
  if (mission.requiresHuman && !cabin.carriesAstronauts) return 0;

  // Mission type bonuses
  if (mission.isComplexScience) {
    if (cabin.type === "human") baseProbability += 20;
    else if (cabin.type === "hybrid") baseProbability += 15;
    else baseProbability -= 15;
  } else {
    if (cabin.type === "cargo") baseProbability += 15;
    else if (cabin.type === "hybrid") baseProbability += 10;
  }

  // Hybrid advantage
  if (mission.requiresRover && mission.requiresHuman && cabin.type === "hybrid") {
    baseProbability += 15;
  }

  // Environment factors
  const envPenalty = mission.environmentFactors.length * 5;
  baseProbability -= envPenalty;

  // Stability bonus
  baseProbability += (stats.stability - 60) / 4;

  // Difficulty penalty
  baseProbability -= (mission.difficulty - 1) * 8;

  // Thrust margin bonus
  const thrustMargin = stats.thrustToWeight - 1;
  baseProbability += Math.min(thrustMargin * 10, 10);

  return Math.max(0, Math.min(100, Math.round(baseProbability)));
}

/** Easier missions first: lower difficulty, then shorter distance */
export function sortMissionsByProgression(missions: Mission[]): Mission[] {
  return [...missions].sort((a, b) => a.difficulty - b.difficulty || a.distance - b.distance);
}

export function isBeginnerFriendlyMission(mission: Mission): boolean {
  const lowGravity = mission.environmentFactors.some((f) =>
    f.toLowerCase().includes("low gravity")
  );
  return mission.difficulty <= 2 && lowGravity;
}

// Generate daily challenge
function generateDailyChallenge(): DailyChallenge {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const missionIndex = seed % MISSIONS.length;
  const baseMission = MISSIONS[missionIndex];
  
  return {
    id: `daily-${today}`,
    date: today,
    mission: {
      ...baseMission,
      id: `daily-${today}`,
      name: `Daily: ${baseMission.name}`,
      xpReward: Math.round(baseMission.xpReward * 1.5),
      completed: false,
      unlocked: true,
    },
    bonusXp: Math.round(baseMission.xpReward * 0.5),
    completed: false,
  };
}

// Store interface
interface GameState {
  // Player stats
  playerName: string;
  xp: number;
  level: number;
  missionsCompleted: number;

  // Rocket configuration
  rocketConfig: RocketConfig;

  // Unlocked items
  unlockedNoseCones: NoseConeType[];
  unlockedCabins: CabinType[];
  unlockedFuelTanks: FuelTankType[];
  unlockedThrusters: ThrusterType[];

  // Missions
  completedMissions: string[];
  unlockedMissions: string[];

  // Daily challenge
  dailyChallenge: DailyChallenge | null;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Current view
  currentView: "workshop" | "missions" | "launch" | "leaderboard" | "challenges";

  // Launch state
  isLaunching: boolean;
  launchResult: "success" | "failure" | null;
  selectedMission: Mission | null;
  launchPhase: LaunchPhase;
  failureReason: FailureReason;
  failureMessage: string;
  failureHint: string;
  failedPhase: LaunchPhase | null;

  // Actions
  setPlayerName: (name: string) => void;
  setRocketConfig: (config: Partial<RocketConfig>) => void;
  selectMission: (mission: Mission | null) => void;
  startLaunch: () => void;
  setLaunchPhase: (phase: LaunchPhase) => void;
  checkPhase: (phase: LaunchPhase) => PhaseCheckResult;
  completeMission: () => void;
  failMission: (reason: FailureReason, message: string, hint: string) => void;
  resetLaunch: () => void;
  restartMission: () => void;
  restartPhase: () => void;
  setCurrentView: (view: GameState["currentView"]) => void;
  initDailyChallenge: () => void;
  completeDailyChallenge: () => void;
  addToLeaderboard: (entry: LeaderboardEntry) => void;
  unlockItem: (type: "noseCone" | "cabin" | "fuelTank" | "thruster", id: string) => boolean;
}

export const useGameStore = create<GameState>()((set, get) => ({
      // Initial state
      playerName: "Space Cadet",
      userId: `user_${Math.random().toString(36).substring(2, 9)}`,
      xp: 0,
      level: 1,
      missionsCompleted: 0,
      tutorialCompleted: false,

      rocketConfig: {
        noseCone: "standard",
        cabin: "cargo",
        fuelTank: "small",
        thruster: "basic",
      },

      unlockedNoseCones: ["standard"],
      unlockedCabins: ["cargo"],
      unlockedFuelTanks: ["small"],
      unlockedThrusters: ["basic"],

      completedMissions: [],
      unlockedMissions: ["m1", "m2"],

      dailyChallenge: null,

      leaderboard: [
        { id: "bot1", name: "StarPilot99", xp: 5000, missionsCompleted: 25, level: 10 },
        { id: "bot2", name: "CosmicKid", xp: 3500, missionsCompleted: 18, level: 7 },
        { id: "bot3", name: "RocketRider", xp: 2800, missionsCompleted: 14, level: 6 },
        { id: "bot4", name: "MoonWalker", xp: 2000, missionsCompleted: 10, level: 4 },
        { id: "bot5", name: "SpaceExplorer", xp: 1500, missionsCompleted: 8, level: 3 },
      ],

      currentView: "workshop",
      isLaunching: false,
      launchResult: null,
      selectedMission: null,
      launchPhase: "countdown" as LaunchPhase,
      failureReason: "none" as FailureReason,
      failureMessage: "",
      failureHint: "",
      failedPhase: null,

      // Actions
      setPlayerName: (name) => set({ playerName: name }),
      setTutorialCompleted: (completed) => set({ tutorialCompleted: completed }),

      setRocketConfig: (config) =>
        set((state) => ({
          rocketConfig: { ...state.rocketConfig, ...config },
        })),

      selectMission: (mission) => set({ selectedMission: mission }),

      startLaunch: () => {
        set({ 
          isLaunching: true, 
          currentView: "launch",
          launchPhase: "countdown",
          launchResult: null,
          failureReason: "none",
          failureMessage: "",
          failureHint: "",
          failedPhase: null,
        });
      },

      setLaunchPhase: (phase) => set({ launchPhase: phase }),

      checkPhase: (phase) => {
        const state = get();
        if (!state.selectedMission) {
          return { passed: false, failureReason: "none" as FailureReason, message: "", hint: "" };
        }

        switch (phase) {
          case "liftoff":
            return checkLiftoff(state.rocketConfig);
          case "orbit":
            return checkOrbit(state.rocketConfig, state.selectedMission);
          case "transit":
            return checkTransit(state.rocketConfig, state.selectedMission);
          case "landing":
            return checkLanding(state.rocketConfig, state.selectedMission);
          default:
            return { passed: true, failureReason: "none" as FailureReason, message: "", hint: "" };
        }
      },

      completeMission: () => {
        const state = get();
        if (!state.selectedMission) return;

        let bonusXp = 0;
        let isDaily = false;

        if (state.dailyChallenge && state.selectedMission.id === state.dailyChallenge.mission.id && !state.dailyChallenge.completed) {
          bonusXp = state.dailyChallenge.bonusXp;
          isDaily = true;
        }

        const newXp = state.xp + state.selectedMission.xpReward + bonusXp;
        const newLevel = Math.floor(newXp / 500) + 1;
        const newMissionsCompleted = state.missionsCompleted + 1;

        // Unlock next missions
        const currentMissionIndex = MISSIONS.findIndex(
          (m) => m.id === state.selectedMission!.id
        );
        const newUnlocked = [...state.unlockedMissions];
        if (currentMissionIndex < MISSIONS.length - 1 && currentMissionIndex !== -1) {
          const nextMission = MISSIONS[currentMissionIndex + 1];
          if (!newUnlocked.includes(nextMission.id)) {
            newUnlocked.push(nextMission.id);
          }
        }

        set({
          isLaunching: false,
          launchResult: "success",
          launchPhase: "result",
          xp: newXp,
          level: newLevel,
          missionsCompleted: newMissionsCompleted,
          completedMissions: [...state.completedMissions, state.selectedMission!.id],
          unlockedMissions: newUnlocked,
          failedPhase: null,
          ...(isDaily ? { dailyChallenge: { ...state.dailyChallenge!, completed: true } } : {}),
        });
      },

      failMission: (reason, message, hint) => {
        set((state) => {
          const shouldPlayAnimation = state.launchPhase !== "surface_mission" && state.launchPhase !== "result";
          return {
            isLaunching: false,
            launchResult: "failure",
            launchPhase: shouldPlayAnimation ? state.launchPhase : "result",
            failedPhase: state.launchPhase,
            failureReason: reason,
            failureMessage: message,
            failureHint: hint,
          };
        });
      },

      resetLaunch: () =>
        set({ 
          launchResult: null, 
          selectedMission: null, 
          currentView: "missions",
          launchPhase: "countdown",
          failureReason: "none",
          failureMessage: "",
          failureHint: "",
          failedPhase: null,
        }),

      restartMission: () =>
        set({
          isLaunching: true,
          launchResult: null,
          launchPhase: "countdown",
          failureReason: "none",
          failureMessage: "",
          failureHint: "",
          failedPhase: null,
        }),

      restartPhase: () =>
        set((state) => ({
          isLaunching: true,
          launchResult: null,
          launchPhase: state.failedPhase || "countdown",
          failureReason: "none",
          failureMessage: "",
          failureHint: "",
          failedPhase: null,
        })),

      setCurrentView: (view) => set({ currentView: view }),

      initDailyChallenge: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (!state.dailyChallenge || state.dailyChallenge.date !== today) {
          const newChallenge = generateDailyChallenge();
          set({ dailyChallenge: newChallenge });
        }
      },

      completeDailyChallenge: () => {
        const state = get();
        if (!state.dailyChallenge || state.dailyChallenge.completed) return;

        const totalXp = state.dailyChallenge.mission.xpReward + state.dailyChallenge.bonusXp;
        const newXp = state.xp + totalXp;
        const newLevel = Math.floor(newXp / 500) + 1;

        set({
          dailyChallenge: { ...state.dailyChallenge, completed: true },
          xp: newXp,
          level: newLevel,
          missionsCompleted: state.missionsCompleted + 1,
        });
      },

      addToLeaderboard: (entry) =>
        set((state) => ({
          leaderboard: [...state.leaderboard, entry]
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10),
        })),

      unlockItem: (type, id) => {
        const state = get();
        let item: RocketPart | undefined;
        let unlockedKey: keyof GameState;
        let itemType: string;

        switch (type) {
          case "noseCone":
            item = NOSE_CONES.find((n) => n.id === id);
            unlockedKey = "unlockedNoseCones";
            itemType = (item as NoseCone)?.type || "";
            break;
          case "cabin":
            item = CABINS.find((c) => c.id === id);
            unlockedKey = "unlockedCabins";
            itemType = (item as Cabin)?.type || "";
            break;
          case "fuelTank":
            item = FUEL_TANKS.find((f) => f.id === id);
            unlockedKey = "unlockedFuelTanks";
            itemType = (item as FuelTank)?.type || "";
            break;
          case "thruster":
            item = THRUSTERS.find((t) => t.id === id);
            unlockedKey = "unlockedThrusters";
            itemType = (item as Thruster)?.type || "";
            break;
        }

        if (!item || state.xp < item.xpRequired) return false;

        const currentUnlocked = state[unlockedKey] as string[];
        if (currentUnlocked.includes(itemType)) return false;

        set({ [unlockedKey]: [...currentUnlocked, itemType] } as Partial<GameState>);
        return true;
      },
}));
