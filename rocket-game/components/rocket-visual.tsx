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

  const getGradients = (id: string, baseColor: string) => (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: baseColor, stopOpacity: 0.8 }} />
        <stop offset="50%" style={{ stopColor: baseColor, stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: baseColor, stopOpacity: 0.8 }} />
      </linearGradient>
    </defs>
  );

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

  const fuelTankHeight = getFuelTankHeight();
  const cabinHeight = getCabinHeight();
  const thrusterSize = getThrusterSize();
  const totalHeight = 40 + cabinHeight + fuelTankHeight + thrusterSize.height + 20;
  const canvasMinHeight = totalHeight + 32;

  const combinedAnimation = {
    ...(shake ? { x: [0, -3, 3, -3, 3, 0] } : { y: [0, -10, 0] }),
    ...(isLaunching ? { y: [0, -500] } : {}),
  };

  const combinedTransition = {
    ...(shake ? { x: { repeat: Infinity, duration: 0.3 } } : { y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }),
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
        <motion.svg width="60" height="50" className="absolute left-1/2 -translate-x-1/2" style={{ top: 0 }}>
          {getGradients("noseGrad", getNoseConeColor())}
          <path d="M 30 5 L 55 45 L 5 45 Z" fill="url(#noseGrad)" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
        </motion.svg>

        {/* Cabin */}
        <motion.svg width="60" height={cabinHeight} className="absolute left-1/2 -translate-x-1/2" style={{ top: 40 }}>
          {getGradients("cabinGrad", getCabinColor())}
          <rect x="5" y="0" width="50" height={cabinHeight} rx="5" fill="url(#cabinGrad)" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
          {cabin.carriesAstronauts && (
            <g>
              <circle cx="20" cy={cabinHeight / 2} r="6" fill="#1e293b" />
              <circle cx="40" cy={cabinHeight / 2} r="6" fill="#1e293b" />
              <circle cx="20" cy={cabinHeight / 2} r="3" fill="#60a5fa" opacity="0.8" />
              <circle cx="40" cy={cabinHeight / 2} r="3" fill="#60a5fa" opacity="0.8" />
            </g>
          )}
        </motion.svg>

        {/* Fuel Tank */}
        <motion.svg width="60" height={fuelTankHeight} className="absolute left-1/2 -translate-x-1/2" style={{ top: 40 + cabinHeight }}>
          {getGradients("tankGrad", getFuelTankColor())}
          <rect x="8" y="0" width="44" height={fuelTankHeight} rx="4" fill="url(#tankGrad)" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
        </motion.svg>

        {/* Thruster */}
        <motion.svg width="80" height={thrusterSize.height + 20} className="absolute left-1/2 -translate-x-1/2" style={{ top: 40 + cabinHeight + fuelTankHeight }}>
          {getGradients("thrustGrad", getThrusterColor())}
          <path d={`M ${40 - thrusterSize.width / 4} 0 L ${40 - thrusterSize.width / 2} ${thrusterSize.height} L ${40 + thrusterSize.width / 2} ${thrusterSize.height} L ${40 + thrusterSize.width / 4} 0 Z`} fill="url(#thrustGrad)" />
        </motion.svg>

        {/* Flame effect */}
        {isLaunching && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: 40 + cabinHeight + fuelTankHeight + thrusterSize.height - 5 }}
            animate={{ scale: [1, 1.2, 0.9], opacity: [1, 0.8, 0] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
          >
            <div className="w-12 h-20 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-full blur-md" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
