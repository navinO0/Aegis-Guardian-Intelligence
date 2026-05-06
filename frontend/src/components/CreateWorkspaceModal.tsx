'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Plus, X, Loader2 } from 'lucide-react';
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-card border border-border p-8 rounded-3xl shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <Plus size={24} />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1">Create Workspace</h2>
            <p className="text-muted-foreground mb-8 text-sm font-medium">Organize your documents in a new secure folder.</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Workspace Name</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Health Insurance 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea
                  placeholder="What's this workspace for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-medium resize-none"
                />
              </div>

              <button
                disabled={isCreating || !name}
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-4 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>Create Workspace</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
