'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Briefcase, Plus, Shield, ArrowRight, Sparkles, Settings, X, ShieldPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';

export default function Home() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/workspaces');
      setWorkspaces(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-4xl"
      >
        <div className="flex items-center justify-center gap-3 mb-8 relative group">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-2xl shadow-2xl shadow-blue-500/20" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Aegis Intelligence</h1>
        </div>

        <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground tracking-tight leading-tight mb-6">
          Your Personal <br /> <span className="text-blue-400">Claims Shield.</span>
        </h2>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
          Workspace-oriented document representation for insurance, legal, and warranty clarity. Upload once, consult forever.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {workspaces.map((ws) => (
            <motion.button
              key={ws.id}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => router.push(`/workspace/${ws.id}`)}
              className="bg-card/40 border border-border p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all backdrop-blur-xl group relative overflow-hidden text-foreground"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="text-blue-500" size={24} />
              </div>
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Briefcase size={24} />
              </div>
              <h3 className="font-bold text-xl mb-2">{ws.name}</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{ws._count?.policies || 0} Documents Indexed</p>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-border p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center text-muted-foreground gap-4 min-h-[220px]"
          >
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase">New Workspace</span>
          </motion.button>
        </div>
      </motion.div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchWorkspaces}
      />

      <footer className="absolute bottom-8 text-[10px] text-muted-foreground/30 font-black tracking-[0.4em] uppercase">
        Aegis Guardian • Workspace Ready • v2.0
      </footer>
    </main>
  );
}
