'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIStateVisualizer from './AIStateVisualizer';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';

interface VoiceOverlayProps {
  policyId: string;
  policyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceOverlay({ policyId, policyTitle, isOpen, onClose }: VoiceOverlayProps) {
  const { state, isRecording, startRecording, stopRecording, messages } = useVoiceAgent();

  // Primary the conversation with the policy context on mount
  useEffect(() => {
    if (isOpen) {
      // In a real implementation, we'd emit a 'set-context' or similar
      // For now, the backend uses the context from the last indexed policy in simplistic mode
      // but we can simulate a greeting.
    }
  }, [isOpen, policyId]);

  const lastMessage = messages[messages.length - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 overflow-hidden transition-colors duration-500"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000",
              state === 'thinking' ? "bg-purple-600/20 scale-110" : 
              state === 'speaking' ? "bg-emerald-600/20 scale-125" : 
              "bg-primary/10 scale-100"
            )} />
          </div>

          {/* Top Bar */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Volume2 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-foreground uppercase tracking-widest text-xs">Guardian Voice</h2>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">{policyTitle}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-muted border border-border rounded-full text-muted-foreground hover:text-foreground transition-all ring-1 ring-border"
            >
              <X size={24} />
            </button>
          </div>

          {/* Visualizer and Persona */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center">
            <div className="mb-12">
               <AIStateVisualizer state={state} intensity={state === 'speaking' ? 0.9 : 0.4} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8"
              >
                <p className={cn(
                  "text-xl font-medium tracking-tight h-12 flex items-center justify-center",
                  state === 'speaking' ? "text-emerald-400" :
                  state === 'thinking' ? "text-purple-400" :
                  "text-muted-foreground"
                )}>
                  {state === 'speaking' ? "Speaking..." :
                   state === 'thinking' ? "Thinking..." :
                   isRecording ? "Listening to you..." : "Ready to talk"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Last Interaction Bubble */}
            <div className="w-full min-h-[160px] flex items-center justify-center px-4">
               {lastMessage && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-card/50 border border-border/50 p-6 rounded-3xl backdrop-blur-xl relative"
                 >
                   <div className="absolute -top-3 left-6 px-2 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     Advisor
                   </div>
                   <p className="text-lg text-foreground leading-relaxed font-medium">
                     {lastMessage}
                   </p>
                 </motion.div>
               )}
            </div>
          </div>

          {/* Controls */}
          <div className="pb-12 flex flex-col items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => isRecording ? stopRecording() : startRecording()}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.3)] text-white",
                isRecording 
                  ? "bg-red-500 shadow-red-500/20 ring-8 ring-red-500/10" 
                  : "bg-gradient-to-tr from-primary to-indigo-600 shadow-primary/20"
              )}
            >
              {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
            </motion.button>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                 Secure Voice Tunnel Active
               </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
