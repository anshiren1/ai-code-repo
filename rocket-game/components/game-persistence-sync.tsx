"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import {
  loadGame,
  mergeLoadedIntoState,
  pickPersistedSnapshot,
  saveGame,
  snapshotsEqual,
  type PersistedGameSnapshot,
} from "@/lib/game-persistence";

const LEGACY_STORAGE_KEY = "rocket-commander-storage";

function tryLegacyPersistPatch(): ReturnType<typeof mergeLoadedIntoState> | null {
  if (typeof window === "undefined") return null;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return null;
  try {
    const parsed = JSON.parse(legacy) as { state?: Record<string, unknown> };
    if (!parsed.state || typeof parsed.state !== "object") return null;
    return mergeLoadedIntoState(parsed.state as Partial<PersistedGameSnapshot>);
  } catch {
    return null;
  }
}

export function GamePersistenceSync() {
  const [hydrated, setHydrated] = useState(false);
  const lastSaved = useRef<ReturnType<typeof pickPersistedSnapshot> | null>(null);

  useEffect(() => {
    let patch = mergeLoadedIntoState(loadGame() ?? {});
    if (Object.keys(patch).length === 0) {
      const legacy = tryLegacyPersistPatch();
      if (legacy && Object.keys(legacy).length > 0) {
        patch = legacy;
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    if (Object.keys(patch).length > 0) {
      useGameStore.setState((s) => ({
        ...s,
        ...patch,
        rocketConfig: patch.rocketConfig
          ? { ...s.rocketConfig, ...patch.rocketConfig }
          : s.rocketConfig,
      }));
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const initial = pickPersistedSnapshot(useGameStore.getState());
    lastSaved.current = initial;
    saveGame(initial);

    return useGameStore.subscribe((state) => {
      const next = pickPersistedSnapshot(state);
      if (lastSaved.current && snapshotsEqual(lastSaved.current, next)) return;
      lastSaved.current = next;
      saveGame(next);
    });
  }, [hydrated]);

  return null;
}
