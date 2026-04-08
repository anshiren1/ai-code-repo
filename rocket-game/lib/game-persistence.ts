import type {
  RocketConfig,
  NoseConeType,
  CabinType,
  FuelTankType,
  ThrusterType,
  DailyChallenge,
  LeaderboardEntry,
} from "./game-store";

export const ROCKET_DATA_KEY = "rocketData";

export type PersistedGameSnapshot = {
  version: 1;
  playerName: string;
  xp: number;
  level: number;
  missionsCompleted: number;
  rocketConfig: RocketConfig;
  unlockedNoseCones: NoseConeType[];
  unlockedCabins: CabinType[];
  unlockedFuelTanks: FuelTankType[];
  unlockedThrusters: ThrusterType[];
  completedMissions: string[];
  unlockedMissions: string[];
  dailyChallenge: DailyChallenge | null;
  leaderboard: LeaderboardEntry[];
  currentView: "workshop" | "missions" | "launch" | "leaderboard" | "challenges";
};

type GameStoreSlice = {
  playerName: string;
  xp: number;
  level: number;
  missionsCompleted: number;
  rocketConfig: RocketConfig;
  unlockedNoseCones: NoseConeType[];
  unlockedCabins: CabinType[];
  unlockedFuelTanks: FuelTankType[];
  unlockedThrusters: ThrusterType[];
  completedMissions: string[];
  unlockedMissions: string[];
  dailyChallenge: DailyChallenge | null;
  leaderboard: LeaderboardEntry[];
  currentView: PersistedGameSnapshot["currentView"];
};

export function pickPersistedSnapshot(state: GameStoreSlice): PersistedGameSnapshot {
  return {
    version: 1,
    playerName: state.playerName,
    xp: state.xp,
    level: state.level,
    missionsCompleted: state.missionsCompleted,
    rocketConfig: state.rocketConfig,
    unlockedNoseCones: state.unlockedNoseCones,
    unlockedCabins: state.unlockedCabins,
    unlockedFuelTanks: state.unlockedFuelTanks,
    unlockedThrusters: state.unlockedThrusters,
    completedMissions: state.completedMissions,
    unlockedMissions: state.unlockedMissions,
    dailyChallenge: state.dailyChallenge,
    leaderboard: state.leaderboard,
    currentView: state.currentView,
  };
}

export function snapshotsEqual(a: PersistedGameSnapshot, b: PersistedGameSnapshot): boolean {
  return (
    a.playerName === b.playerName &&
    a.xp === b.xp &&
    a.level === b.level &&
    a.missionsCompleted === b.missionsCompleted &&
    a.rocketConfig.noseCone === b.rocketConfig.noseCone &&
    a.rocketConfig.cabin === b.rocketConfig.cabin &&
    a.rocketConfig.fuelTank === b.rocketConfig.fuelTank &&
    a.rocketConfig.thruster === b.rocketConfig.thruster &&
    a.unlockedNoseCones.join() === b.unlockedNoseCones.join() &&
    a.unlockedCabins.join() === b.unlockedCabins.join() &&
    a.unlockedFuelTanks.join() === b.unlockedFuelTanks.join() &&
    a.unlockedThrusters.join() === b.unlockedThrusters.join() &&
    a.completedMissions.join() === b.completedMissions.join() &&
    a.unlockedMissions.join() === b.unlockedMissions.join() &&
    a.currentView === b.currentView &&
    JSON.stringify(a.dailyChallenge) === JSON.stringify(b.dailyChallenge) &&
    JSON.stringify(a.leaderboard) === JSON.stringify(b.leaderboard)
  );
}

export function saveGame(snapshot: PersistedGameSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROCKET_DATA_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / private mode */
  }
}

export function loadGame(): Partial<PersistedGameSnapshot> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ROCKET_DATA_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<PersistedGameSnapshot>;
  } catch {
    return null;
  }
}

export function mergeLoadedIntoState(
  loaded: Partial<PersistedGameSnapshot>
): Partial<GameStoreSlice> {
  const patch: Partial<GameStoreSlice> = {};
  if (typeof loaded.playerName === "string") patch.playerName = loaded.playerName;
  if (typeof loaded.xp === "number") patch.xp = loaded.xp;
  if (typeof loaded.level === "number") patch.level = loaded.level;
  if (typeof loaded.missionsCompleted === "number") patch.missionsCompleted = loaded.missionsCompleted;
  if (loaded.rocketConfig && typeof loaded.rocketConfig === "object") {
    const rc = loaded.rocketConfig as RocketConfig;
    patch.rocketConfig = rc;
  }
  if (Array.isArray(loaded.unlockedNoseCones)) patch.unlockedNoseCones = loaded.unlockedNoseCones as NoseConeType[];
  if (Array.isArray(loaded.unlockedCabins)) patch.unlockedCabins = loaded.unlockedCabins as CabinType[];
  if (Array.isArray(loaded.unlockedFuelTanks)) patch.unlockedFuelTanks = loaded.unlockedFuelTanks as FuelTankType[];
  if (Array.isArray(loaded.unlockedThrusters)) patch.unlockedThrusters = loaded.unlockedThrusters as ThrusterType[];
  if (Array.isArray(loaded.completedMissions)) patch.completedMissions = loaded.completedMissions;
  if (Array.isArray(loaded.unlockedMissions)) patch.unlockedMissions = loaded.unlockedMissions;
  if (loaded.dailyChallenge !== undefined) patch.dailyChallenge = loaded.dailyChallenge;
  if (Array.isArray(loaded.leaderboard)) patch.leaderboard = loaded.leaderboard as LeaderboardEntry[];
  if (
    loaded.currentView === "workshop" ||
    loaded.currentView === "missions" ||
    loaded.currentView === "launch" ||
    loaded.currentView === "leaderboard" ||
    loaded.currentView === "challenges"
  ) {
    patch.currentView = loaded.currentView;
  }
  return patch;
}
