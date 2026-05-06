'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Briefcase, Plus, Shield, ArrowRight, Sparkles, Settings, X, ShieldPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const CreateWorkspaceModal = dynamic(() => import('@/components/CreateWorkspaceModal'), { ssr: false });

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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-5xl w-full"
      >
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl shadow-sm" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Aegis Intelligence</h1>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-8">
          The simple way to <br /> <span className="text-primary">manage your insurance.</span>
        </h2>
        
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-16 font-medium">
          Workspace-oriented document intelligence for clarity and advocacy. <br className="hidden md:block" /> Securely index your policies and consult with confidence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {workspaces.map((ws) => (
            <motion.button
              key={ws.id}
              whileHover={{ y: -2 }}
              onClick={() => router.push(`/workspace/${ws.id}`)}
              className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="text-primary" size={18} />
              </div>
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Briefcase size={18} />
              </div>
              <h3 className="font-bold text-lg mb-1">{ws.name}</h3>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">{ws._count?.policies || 0} Indexed</p>
            </motion.button>
          ))}

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-border p-6 rounded-2xl hover:border-primary/50 hover:bg-muted/30 transition-all flex flex-col items-center justify-center text-muted-foreground gap-3 min-h-[160px]"
          >
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="font-bold text-xs tracking-widest uppercase">New Workspace</span>
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
