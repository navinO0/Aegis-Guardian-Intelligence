'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { ShieldPlus, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsCreating(true);
    try {
      const res = await axios.post('http://localhost:4000/api/workspaces', { 
        name,
        description 
      });
      toast.success('Shield Workspace Initialized');
      onClose();
      if (onSuccess) onSuccess();
      router.push(`/workspace/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to initialize workspace');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border p-10 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <ShieldPlus size={32} />
            </div>

            <h2 className="text-3xl font-black text-foreground mb-2 italic uppercase">Initialize Shield</h2>
            <p className="text-muted-foreground mb-8 font-medium">Create a new secure compartment for your documents.</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Workspace Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Home Insurance 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Objective (Optional)</label>
                <textarea
                  placeholder="Describe the purpose of this workspace..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-all font-medium resize-none"
                />
              </div>

              <button
                disabled={isCreating || !name}
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3"
              >
                {isCreating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                ) : (
                  <>Deploy Shield</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
