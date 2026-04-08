"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RocketVisual } from "./rocket-visual";
import { SurfaceMap } from "./surface-map";
import { FlightDPad } from "./flight-d-pad";
import { useTouchDevice } from "@/hooks/use-touch-device";
import { useGameStore, calculateRocketStats, LaunchPhase, FailureReason } from "@/lib/game-store";
import { CheckCircle, ArrowRight, RotateCcw, RefreshCw, Sparkles, Fuel, Wind, Target, AlertTriangle, Rocket as RocketIcon, Package, User, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import confetti from "canvas-confetti";

const phaseInfo: Record<LaunchPhase, { title: string; description: string }> = {
  countdown: {
    title: "IGNITION SEQUENCE",
    description: "Tap anywhere in this panel when the marker is in the green zone (Space also works).",
  },
  liftoff: { title: "LIFT-OFF!", description: "Full thrust engaged!" },
  orbit: { title: "STABILIZATION", description: "Keep the needle centered!" },
  transit: { title: "ASTEROID FIELD", description: "Dodge the asteroids!" },
  landing: { title: "LANDING SEQUENCE", description: "Deploy at the right altitude!" },
  surface_mission: { title: "Surface Mission", description: "Complete the objective!" },
  result: { title: "Mission Complete", description: "" },
};

// Planet surface colors for landing phase
const planetColors: Record<string, string> = {
  Moon: "from-gray-400 to-gray-600",
  Mars: "from-orange-700 to-red-900",
  Europa: "from-blue-200 to-cyan-400",
  Asteroid: "from-stone-500 to-stone-700",
  Venus: "from-yellow-600 to-orange-500",
  Titan: "from-amber-600 to-yellow-800",
};

/** Wider green band for touch targets (~30% of bar, fat-finger friendly). */
const IGNITION_GREEN_MIN = 35;
const IGNITION_GREEN_MAX = 65;

export function LaunchSimulation() {
  const isTouchDevice = useTouchDevice();
  const {
    rocketConfig,
    selectedMission,
    isLaunching,
    launchResult,
    launchPhase,
    failureMessage,
    failureHint,
    failureReason,
    failedPhase,
    resetLaunch,
    restartMission,
    restartPhase,
    setCurrentView,
    setLaunchPhase,
    checkPhase,
    completeMission,
    failMission,
  } = useGameStore();

  const stats = calculateRocketStats(rocketConfig);
  
  // Countdown / Ignition mini-game state (direction in ref so the interval never resets mid-oscillation)
  const [ignitionPosition, setIgnitionPosition] = useState(0);
  const ignitionDirectionRef = useRef(1);
  const [ignitionAttempted, setIgnitionAttempted] = useState(false);
  const [ignitionSuccess, setIgnitionSuccess] = useState(false);
  
  // Orbit stabilization mini-game state
  const [needlePosition, setNeedlePosition] = useState(50);
  const [windDirection, setWindDirection] = useState(0);
  const [orbitTimeLeft, setOrbitTimeLeft] = useState(4);
  const [orbitFailed, setOrbitFailed] = useState(false);
  
  // Transit asteroid dodger state
  const [rocketY, setRocketY] = useState(50);
  const [asteroids, setAsteroids] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [transitFailed, setTransitFailed] = useState(false);
  const [fuelRemaining, setFuelRemaining] = useState(100);
  
  // Landing altitude game state
  const [altitude, setAltitude] = useState(100);
  const [deployAttempted, setDeployAttempted] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  
  // General state
  const [showPayload, setShowPayload] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);

  // Reset states for specific phases when entered
  useEffect(() => {
    if (launchPhase === "countdown") {
      setIgnitionPosition(0);
      ignitionDirectionRef.current = 1;
      setIgnitionAttempted(false);
      setIgnitionSuccess(false);
      setShowPayload(false);
      setHasLanded(false);
    }
  }, [launchPhase]);

  useEffect(() => {
    if (launchPhase === "orbit") {
      setNeedlePosition(50);
      setWindDirection(0);
      setOrbitTimeLeft(4);
      setOrbitFailed(false);
    }
  }, [launchPhase]);

  useEffect(() => {
    if (launchPhase === "transit") {
      setRocketY(50);
      setAsteroids([]);
      setTransitFailed(false);
      setFuelRemaining(100);
    }
  }, [launchPhase]);

  useEffect(() => {
    if (launchPhase === "landing") {
      setAltitude(100);
      setDeployAttempted(false);
      setDeploySuccess(false);
    }
  }, [launchPhase]);

  // ========================================
  // PHASE 1: IGNITION TIMING MINI-GAME
  // ========================================
  useEffect(() => {
    if (launchPhase !== "countdown" || ignitionAttempted) return;

    const interval = setInterval(() => {
      setIgnitionPosition((prev) => {
        const step = 3;
        const dir = ignitionDirectionRef.current;
        let next = prev + dir * step;
        if (next >= 100) {
          ignitionDirectionRef.current = -1;
          next = 100;
        } else if (next <= 0) {
          ignitionDirectionRef.current = 1;
          next = 0;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [launchPhase, ignitionAttempted]);

  const handleIgnition = useCallback(() => {
    if (ignitionAttempted || launchPhase !== "countdown") return;
    
    setIgnitionAttempted(true);
    
    const inGreenZone =
      ignitionPosition >= IGNITION_GREEN_MIN && ignitionPosition <= IGNITION_GREEN_MAX;
    
    if (inGreenZone) {
      setIgnitionSuccess(true);
      // Check if thrust can handle weight
      const result = checkPhase("liftoff");
      if (result.passed) {
        setTimeout(() => setLaunchPhase("liftoff"), 800);
      } else {
        setTimeout(() => {
          failMission(result.failureReason, result.message, result.hint);
        }, 800);
      }
    } else {
      // Missed timing - still try to launch but with penalty
      setTimeout(() => {
        const result = checkPhase("liftoff");
        if (result.passed) {
          setIgnitionSuccess(true);
          setTimeout(() => setLaunchPhase("liftoff"), 500);
        } else {
          failMission(result.failureReason, result.message, result.hint);
        }
      }, 500);
    }
  }, [ignitionAttempted, ignitionPosition, launchPhase, checkPhase, setLaunchPhase, failMission]);

  // Keyboard listener for ignition
  useEffect(() => {
    if (launchPhase !== "countdown") return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleIgnition();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launchPhase, handleIgnition]);

  // ========================================
  // PHASE 2: LIFTOFF ANIMATION (brief transition)
  // ========================================
  useEffect(() => {
    if (launchPhase !== "liftoff") return;
    
    const timer = setTimeout(() => {
      setLaunchPhase("orbit");
    }, 2500);

    return () => clearTimeout(timer);
  }, [launchPhase, setLaunchPhase]);

  // ========================================
  // PHASE 3: ORBIT STABILIZATION MINI-GAME
  // ========================================
  useEffect(() => {
    if (launchPhase !== "orbit" || orbitFailed) return;

    // Wind pushes the needle based on stability (lower stability = stronger wind)
    const stabilityFactor = Math.max(0.5, (100 - stats.stability) / 50);
    
    // Change wind direction randomly
    const windInterval = setInterval(() => {
      setWindDirection(Math.random() > 0.5 ? stabilityFactor : -stabilityFactor);
    }, 800);

    // Apply wind to needle
    const needleInterval = setInterval(() => {
      setNeedlePosition(prev => {
        const newPos = prev + windDirection * 2;
        // Check if in danger zone for too long
        if (newPos < 20 || newPos > 80) {
          // Danger!
        }
        return Math.max(0, Math.min(100, newPos));
      });
    }, 50);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setOrbitTimeLeft(prev => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      clearInterval(windInterval);
      clearInterval(needleInterval);
      clearInterval(timerInterval);
    };
  }, [launchPhase, orbitFailed, windDirection, stats.stability]);

  // Check orbit success/failure
  useEffect(() => {
    if (launchPhase !== "orbit" || orbitFailed) return;

    // Failed if needle is in red zone
    if (needlePosition < 10 || needlePosition > 90) {
      setOrbitFailed(true);
      const result = checkPhase("orbit");
      failMission(
        result.failureReason || "unstable",
        result.message || "Lost control!",
        result.hint || "Your rocket was too unstable! Try the Reinforced Cone for more stability."
      );
    }

    // Success if timer runs out
    if (orbitTimeLeft <= 0 && !orbitFailed) {
      setTimeout(() => setLaunchPhase("transit"), 500);
    }
  }, [launchPhase, needlePosition, orbitTimeLeft, orbitFailed, checkPhase, failMission, setLaunchPhase]);

  // Orbit controls
  const adjustNeedle = useCallback((direction: "left" | "right") => {
    if (launchPhase !== "orbit" || orbitFailed) return;
    setNeedlePosition(prev => {
      const change = direction === "left" ? -5 : 5;
      return Math.max(0, Math.min(100, prev + change));
    });
  }, [launchPhase, orbitFailed]);

  useEffect(() => {
    if (launchPhase !== "orbit") return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        adjustNeedle("left");
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        adjustNeedle("right");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launchPhase, adjustNeedle]);

  // ========================================
  // PHASE 4: TRANSIT ASTEROID DODGER
  // ========================================
  const asteroidIdRef = useRef(0);
  
  useEffect(() => {
    if (launchPhase !== "transit" || transitFailed) return;

    // Spawn asteroids
    const spawnInterval = setInterval(() => {
      setAsteroids(prev => [
        ...prev,
        { id: asteroidIdRef.current++, x: 110, y: Math.random() * 80 + 10 }
      ]);
    }, 1200);

    // Move asteroids and check fuel
    const moveInterval = setInterval(() => {
      setAsteroids(prev => 
        prev
          .map(a => ({ ...a, x: a.x - 3 }))
          .filter(a => a.x > -10)
      );
      
      // Drain fuel based on mission distance
      setFuelRemaining(prev => {
        const fuelDrain = selectedMission ? selectedMission.distance / 50000 : 0.5;
        return Math.max(0, prev - fuelDrain);
      });
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [launchPhase, transitFailed, selectedMission]);

  // Check transit collisions and fuel
  useEffect(() => {
    if (launchPhase !== "transit" || transitFailed) return;

    // Check collision
    const collision = asteroids.some(a => 
      a.x > 5 && a.x < 25 && Math.abs(a.y - rocketY) < 15
    );

    if (collision) {
      setTransitFailed(true);
      failMission(
        "obstacle_crash",
        "Hull Breach!",
        "You hit an asteroid! Drag the field, use the pad, or arrow keys / W S to dodge."
      );
      return;
    }

    // Check fuel
    const result = checkPhase("transit");
    if (!result.passed && fuelRemaining < 30) {
      setTransitFailed(true);
      failMission(result.failureReason, result.message, result.hint);
      return;
    }

    // Success after dodging enough asteroids
    if (fuelRemaining > 0 && asteroidIdRef.current > 5) {
      const allPassed = asteroids.every(a => a.x < 5);
      if (allPassed && asteroids.length > 0) {
        setTimeout(() => setLaunchPhase("landing"), 500);
      }
    }
  }, [launchPhase, asteroids, rocketY, transitFailed, fuelRemaining, checkPhase, failMission, setLaunchPhase]);

  // Transit success timer
  useEffect(() => {
    if (launchPhase !== "transit" || transitFailed) return;
    
    const successTimer = setTimeout(() => {
      if (!transitFailed) {
        setLaunchPhase("landing");
      }
    }, 6000);

    return () => clearTimeout(successTimer);
  }, [launchPhase, transitFailed, setLaunchPhase]);

  // Transit controls
  const moveRocket = useCallback((direction: "up" | "down") => {
    if (launchPhase !== "transit" || transitFailed) return;
    setRocketY(prev => {
      const change = direction === "up" ? -8 : 8;
      return Math.max(5, Math.min(95, prev + change));
    });
  }, [launchPhase, transitFailed]);

  useEffect(() => {
    if (launchPhase !== "transit") return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        moveRocket("up");
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        moveRocket("down");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launchPhase, moveRocket]);

  const orbitPointerIdRef = useRef<number | null>(null);
  const orbitLastClientXRef = useRef(0);

  const onOrbitGaugePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (launchPhase !== "orbit" || orbitFailed) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      orbitPointerIdRef.current = e.pointerId;
      orbitLastClientXRef.current = e.clientX;
    },
    [launchPhase, orbitFailed]
  );

  const onOrbitGaugePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (orbitPointerIdRef.current !== e.pointerId || orbitFailed) return;
      const dx = e.clientX - orbitLastClientXRef.current;
      orbitLastClientXRef.current = e.clientX;
      const deltaNeedle = dx * 0.14;
      setNeedlePosition((prev) => Math.max(0, Math.min(100, prev + deltaNeedle)));
    },
    [orbitFailed]
  );

  const onOrbitGaugePointerEnd = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (orbitPointerIdRef.current !== e.pointerId) return;
    orbitPointerIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const transitPointerIdRef = useRef<number | null>(null);
  const transitLastClientYRef = useRef(0);

  const onTransitPlayfieldPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (launchPhase !== "transit" || transitFailed) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      transitPointerIdRef.current = e.pointerId;
      transitLastClientYRef.current = e.clientY;
    },
    [launchPhase, transitFailed]
  );

  const onTransitPlayfieldPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (transitPointerIdRef.current !== e.pointerId || transitFailed) return;
      const dy = e.clientY - transitLastClientYRef.current;
      transitLastClientYRef.current = e.clientY;
      setRocketY((prev) => Math.max(5, Math.min(95, prev + dy * 0.22)));
    },
    [transitFailed]
  );

  const onTransitPlayfieldPointerEnd = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (transitPointerIdRef.current !== e.pointerId) return;
    transitPointerIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  // ========================================
  // PHASE 5: LANDING ALTITUDE GAME
  // ========================================
  useEffect(() => {
    if (launchPhase !== "landing" || deployAttempted) return;

    const interval = setInterval(() => {
      setAltitude(prev => Math.max(0, prev - 1.5));
    }, 50);

    return () => clearInterval(interval);
  }, [launchPhase, deployAttempted]);

  // Auto-fail if altitude hits 0 without deploying
  useEffect(() => {
    if (launchPhase !== "landing" || deployAttempted) return;
    
    if (altitude <= 0) {
      setDeployAttempted(true);
      failMission("payload_crash", "Crashed on landing!", "You deployed too late! Press the button when in the green zone.");
    }
  }, [launchPhase, altitude, deployAttempted, failMission]);

  const handleDeploy = useCallback(() => {
    if (deployAttempted || launchPhase !== "landing") return;
    
    setDeployAttempted(true);
    
    // Safe zone is 20-40 altitude
    const inSafeZone = altitude >= 15 && altitude <= 40;
    
    if (altitude > 40) {
      // Too early
      failMission("payload_crash", "Parachute ripped!", "You deployed too early! Wait until you're in the green zone.");
    } else if (inSafeZone) {
      setDeploySuccess(true);
      setHasLanded(true);
      
      // Check payload compatibility
      const result = checkPhase("landing");
      if (result.passed) {
        setTimeout(() => {
          setShowPayload(true);
          setTimeout(() => setLaunchPhase("surface_mission"), 1000);
        }, 800);
      } else {
        setTimeout(() => {
          failMission(result.failureReason, result.message, result.hint);
        }, 800);
      }
    } else {
      // Too late
      failMission("payload_crash", "Hard landing!", "You deployed too late! The landing was too rough.");
    }
  }, [deployAttempted, altitude, launchPhase, checkPhase, failMission, setLaunchPhase]);

  useEffect(() => {
    if (launchPhase !== "landing") return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleDeploy();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launchPhase, handleDeploy]);

  // ========================================
  // NAVIGATION HANDLERS
  // ========================================
  const handleContinue = () => {
    if (launchResult === "success") {
      setCurrentView("missions");
    }
    resetLaunch();
  };

  const handleRetry = () => {
    resetLaunch();
    setCurrentView("workshop");
  };

  const getPlanetColor = () => {
    const destination = selectedMission?.destination || "Moon";
    return planetColors[destination] || planetColors["Moon"];
  };

  // Get failure animation based on failure reason
  const getFailureAnimation = (reason: FailureReason) => {
    switch (reason) {
      case "too_heavy":
        return { y: [0, 10, 20, 30], rotate: [-5, 5, -5, 0], scale: [1, 0.95, 0.9, 0.85] };
      case "unstable":
        return { rotate: [0, 45, 90, 180], x: [0, 50, -50, 100], y: [0, -50, 0, 100] };
      case "out_of_fuel":
        return { x: [0, 0], y: [0, 200], rotate: [90, 180], opacity: [1, 0.5] };
      case "payload_crash":
        return { y: [0, 100], rotate: [0, 45], scale: [1, 0.5] };
      case "obstacle_crash":
        return { x: [0, -20, 20, -10, 10, 0], y: [0, 5, -5, 3, -3, 0], rotate: [0, -5, 5, -3, 3, 0] };
      default:
        return { opacity: [1, 0] };
    }
  };

  return (
    <div className="relative flex min-h-[80vh] touch-none items-center justify-center overflow-hidden overscroll-none select-none">
      <AnimatePresence mode="wait">
        {/* PHASE 1: IGNITION TIMING MINI-GAME */}
        {launchPhase === "countdown" && launchResult === null && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 w-full max-w-lg touch-none px-4 text-center"
            onPointerUp={(e: PointerEvent<HTMLDivElement>) => {
              if (ignitionAttempted || e.button !== 0) return;
              handleIgnition();
            }}
          >
            {/* Launch Pad with Rocket */}
            <div className="relative mb-8">
              <motion.div
                animate={ignitionAttempted && ignitionSuccess ? { y: -20 } : {}}
                transition={{ duration: 0.5 }}
              >
                <RocketVisual config={rocketConfig} />
              </motion.div>
              
              {/* Engine warming effect */}
              {ignitionAttempted && ignitionSuccess && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0.8, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-10 h-16 bg-gradient-to-t from-primary via-destructive to-yellow-400 rounded-full blur-sm" />
                </motion.div>
              )}
              
              <div className="mt-4 w-32 h-4 bg-muted rounded-sm mx-auto" />
            </div>

            {/* Phase Info */}
            <Card className="mb-6 border-primary bg-card/90 backdrop-blur">
              <CardContent className="px-6 py-4">
                <div className="mb-2 flex items-center justify-center gap-3">
                  <RocketIcon className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">{phaseInfo.countdown.title}</h3>
                </div>
                <p className="mb-4 text-muted-foreground">{phaseInfo.countdown.description}</p>

                {/* Timing bar — min 44px tall; green zone matches IGNITION_* constants */}
                <div className="relative mb-4 min-h-11 cursor-pointer overflow-hidden rounded-lg bg-muted">
                  <div
                    className="absolute bottom-0 left-0 top-0 bg-destructive/30"
                    style={{ width: `${IGNITION_GREEN_MIN}%` }}
                  />
                  <div
                    className="absolute bottom-0 right-0 top-0 bg-destructive/30"
                    style={{ width: `${100 - IGNITION_GREEN_MAX}%` }}
                  />
                  <div
                    className="absolute bottom-0 top-0 bg-accent/50"
                    style={{
                      left: `${IGNITION_GREEN_MIN}%`,
                      width: `${IGNITION_GREEN_MAX - IGNITION_GREEN_MIN}%`,
                    }}
                  />

                  <motion.div
                    className="absolute bottom-1 top-1 w-2 rounded bg-foreground"
                    style={{ left: `${ignitionPosition}%`, transform: "translateX(-50%)" }}
                    animate={ignitionAttempted ? {} : { scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">GREEN ZONE</span>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="min-h-11 w-full py-6 text-xl font-bold"
                  disabled={ignitionAttempted}
                >
                  {ignitionAttempted ? (ignitionSuccess ? "IGNITION!" : "Timing off...") : "IGNITE! (SPACE)"}
                </Button>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
              Launching to <span className="text-foreground font-bold">{selectedMission?.destination}</span>
            </p>
          </motion.div>
        )}

        {/* LIFTOFF PHASE - Brief animated transition */}
        {launchPhase === "liftoff" && launchResult === null && (
          <motion.div
            key="liftoff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-[600px] flex flex-col items-center justify-end"
          >
            {/* Sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-sky-300 via-sky-400 to-sky-500" />

            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-700 to-stone-600" />
            
            {/* Launch Pad */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-6 bg-stone-500 rounded-t-sm" />

            {/* Smoke clouds */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-20 h-20 bg-muted-foreground/40 rounded-full blur-xl"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 2, 3],
                    x: (i % 2 === 0 ? 1 : -1) * (40 + i * 20),
                    y: [-10, -30, -50],
                    opacity: [0.8, 0.5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>

            {/* Rocket with liftoff animation */}
            <motion.div
              className="absolute bottom-28"
              initial={{ y: 0 }}
              animate={{ y: [0, 10, 5, -150, -350], x: [-3, 3, -3, 3, -2, 2, 0] }}
              transition={{ 
                y: { duration: 2.5, times: [0, 0.1, 0.15, 0.5, 1], ease: "easeOut" },
                x: { duration: 0.15, repeat: 15, ease: "linear" },
              }}
            >
              <RocketVisual config={rocketConfig} isLaunching />
            </motion.div>

            {/* Phase Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
            >
              <Card className="bg-card/90 backdrop-blur border-primary">
                <CardContent className="py-4 px-6 text-center">
                  <h3 className="text-2xl font-bold text-primary">{phaseInfo.liftoff.title}</h3>
                  <p className="text-muted-foreground">{phaseInfo.liftoff.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 2: ORBIT STABILIZATION MINI-GAME */}
        {launchPhase === "orbit" && launchResult === null && (
          <motion.div
            key="orbit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-[600px] w-full touch-none flex-col items-center justify-center overflow-hidden overscroll-none"
          >
            {/* Space background */}
            <motion.div 
              className="absolute inset-0"
              initial={{ background: "linear-gradient(to top, #38bdf8, #0ea5e9)" }}
              animate={{ background: "linear-gradient(to top, #0f172a, #1e293b)" }}
              transition={{ duration: 2 }}
            />

            {/* Stars */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-foreground rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 1] }}
                transition={{ delay: Math.random() * 2, duration: 1 }}
              />
            ))}

            {/* Rocket */}
            <motion.div
              className="mb-8"
              animate={{ 
                rotate: (needlePosition - 50) / 5,
                x: (needlePosition - 50) / 2,
              }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <RocketVisual config={rocketConfig} isLaunching />
            </motion.div>

            {/* Stabilization UI */}
            <Card className="mx-4 w-full max-w-md border-secondary bg-card/90 backdrop-blur">
              <CardContent className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-secondary" />
                    <h3 className="font-bold text-foreground">{phaseInfo.orbit.title}</h3>
                  </div>
                  <div className="text-xl font-mono font-bold text-secondary">
                    {orbitTimeLeft.toFixed(1)}s
                  </div>
                </div>

                {/* Stability Gauge — pointer drag steers (mouse + touch unified) */}
                <div
                  className="relative mb-4 min-h-11 cursor-grab touch-none overflow-hidden rounded-lg bg-muted active:cursor-grabbing"
                  onPointerDown={onOrbitGaugePointerDown}
                  onPointerMove={onOrbitGaugePointerMove}
                  onPointerUp={onOrbitGaugePointerEnd}
                  onPointerCancel={onOrbitGaugePointerEnd}
                >
                  <div className="absolute bottom-0 left-0 top-0 w-[20%] bg-destructive/50" />
                  <div className="absolute bottom-0 right-0 top-0 w-[20%] bg-destructive/50" />
                  <div className="absolute bottom-0 left-[20%] top-0 w-[15%] bg-warning/30" />
                  <div className="absolute bottom-0 right-[20%] top-0 w-[15%] bg-warning/30" />
                  <div className="absolute bottom-0 left-[35%] top-0 w-[30%] bg-accent/40" />

                  <motion.div
                    className="pointer-events-none absolute bottom-0 top-0 w-3 rounded bg-foreground"
                    style={{ left: `calc(${needlePosition}% - 6px)` }}
                  />

                  <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-accent" />
                </div>

                {/* Wind indicator */}
                <div className="flex justify-center items-center gap-2 mb-4 text-muted-foreground">
                  <span>Wind:</span>
                  <motion.div
                    animate={{ x: windDirection * 20 }}
                    className="text-secondary"
                  >
                    {windDirection > 0 ? "→→" : "←←"}
                  </motion.div>
                </div>

                {!isTouchDevice && (
                  <div className="flex justify-center gap-4 md:hidden">
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="px-8"
                      onClick={() => adjustNeedle("left")}
                    >
                      <ChevronLeft className="h-6 w-6" /> A
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="px-8"
                      onClick={() => adjustNeedle("right")}
                    >
                      D <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Stability: {stats.stability}% {stats.stability < 50 && "(Low - harder to control!)"}
                </p>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {isTouchDevice
                    ? "Drag on the gauge or use the pad — A/D and arrows still work."
                    : "Drag on the gauge or use A / D and arrow keys."}
                </p>
              </CardContent>
            </Card>

            <FlightDPad
              show={isTouchDevice}
              variant="horizontal"
              className="fixed bottom-8 right-4 z-30"
              onLeft={() => adjustNeedle("left")}
              onRight={() => adjustNeedle("right")}
            />
          </motion.div>
        )}

        {/* PHASE 3: TRANSIT ASTEROID DODGER */}
        {launchPhase === "transit" && launchResult === null && (
          <motion.div
            key="transit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-[600px] w-full touch-none items-center justify-center overflow-hidden overscroll-none bg-slate-950"
          >
            {/* Parallax stars */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-foreground rounded-full"
                style={{ top: `${Math.random() * 100}%` }}
                initial={{ x: "100vw" }}
                animate={{ x: "-100vw" }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }}
              />
            ))}

            {/* Game area */}
            <div
              className="relative h-80 w-full max-w-2xl touch-none select-none overflow-hidden rounded-lg border border-secondary/30 bg-slate-900/50"
              onPointerDown={onTransitPlayfieldPointerDown}
              onPointerMove={onTransitPlayfieldPointerMove}
              onPointerUp={onTransitPlayfieldPointerEnd}
              onPointerCancel={onTransitPlayfieldPointerEnd}
            >
              {/* Rocket */}
              <motion.div
                className="absolute left-8 w-12"
                style={{ top: `${rocketY}%`, transform: "translateY(-50%) rotate(90deg) scale(0.4)" }}
              >
                <RocketVisual config={rocketConfig} isLaunching />
              </motion.div>

              {/* Asteroids */}
              {asteroids.map(asteroid => (
                <motion.div
                  key={asteroid.id}
                  className="absolute w-8 h-8 bg-gradient-to-br from-stone-400 to-stone-600 rounded-full"
                  style={{
                    left: `${asteroid.x}%`,
                    top: `${asteroid.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-1 rounded-full bg-stone-500/50" />
                  <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-stone-700" />
                </motion.div>
              ))}
            </div>

            {/* UI Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <Card className="bg-card/90 backdrop-blur border-secondary">
                <CardContent className="py-3 px-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-secondary" />
                      <span className="font-bold text-foreground">{phaseInfo.transit.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-primary" />
                      <div className="w-24 h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          style={{ width: `${fuelRemaining}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!isTouchDevice && (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 md:hidden">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => moveRocket("up")}
                    className="px-8"
                  >
                    <ChevronUp className="h-6 w-6" /> W
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => moveRocket("down")}
                    className="px-8"
                  >
                    <ChevronDown className="h-6 w-6" /> S
                  </Button>
                </div>
                <p className="max-w-xs px-2 text-center text-xs text-slate-400">
                  Drag vertically on the playfield
                </p>
              </div>
            )}
            <p className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 text-sm text-slate-400 md:block">
              Arrow keys, W / S, or drag the playfield
            </p>

            <FlightDPad
              show={isTouchDevice}
              variant="vertical"
              className="fixed bottom-8 right-4 z-30"
              onUp={() => moveRocket("up")}
              onDown={() => moveRocket("down")}
            />

            {/* Distance indicator */}
            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <p className="text-secondary font-mono">
                {selectedMission?.distance.toLocaleString()} km to {selectedMission?.destination}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 4: LANDING ALTITUDE GAME */}
        {launchPhase === "landing" && launchResult === null && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-[600px] w-full touch-none items-center justify-center overflow-hidden overscroll-none"
            onPointerUp={(e: PointerEvent<HTMLDivElement>) => {
              if (deployAttempted || e.button !== 0) return;
              handleDeploy();
            }}
          >
            {/* Space background */}
            <div className="absolute inset-0 bg-slate-950" />

            {/* Stars */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-foreground rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}

            {/* Planet surface */}
            <motion.div
              className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${getPlanetColor()}`}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <div className="absolute inset-0 opacity-30">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-black/20"
                    style={{
                      width: 20 + Math.random() * 40,
                      height: 10 + Math.random() * 15,
                      left: `${Math.random() * 90}%`,
                      top: `${Math.random() * 60 + 20}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Rocket descending */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: `${altitude * 4 + 32}px` }}
            >
              <RocketVisual config={rocketConfig} isLaunching={!hasLanded} />
              
              {/* Landing thrusters */}
              {!hasLanded && deployAttempted && deploySuccess && (
                <motion.div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                >
                  <div className="w-2 h-8 bg-gradient-to-t from-primary to-yellow-300 rounded-full blur-[1px]" />
                  <div className="w-3 h-10 bg-gradient-to-t from-primary to-yellow-300 rounded-full blur-[1px]" />
                  <div className="w-2 h-8 bg-gradient-to-t from-primary to-yellow-300 rounded-full blur-[1px]" />
                </motion.div>
              )}
            </motion.div>

            {/* Payload deployment animation */}
            <AnimatePresence>
              {showPayload && (
                <motion.div
                  className="absolute bottom-36 left-1/2"
                  initial={{ x: -12, y: 0, opacity: 0, scale: 0 }}
                  animate={{ x: 60, y: 20, opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  {selectedMission?.requiresRover ? (
                    <div className="flex flex-col items-center">
                      <Package className="h-8 w-8 text-accent" />
                      <span className="text-xs text-accent mt-1">Rover Deployed!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <User className="h-8 w-8 text-accent" />
                      <span className="text-xs text-accent mt-1">Astronaut Ready!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Altitude meter on side */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 h-80 w-16 flex flex-col items-center">
              <span className="text-sm text-muted-foreground mb-2">ALT</span>
              <div className="relative flex-1 w-8 bg-muted rounded-full overflow-hidden">
                {/* Danger zone (too early) */}
                <div className="absolute top-0 left-0 right-0 h-[60%] bg-destructive/30" />
                {/* Safe zone */}
                <div className="absolute top-[60%] left-0 right-0 h-[25%] bg-accent/50" />
                {/* Danger zone (too late) */}
                <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-destructive/30" />
                
                {/* Current altitude marker */}
                <motion.div
                  className="absolute left-0 right-0 h-2 bg-foreground rounded"
                  style={{ top: `${100 - altitude}%` }}
                />
                
                {/* Zone labels */}
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 text-[10px] text-destructive-foreground font-bold rotate-90 whitespace-nowrap">
                  TOO EARLY
                </div>
                <div className="absolute top-[72%] left-1/2 -translate-x-1/2 text-[10px] text-accent-foreground font-bold rotate-90 whitespace-nowrap">
                  DEPLOY!
                </div>
              </div>
              <span className="text-lg font-mono text-foreground mt-2">{Math.round(altitude)}m</span>
            </div>

            {/* Landing UI */}
            <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
              <Card className="border-accent bg-card/90 backdrop-blur">
                <CardContent className="px-6 py-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Target className="h-5 w-5 text-accent" />
                    <span className="font-bold text-foreground">{phaseInfo.landing.title}</span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Tap anywhere in this view when in the green zone — or use the button / Space.
                  </p>
                  <Button
                    type="button"
                    size="lg"
                    className="min-h-11 w-full py-4"
                    disabled={deployAttempted}
                  >
                    {deployAttempted
                      ? deploySuccess
                        ? "DEPLOYED!"
                        : "DEPLOYING..."
                      : "DEPLOY! (SPACE)"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* SURFACE MISSION PHASE */}
        {launchPhase === "surface_mission" && launchResult === null && (
          <motion.div
            key="surface_mission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-[600px] w-full touch-none items-center justify-center overscroll-none py-8"
          >
            <div className={`absolute inset-0 bg-gradient-to-t ${getPlanetColor()} opacity-30`} />
            
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-foreground rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 40}%` }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
            
            <SurfaceMap
              cabinType={rocketConfig.cabin}
              destination={selectedMission?.destination || "Moon"}
              onWin={() => {
                completeMission();
                confetti({
                  particleCount: 200,
                  spread: 120,
                  origin: { y: 0.6 },
                  colors: ["#f97316", "#06b6d4", "#22c55e", "#fbbf24", "#ec4899"],
                });
              }}
              onLose={(message) => {
                failMission("obstacle_crash", message, "Try navigating around the obstacles next time!");
              }}
            />
          </motion.div>
        )}

        {/* FAILURE ANIMATION */}
        {launchResult === "failure" && launchPhase !== "result" && launchPhase !== "surface_mission" && (
          <motion.div
            key="failure-animation"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-[600px] flex items-center justify-center bg-slate-950"
          >
            {/* Explosion particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{ 
                  background: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--destructive)" : "var(--warning)",
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 1.5, delay: Math.random() * 0.3 }}
              />
            ))}

            {/* Failing rocket */}
            <motion.div
              initial={{ rotate: 0, y: 0, x: 0 }}
              animate={getFailureAnimation(failureReason)}
              transition={{ duration: 2, ease: "easeIn" }}
            >
              <RocketVisual config={rocketConfig} />
            </motion.div>

            {/* Transition to result after animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onAnimationComplete={() => setLaunchPhase("result")}
            />
          </motion.div>
        )}

        {/* RESULT PHASE */}
        {launchPhase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center z-10"
          >
            <Card className={`max-w-md mx-auto ${
              launchResult === "success" 
                ? "bg-accent/10 border-accent" 
                : "bg-destructive/10 border-destructive"
            }`}>
              <CardContent className="py-8">
                {launchResult === "success" ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <CheckCircle className="h-20 w-20 text-accent mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-accent mb-2">
                      Mission Success!
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Amazing job! Your rocket landed safely on {selectedMission?.destination}!
                    </p>
                    <div className="bg-card rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                        <Sparkles className="h-6 w-6" />
                        +{selectedMission?.xpReward} XP
                      </div>
                    </div>
                    <Button onClick={handleContinue} size="lg" className="w-full">
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                    >
                      <AlertTriangle className="h-20 w-20 text-destructive mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-destructive mb-2">
                      {failureMessage || "Mission Failed"}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Don&apos;t give up! Every space engineer learns from testing!
                    </p>
                    <div className="bg-card rounded-lg p-4 mb-6 text-left">
                      <p className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Tip from Mission Control:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {failureHint || "Try adjusting your rocket configuration!"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        {failedPhase && failedPhase !== "countdown" && (
                          <Button 
                            onClick={restartPhase} 
                            className="flex-1 h-12"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restart Phase
                          </Button>
                        )}
                        <Button 
                          variant={failedPhase && failedPhase !== "countdown" ? "secondary" : "default"}
                          onClick={restartMission} 
                          className="flex-1 h-12"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restart Mission
                        </Button>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleRetry}
                          className="flex-1"
                        >
                          <RocketIcon className="mr-2 h-4 w-4" />
                          Modify Rocket
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={handleContinue} 
                          className="flex-1"
                        >
                          Try Different Mission
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
