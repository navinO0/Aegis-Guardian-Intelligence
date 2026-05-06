'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Cpu, Sparkles } from 'lucide-react';

export default function IntelligenceScanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-muted/30 border border-border p-12 flex flex-col items-center justify-center min-h-[300px]">
      {/* The Scanning Line */}
      <motion.div 
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
      />
      
      {/* Background Grid Particles */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      <div className="relative z-20 flex flex-col items-center text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8 border border-primary/20"
        >
          <Shield size={40} />
        </motion.div>

        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <Sparkles size={18} className="text-primary animate-pulse" />
          Aegis Architect is Scanning
        </h3>
        
        <div className="flex flex-col gap-2 mt-4 w-64">
           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: '0%' }}
               animate={{ width: '100%' }}
               transition={{ duration: 15, repeat: Infinity }}
               className="h-full bg-primary"
             />
           </div>
           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
             <span>Cross-referencing policies</span>
             <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
             >
               Processing...
             </motion.span>
           </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
           <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-card border border-border px-3 py-1.5 rounded-lg">
             <Search size={12} className="text-primary" /> Vectorizing PDF
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-card border border-border px-3 py-1.5 rounded-lg">
             <Cpu size={12} className="text-primary" /> Neural Mapping
           </div>
        </div>
      </div>
    </div>
  );
}
