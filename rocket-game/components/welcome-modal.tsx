"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Play, X, Sparkles } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

export function WelcomeModal() {
  const { tutorialCompleted, setTutorialCompleted } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!tutorialCompleted) {
      setIsOpen(true);
    }
  }, [tutorialCompleted]);

  const handleSkip = () => {
    setTutorialCompleted(true);
    setIsOpen(false);
  };

  const handleWatchTutorial = () => {
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setTutorialCompleted(true);
    setIsOpen(false);
    setShowVideo(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg"
          >
            <Card className="border-2 border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl shadow-primary/20">
              {!showVideo ? (
                <>
                  {/* Welcome Screen */}
                  <CardHeader className="text-center pb-2">
                    <motion.div
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mx-auto mb-4"
                    >
                      <div className="relative">
                        <Rocket className="h-20 w-20 text-primary mx-auto" />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-2 -right-2"
                        >
                          <Sparkles className="h-8 w-8 text-warning" />
                        </motion.div>
                      </div>
                    </motion.div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-card-foreground">
                      Welcome, Commander!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <p className="text-center text-muted-foreground text-lg">
                      Do you want to watch the video tutorial on how to build and launch rockets?
                    </p>

                    {/* Decorative stars */}
                    <div className="flex justify-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <motion.span
                          key={i}
                          animate={{ 
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="text-2xl"
                        >
                          *
                        </motion.span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        size="lg"
                        className="w-full py-6 text-lg font-bold"
                        onClick={handleWatchTutorial}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Watch Tutorial
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full py-6 text-lg"
                        onClick={handleSkip}
                      >
                        <X className="h-5 w-5 mr-2" />
                        Skip for Now
                      </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      You can always find the tutorial in the settings later
                    </p>
                  </CardContent>
                </>
              ) : (
                <>
                  {/* Video Player Screen */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-card-foreground text-center">
                      Rocket Building Tutorial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Responsive Video Container */}
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Rocket Building Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Learn how to build powerful rockets and complete missions!
                    </p>

                    <Button
                      size="lg"
                      className="w-full py-6 text-lg font-bold"
                      onClick={handleCloseVideo}
                    >
                      <Rocket className="h-5 w-5 mr-2" />
                      Start Playing!
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>

          {/* Floating decorative elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
