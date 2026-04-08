# Rocket Commander: Project Context & Standards

## Project Overview
A space-themed simulator built with **Next.js 15+ (App Router)**, **Tailwind CSS 4**, **Framer Motion**, and **Zustand**. The game features a multi-phase launch sequence (Ignition, Orbit, Transit, Landing) and a surface mission component.

## Technical Standards
- **Styling:** Tailwind CSS 4 (Utility-first).
- **Animation:** Framer Motion for UI transitions and simulation effects.
- **State Management:** Zustand (`lib/game-store.ts`) for game logic and persistence.
- **Type Safety:** Strict TypeScript. Use `as const` for Framer Motion easing and literal types to prevent inference errors.
- **Icons:** Lucide React.
- **Feedback:** Sonner for toasts, Canvas-confetti for celebrations.

## Key Architectures
- **Launch Simulation:** Multi-phase state machine managed via `launchPhase` in the game store.
- **Rocket Visualization:** Dynamic SVG composition based on `RocketConfig`.
- **Mission Logic:** Progressive difficulty system with environment-based stat checks.

## Progress History
### Resolved Issues
1. **Type Safety:** Fixed `animate` and `transition` prop conflicts in `RocketVisual` by using explicit property-based transitions and `as const` for easing.
2. **Dependencies:** Installed missing `@types/canvas-confetti`, `eslint`, and related linting plugins.
3. **Linting Error:** Fixed `eslint.config.mjs` circular structure error by using a modern flat config approach.
4. **Surface Mission:** Refactored `movePlayer` in `SurfaceMap` to use functional state updates, preventing stale closures and ensuring accurate visited-cell tracking.
5. **Daily Challenges:** Updated `completeMission` to correctly award bonus XP and mark challenges as completed when the target mission is successful.

### Active Investigations & Planned Improvements
1. **Repository Setup:** Initializing Git repository in `C:\Project` with `rocket-game` as a sub-folder.
2. **Progression Fix:** The initial state currently unlocks all rocket parts by default. I will revert this to only starter parts and enforce XP requirements in `unlockItem`.
3. **Transit Phase Balance:** The transit success timer (6s) is too short and conflicts with the asteroid spawn requirements (7.2s+). I will recalibrate this to be distance-driven.
4. **Workshop UI:** Adding XP cost labels to locked parts to provide better feedback on progression requirements.

## Contextual Mandates
- Prioritize visual polish and "juicy" interactive feedback.
- Ensure all simulation phases are mobile-friendly (touch-targets, D-Pad support).
- Maintain strict separation between game state (Zustand) and UI presentation.
