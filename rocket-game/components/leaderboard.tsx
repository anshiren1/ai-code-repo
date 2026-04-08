"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, User, Rocket, Crown } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

export function Leaderboard() {
  const { leaderboard, playerName, xp, missionsCompleted, level, setPlayerName, addToLeaderboard } =
    useGameStore();
  const [newName, setNewName] = useState(playerName);
  const [isEditing, setIsEditing] = useState(false);

  // Combine player with leaderboard and sort
  const allEntries = [
    ...leaderboard,
    { id: "player", name: playerName, xp, missionsCompleted, level },
  ].sort((a, b) => b.xp - a.xp);

  const playerRank = allEntries.findIndex((e) => e.id === "player") + 1;

  const handleSaveName = () => {
    setPlayerName(newName);
    setIsEditing(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isPlayer: boolean) => {
    if (isPlayer) return "bg-primary/20 border-primary";
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/50";
      case 2:
        return "bg-gray-400/10 border-gray-400/50";
      case 3:
        return "bg-amber-600/10 border-amber-600/50";
      default:
        return "bg-card border-border";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Player Card */}
      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <User className="h-5 w-5 text-primary" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="max-w-xs"
                    placeholder="Enter your name"
                  />
                  <Button onClick={handleSaveName}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-card-foreground">{playerName}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Level {level}
                </Badge>
                <span className="text-sm text-muted-foreground">{xp} XP</span>
                <span className="text-sm text-muted-foreground">
                  {missionsCompleted} missions
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Rank</p>
              <p className="text-3xl font-bold text-primary">#{playerRank}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Trophy className="h-5 w-5 text-primary" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allEntries.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              const isPlayer = entry.id === "player";

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getRankBg(
                    rank,
                    isPlayer
                  )}`}
                >
                  <div className="w-10 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {isPlayer ? (
                      <Rocket className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-card-foreground">
                        {entry.name}
                        {isPlayer && " (You)"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Lvl {entry.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.missionsCompleted} missions completed
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-card-foreground">{entry.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
