'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type AIState = 'idle' | 'thinking' | 'speaking';

interface AIStateVisualizerProps {
  state: AIState;
  intensity?: number; // 0 to 1, used for 'speaking' volume
}

const AIStateVisualizer: React.FC<AIStateVisualizerProps> = ({ state, intensity = 0.5 }) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {/* Abstract Background Glow */}
        <motion.div
          key="glow"
          className={cn(
            "absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-1000",
            state === 'idle' && "bg-blue-500",
            state === 'thinking' && "bg-purple-500",
            state === 'speaking' && "bg-emerald-500"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main Visual Element */}
        <motion.div
          key={state}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative z-10 w-full h-full flex items-center justify-center"
        >
          {state === 'idle' && (
            <motion.div
              className="w-32 h-32 rounded-full border-2 border-blue-400/30 bg-blue-500/10 backdrop-blur-sm"
              animate={{
                borderRadius: ["50% 50% 50% 50%", "45% 55% 48% 52%", "50% 50% 50% 50%"],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}

          {state === 'thinking' && (
            <div className="relative">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 w-32 h-32 rounded-full border border-purple-400/40"
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 120, 240, 360],
                    opacity: [0.5, 0.1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 blur-sm"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          )}

          {state === 'speaking' && (
            <div className="flex items-center justify-center gap-1.5 h-16">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-emerald-400 rounded-full"
                  animate={{
                    height: [
                      8,
                      Math.max(16, 48 * intensity * (0.5 + Math.random())),
                      8
                    ],
                  }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIStateVisualizer;
