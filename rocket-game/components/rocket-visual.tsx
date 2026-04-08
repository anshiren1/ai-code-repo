"use client";

import { motion } from "framer-motion";
import { RocketConfig, NOSE_CONES, CABINS, FUEL_TANKS, THRUSTERS } from "@/lib/game-store";

interface RocketVisualProps {
  config: RocketConfig;
  isLaunching?: boolean;
  shake?: boolean;
}

export function RocketVisual({ config, isLaunching = false, shake = false }: RocketVisualProps) {
  const noseCone = NOSE_CONES.find(n => n.type === config.noseCone)!;
  const cabin = CABINS.find(c => c.type === config.cabin)!;
  const fuelTank = FUEL_TANKS.find(f => f.type === config.fuelTank)!;
  const thruster = THRUSTERS.find(t => t.type === config.thruster)!;

  const getNoseConeColor = () => {
    switch (config.noseCone) {
      case "standard": return "#ef4444";
      case "aerodynamic": return "#3b82f6";
      case "reinforced": return "#8b5cf6";
    }
  };

  const getCabinColor = () => {
    switch (config.cabin) {
      case "cargo": return "#22c55e";
      case "human": return "#f59e0b";
      case "hybrid": return "#06b6d4";
    }
  };

  const getFuelTankColor = () => {
    switch (config.fuelTank) {
      case "small": return "#64748b";
      case "medium": return "#6366f1";
      case "large": return "#ec4899";
      case "super": return "#f97316";
    }
  };

  const getThrusterColor = () => {
    switch (config.thruster) {
      case "basic": return "#71717a";
      case "efficient": return "#10b981";
      case "powerful": return "#ef4444";
      case "super-heavy": return "#eab308";
    }
  };

  const getFuelTankHeight = () => {
    switch (config.fuelTank) {
      case "small": return 60;
      case "medium": return 80;
      case "large": return 100;
      case "super": return 130;
    }
  };

  const getCabinHeight = () => {
    switch (config.cabin) {
      case "cargo": return 50;
      case "human": return 60;
      case "hybrid": return 75;
    }
  };

  const getThrusterSize = () => {
    switch (config.thruster) {
      case "basic": return { width: 40, height: 30 };
      case "efficient": return { width: 45, height: 35 };
      case "powerful": return { width: 55, height: 40 };
      case "super-heavy": return { width: 70, height: 50 };
    }
  };

  const fuelTankHeight = getFuelTankHeight();
  const cabinHeight = getCabinHeight();
  const thrusterSize = getThrusterSize();
  const totalHeight = 40 + cabinHeight + fuelTankHeight + thrusterSize.height + 20;
  const canvasMinHeight = totalHeight + 32;

  const combinedAnimation = {
    ...(shake ? { x: [0, -3, 3, -3, 3, 0] } : {}),
    ...(isLaunching ? { y: [0, -500] } : {}),
  };

  const combinedTransition = {
    ...(shake ? { x: { repeat: Infinity, duration: 0.3 } } : {}),
    ...(isLaunching ? { y: { duration: 2.5, ease: "easeIn" as const } } : {}),
  };

  return (
    <div className="relative flex items-center justify-center" style={{ minHeight: canvasMinHeight }}>
      <motion.div
        className="relative"
        animate={combinedAnimation}
        transition={combinedTransition}
      >
        {/* Nose Cone */}
        <motion.svg
          width="60"
          height="50"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 0 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <path
            d="M 30 5 L 55 45 L 5 45 Z"
            fill={getNoseConeColor()}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/20"
          />
          <circle cx="30" cy="30" r="5" fill="white" opacity="0.3" />
        </motion.svg>

        {/* Cabin */}
        <motion.svg
          width="60"
          height={cabinHeight}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 40 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <rect
            x="5"
            y="0"
            width="50"
            height={cabinHeight}
            rx="5"
            fill={getCabinColor()}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/20"
          />
          {/* Windows */}
          {cabin.carriesAstronauts && (
            <>
              <circle cx="20" cy={cabinHeight / 3} r="6" fill="#1e293b" />
              <circle cx="40" cy={cabinHeight / 3} r="6" fill="#1e293b" />
              <circle cx="20" cy={cabinHeight / 3} r="4" fill="#60a5fa" opacity="0.5" />
              <circle cx="40" cy={cabinHeight / 3} r="4" fill="#60a5fa" opacity="0.5" />
            </>
          )}
          {cabin.carriesRover && (
            <rect x="15" y={cabinHeight - 20} width="30" height="12" rx="3" fill="#1e293b" opacity="0.8" />
          )}
        </motion.svg>

        {/* Fuel Tank */}
        <motion.svg
          width="60"
          height={fuelTankHeight}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 40 + cabinHeight }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <rect
            x="8"
            y="0"
            width="44"
            height={fuelTankHeight}
            rx="4"
            fill={getFuelTankColor()}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/20"
          />
          {/* Fuel lines */}
          <line x1="18" y1="10" x2="18" y2={fuelTankHeight - 10} stroke="white" strokeWidth="2" opacity="0.3" />
          <line x1="42" y1="10" x2="42" y2={fuelTankHeight - 10} stroke="white" strokeWidth="2" opacity="0.3" />
        </motion.svg>

        {/* Thruster */}
        <motion.svg
          width="80"
          height={thrusterSize.height + 20}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 40 + cabinHeight + fuelTankHeight }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {/* Engine Bell */}
          <path
            d={`M ${40 - thrusterSize.width / 4} 0 
                L ${40 - thrusterSize.width / 2} ${thrusterSize.height} 
                L ${40 + thrusterSize.width / 2} ${thrusterSize.height} 
                L ${40 + thrusterSize.width / 4} 0 Z`}
            fill={getThrusterColor()}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/20"
          />
          {/* Fins */}
          <path
            d={`M 5 ${thrusterSize.height - 10} L 20 0 L 20 ${thrusterSize.height} Z`}
            fill={getThrusterColor()}
            opacity="0.8"
          />
          <path
            d={`M 75 ${thrusterSize.height - 10} L 60 0 L 60 ${thrusterSize.height} Z`}
            fill={getThrusterColor()}
            opacity="0.8"
          />
        </motion.svg>

        {/* Flame effect when launching */}
        {isLaunching && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 40 + cabinHeight + fuelTankHeight + thrusterSize.height - 5 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.8, 1, 0.8], 
              scale: [1, 1.2, 1],
              y: [0, 10, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.2 }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80">
              <ellipse cx="40" cy="10" rx="20" ry="35" fill="#fbbf24" />
              <ellipse cx="40" cy="15" rx="15" ry="28" fill="#f97316" />
              <ellipse cx="40" cy="20" rx="10" ry="20" fill="#ef4444" />
              <ellipse cx="40" cy="25" rx="5" ry="12" fill="#fef3c7" />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
