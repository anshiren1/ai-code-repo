"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { CabinType } from "@/lib/game-store";
import { FlightDPad } from "@/components/flight-d-pad";
import { useTouchDevice } from "@/hooks/use-touch-device";

interface Position {
  x: number;
  y: number;
}

interface SurfaceMapProps {
  onWin: () => void;
  onLose: (message: string) => void;
  cabinType: CabinType;
  destination: string;
}

const GRID_SIZE = 8;

// Planet-specific colors
const planetBackgrounds: Record<string, string> = {
  Moon: "bg-gray-500",
  Mars: "bg-orange-800",
  Europa: "bg-cyan-700",
  Asteroid: "bg-stone-600",
  Venus: "bg-amber-600",
  Titan: "bg-yellow-800",
};

const planetCellColors: Record<string, string> = {
  Moon: "bg-gray-600 border-gray-400",
  Mars: "bg-orange-900 border-orange-600",
  Europa: "bg-cyan-800 border-cyan-500",
  Asteroid: "bg-stone-700 border-stone-400",
  Venus: "bg-amber-700 border-amber-400",
  Titan: "bg-yellow-900 border-yellow-600",
};

const planetVisitedColors: Record<string, string> = {
  Moon: "bg-gray-400/30",
  Mars: "bg-orange-500/30",
  Europa: "bg-cyan-400/30",
  Asteroid: "bg-stone-400/30",
  Venus: "bg-amber-400/30",
  Titan: "bg-yellow-500/30",
};

// Generate obstacles with guaranteed path to goal
function generateObstacles(count: number): Position[] {
  const obstacles: Position[] = [];
  const blocked = new Set<string>();
  
  // Block start and goal
  blocked.add("0,0");
  blocked.add(`${GRID_SIZE - 1},${GRID_SIZE - 1}`);
  
  // Simple path protection: don't block cells on the main diagonal path
  for (let i = 0; i < GRID_SIZE; i++) {
    blocked.add(`${i},${i}`);
  }
  
  while (obstacles.length < count) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const key = `${x},${y}`;
    
    if (!blocked.has(key)) {
      obstacles.push({ x, y });
      blocked.add(key);
    }
  }
  
  return obstacles;
}

