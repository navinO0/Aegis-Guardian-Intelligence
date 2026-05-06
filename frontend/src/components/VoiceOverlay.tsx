'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';

interface VoiceOverlayProps {
  policyId: string;
  policyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceOverlay({ policyTitle, isOpen, onClose }: VoiceOverlayProps) {
  const { state, isRecording, startRecording, stopRecording, messages } = useVoiceAgent();
  const lastMessage = messages[messages.length - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-card border border-border p-10 rounded-2xl shadow-2xl text-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center gap-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">{policyTitle}</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Voice Consultation</p>
              </div>

              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: isRecording || state === 'speaking' ? [1, 1.15, 1] : 1,
                    opacity: isRecording || state === 'speaking' ? [0.4, 0.7, 0.4] : 0.2
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-primary rounded-full blur-2xl"
                />
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={state === 'thinking' || state === 'speaking'}
                  className={cn(
                    "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl",
                    isRecording ? "bg-destructive text-destructive-foreground scale-110" : "bg-primary text-primary-foreground hover:scale-105",
                    (state === 'thinking' || state === 'speaking') && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {state === 'thinking' ? (
                    <Loader2 className="animate-spin" size={32} />
                  ) : (
                    <Mic size={32} />
                  )}
                </button>
              </div>

              <div className="text-center h-8 flex items-center justify-center">
                <p className={cn(
                  "font-bold text-[10px] uppercase tracking-widest",
                  isRecording ? "text-destructive animate-pulse" : 
                  state === 'speaking' ? "text-primary" : 
                  "text-muted-foreground"
                )}>
                  {isRecording ? "Listening..." : 
                   state === 'thinking' ? "Synthesizing..." : 
                   state === 'speaking' ? "Speaking..." :
                   "Hold Mic to consult"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {lastMessage && (
                  <motion.div 
                    key={lastMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full bg-muted/30 border border-border p-6 rounded-xl text-left"
                  >
                    <p className="text-sm leading-relaxed text-foreground font-medium italic">
                      "{lastMessage}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
