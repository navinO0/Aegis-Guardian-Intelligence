'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Key,
  Globe,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AiProvider {
  id: string;
  name: string;
  type: string;
  baseUrl: string | null;
  apiKey: string | null;
  model: string;
  isActive: boolean;
  config: any;
}

export default function ProvidersSettings() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    type: 'openai',
    baseUrl: '',
    apiKey: '',
    model: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/providers');
      setProviders(res.data);
    } catch (err) {
      toast.error('Failed to load AI providers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/providers', formData);
      toast.success('Provider added successfully');
      setIsAdding(false);
      setFormData({ name: '', type: 'openai', baseUrl: '', apiKey: '', model: '' });
      fetchProviders();
    } catch (err) {
      toast.error('Failed to add provider');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await axios.post(`http://localhost:4000/api/providers/${id}/activate`);
      toast.success('AI Provider activated');
      fetchProviders();
    } catch (err) {
      toast.error('Failed to activate provider');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/providers/${id}`);
      toast.success('Provider deleted');
      fetchProviders();
    } catch (err) {
      toast.error('Failed to delete provider');
    }
  };

  const providerTypes = [
    { id: 'openai', name: 'OpenAI (GPT)', icon: '✨' },
    { id: 'gemini', name: 'Google Gemini', icon: '💎' },
    { id: 'anthropic', name: 'Anthropic (Claude)', icon: '🧠' },
    { id: 'ollama', name: 'Local Ollama', icon: '🦙' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 md:p-12 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-3 bg-card border border-border rounded-xl hover:bg-muted transition-all group"
            >
              <ArrowLeft className="text-muted-foreground group-hover:text-foreground transition-colors" size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <Cpu className="text-primary" />
                Intelligence Nexus
              </h1>
              <p className="text-muted-foreground font-medium">Configure and manage your AI infrastructure</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-sm"
          >
            <Plus size={20} />
            Add Provider
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Synchronizing Systems...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {providers.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={cn(
                    "relative group bg-card border border-border p-6 rounded-3xl transition-all hover:border-primary/30 shadow-sm",
                    p.isActive && "ring-1 ring-primary/20"
                  )}
                >
                  {p.isActive && (
                    <div className="absolute -top-2.5 right-6 bg-primary text-primary-foreground text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Active
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm",
                        p.isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {p.type === 'openai' ? '✨' : p.type === 'gemini' ? '💎' : p.type === 'anthropic' ? '🧠' : '🦙'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{p.name}</h3>
                        <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
                          <Layers size={13} />
                          <span>{p.model}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="uppercase">{p.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!p.isActive && (
                        <button
                          onClick={() => handleActivate(p.id)}
                          className="px-5 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-foreground font-bold text-xs transition-all"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex items-center gap-3">
                      <Key size={14} className="text-muted-foreground" />
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Endpoint</p>
                        <p className="text-xs font-medium text-foreground truncate max-w-[200px]">{p.baseUrl || 'Default Gateway'}</p>
                      </div>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex items-center gap-3">
                      <ShieldCheck size={14} className="text-muted-foreground" />
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Integrity</p>
                        <p className="text-xs font-medium text-foreground">Secure Token Verified</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {providers.length === 0 && !loading && (
              <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
                <p className="text-muted-foreground font-medium text-sm">No custom providers detected. Operating on local Ollama shell.</p>
              </div>
            )}
          </div>
        )}

        {/* No theme selection here - moved to header */}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-card border border-border p-10 rounded-[2.5rem] shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-foreground mb-1">New AI Provider</h2>
              <p className="text-muted-foreground mb-8 text-sm font-medium">Add a new intelligence engine to your workspace.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Architecture</label>
                  <div className="grid grid-cols-2 gap-2">
                    {providerTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all flex items-center gap-3",
                          formData.type === type.id 
                            ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                            : "bg-background border-border text-muted-foreground hover:border-muted-foreground/30"
                        )}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-bold text-xs">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Internal Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. GPT-4 Optimization"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Model Version</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. gpt-4o, gemini-1.5-pro"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Secret Key / Token</label>
                    <input
                      required={formData.type !== 'ollama'}
                      type="password"
                      placeholder="Enter API credentials"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Base Host (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://api.openai.com/v1"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-sm active:scale-95"
                  >
                    Confirm Setup
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 text-center text-[10px] text-muted-foreground font-semibold tracking-widest uppercase pb-12">
        Aegis Intelligence Platform • Secure v2.0
      </footer>
    </div>
  );
}