export function SurfaceMap({ onWin, onLose, cabinType, destination }: SurfaceMapProps) {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set(["0,0"]));
  const [isShaking, setIsShaking] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const isTouchDevice = useTouchDevice();
  const [mapTouchHintOpen, setMapTouchHintOpen] = useState(false);
  const mapPointerIdRef = useRef<number | null>(null);
  const mapOriginRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMapTouchHintOpen(isTouchDevice);
  }, [isTouchDevice]);

  // Generate obstacles once using useMemo with empty deps
  const obstacles = useMemo(() => generateObstacles(4), []);
  
  const goal: Position = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };
  
  // Get player icon based on cabin type
  const getPlayerIcon = () => {
    if (cabinType === "cargo") return "\u{1F916}"; // Robot
    if (cabinType === "human") return "\u{1F9D1}\u{200D}\u{1F680}"; // Astronaut
    return "\u{1F9D1}\u{200D}\u{1F680}"; // Hybrid shows astronaut
  };
  
  // Get goal icon based on mission type
  const getGoalIcon = () => {
    return "\u{1F9EA}"; // Science flask
  };
  
  // Check if position has obstacle
  const hasObstacle = useCallback((pos: Position) => {
    return obstacles.some(o => o.x === pos.x && o.y === pos.y);
  }, [obstacles]);
  
  // Move player
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameEnded) return;
    
    setPlayerPos(prevPos => {
      const nextX = Math.max(0, Math.min(GRID_SIZE - 1, prevPos.x + dx));
      const nextY = Math.max(0, Math.min(GRID_SIZE - 1, prevPos.y + dy));
      const nextPos = { x: nextX, y: nextY };
      
      // Check if hit obstacle
      if (hasObstacle(nextPos)) {
        setIsShaking(true);
        setGameEnded(true);
        setTimeout(() => {
          onLose("The payload crashed into an obstacle!");
        }, 500);
        return prevPos; // Don't move into obstacle
      }
      
      // Update visited cells based on new position
      setVisitedCells(prevVisited => {
        const nextVisited = new Set(prevVisited);
        nextVisited.add(`${nextX},${nextY}`);
        return nextVisited;
      });
      
      // Check win condition
      if (nextX === goal.x && nextY === goal.y) {
        setGameEnded(true);
        setTimeout(() => {
          onWin();
        }, 300);
      }

      return nextPos;
    });
  }, [gameEnded, hasObstacle, goal.x, goal.y, onWin, onLose]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameEnded) return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, gameEnded]);

  const onMapPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (gameEnded) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      mapPointerIdRef.current = e.pointerId;
      mapOriginRef.current = { x: e.clientX, y: e.clientY };
    },
    [gameEnded]
  );

  const onMapPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (gameEnded || mapPointerIdRef.current !== e.pointerId) return;
      const dx = e.clientX - mapOriginRef.current.x;
      const dy = e.clientY - mapOriginRef.current.y;
      if (Math.abs(dx) < 32 && Math.abs(dy) < 32) return;
      if (Math.abs(dx) >= Math.abs(dy)) {
        movePlayer(dx > 0 ? 1 : -1, 0);
      } else {
        movePlayer(0, dy > 0 ? 1 : -1);
      }
      mapOriginRef.current = { x: e.clientX, y: e.clientY };
    },
    [gameEnded, movePlayer]
  );

  const onMapPointerEnd = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (mapPointerIdRef.current !== e.pointerId) return;
    mapPointerIdRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const bgColor = planetBackgrounds[destination] || planetBackgrounds["Moon"];
  const cellColor = planetCellColors[destination] || planetCellColors["Moon"];
  const visitedColor = planetVisitedColors[destination] || planetVisitedColors["Moon"];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: isShaking ? [-10, 10, -10, 10, 0] : 0,
      }}
      transition={{ 
        duration: 0.3,
        x: { duration: 0.4 },
      }}
      className="relative flex touch-none flex-col items-center gap-6 overscroll-none"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Surface Mission</h2>
        <p className="text-muted-foreground">Guide your payload to the science objective!</p>
      </div>
      
      {/* Grid */}
      <Card className={`${bgColor} relative overflow-hidden p-4 touch-none select-none`}>
        <CardContent className="relative p-0">
          {isTouchDevice && mapTouchHintOpen && !gameEnded && (
            <button
              type="button"
              className="absolute inset-0 z-20 flex touch-manipulation items-center justify-center rounded-sm bg-black/50 backdrop-blur-[1px]"
              onPointerDown={(e) => {
                e.preventDefault();
                setMapTouchHintOpen(false);
              }}
            >
              <span className="mx-4 rounded-lg border border-border bg-background/95 px-4 py-3 text-sm font-medium text-foreground shadow-md">
                Touch to navigate
              </span>
            </button>
          )}
          <div
            className="grid touch-none gap-1"
            onPointerDown={onMapPointerDown}
            onPointerMove={onMapPointerMove}
            onPointerUp={onMapPointerEnd}
            onPointerCancel={onMapPointerEnd}
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isGoal = goal.x === x && goal.y === y;
              const isObstacle = hasObstacle({ x, y });
              const isVisited = visitedCells.has(`${x},${y}`);
              
              return (
                <motion.div
                  key={`${x}-${y}`}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-sm border flex items-center justify-center text-xl
                    ${cellColor}
                    ${isVisited && !isPlayer && !isGoal ? visitedColor : ""}
                  `}
                  initial={false}
                  animate={{
                    scale: isPlayer ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isPlayer && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-2xl"
                    >
                      {getPlayerIcon()}
                    </motion.span>
                  )}
                  {isGoal && !isPlayer && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-2xl"
                    >
                      {getGoalIcon()}
                    </motion.span>
                  )}
                  {isObstacle && (
                    <span className="text-2xl">{"\u{1FAA8}"}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {!isTouchDevice && (
        <div className="flex flex-col items-center gap-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => movePlayer(0, -1)}
            disabled={gameEnded}
            className="h-14 w-14 touch-manipulation"
          >
            <ChevronUp className="h-8 w-8" />
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => movePlayer(-1, 0)}
              disabled={gameEnded}
              className="h-14 w-14 touch-manipulation"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => movePlayer(0, 1)}
              disabled={gameEnded}
              className="h-14 w-14 touch-manipulation"
            >
              <ChevronDown className="h-8 w-8" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => movePlayer(1, 0)}
              disabled={gameEnded}
              className="h-14 w-14 touch-manipulation"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}

      <FlightDPad
        show={isTouchDevice}
        variant="4way"
        className="fixed bottom-24 right-4 z-40 sm:bottom-8"
        onUp={() => movePlayer(0, -1)}
        onDown={() => movePlayer(0, 1)}
        onLeft={() => movePlayer(-1, 0)}
        onRight={() => movePlayer(1, 0)}
      />

      <p className="px-2 text-center text-sm text-muted-foreground">
        {isTouchDevice
          ? "Drag on the map or use the pad — WASD and arrows still work. "
          : "Arrow keys or WASD. "}
        Avoid the rocks!
      </p>
    </motion.div>
  );
}
