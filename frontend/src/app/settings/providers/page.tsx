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
import { useTheme } from '@/components/ThemeProvider';
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
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen bg-[#020617] text-slate-50 p-8 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group"
            >
              <ArrowLeft className="text-slate-400 group-hover:text-white transition-colors" size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Cpu className="text-blue-500" />
                Intelligence Nexus
              </h1>
              <p className="text-slate-500 font-medium">Configure and switch between advanced AI providers</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} />
            Add Provider
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Synchronizing Providers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {providers.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative group bg-slate-900/40 border ${p.isActive ? 'border-blue-500/50' : 'border-slate-800/50'} p-8 rounded-[2.5rem] backdrop-blur-xl transition-all hover:border-slate-700`}
                >
                  {p.isActive && (
                    <div className="absolute -top-3 left-8 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/40">
                      Active Shield
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex gap-6">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-2xl ${p.isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {p.type === 'openai' ? '✨' : p.type === 'gemini' ? '💎' : p.type === 'anthropic' ? '🧠' : '🦙'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{p.name}</h3>
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                          <Layers size={14} />
                          <span>{p.model}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>{p.type.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!p.isActive && (
                        <button
                          onClick={() => handleActivate(p.id)}
                          className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-white font-bold text-sm transition-all"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        <Key size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">API Endpoint</p>
                        <p className="text-xs font-mono text-slate-400 truncate">{p.baseUrl || 'Default Gateway'}</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Token Integrity</p>
                        <p className="text-xs font-mono text-slate-400">••••••••••••••••</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {providers.length === 0 && !loading && (
              <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem]">
                <p className="text-slate-500 font-medium italic">No custom providers configured. Aegis is running on local Ollama by default.</p>
              </div>
            )}
          </div>
        )}

        <section className="mt-12 bg-slate-900/40 border border-slate-800/50 p-10 rounded-[3.5rem] backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Appearance</h2>
              <p className="text-slate-500 font-medium">Personalize your shield interface</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'dark', name: 'Midnight', desc: 'Aegis Standard', class: 'bg-[#020617]' },
              { id: 'light', name: 'Glacier', desc: 'Solar Optimized', class: 'bg-white' },
              { id: 'grey', name: 'Steel', desc: 'Neutral Balance', class: 'bg-[#334155]' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  "relative group overflow-hidden border p-6 rounded-[2.5rem] text-left transition-all",
                  theme === t.id 
                    ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20" 
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl border border-white/10", t.class)} />
                  {theme === t.id && (
                    <CheckCircle2 size={24} className="text-white" />
                  )}
                </div>
                <p className="font-bold text-lg mb-1">{t.name}</p>
                <p className={cn("text-xs font-medium uppercase tracking-widest", theme === t.id ? "text-blue-100" : "text-slate-600")}>
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
              
              <h2 className="text-3xl font-black text-white mb-2">New Provider</h2>
              <p className="text-slate-500 mb-8 font-medium">Integrate a new intelligence engine into Aegis.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Provider Core</label>
                  <div className="grid grid-cols-2 gap-3">
                    {providerTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${formData.type === type.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-bold text-xs">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Premium Intelligence"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Model Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. gpt-4o, gemini-1.5-pro"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">API Key / Token</label>
                    <input
                      required={formData.type !== 'ollama'}
                      type="password"
                      placeholder="Enter your security token"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom Host (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://api.openai.com/v1"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                  >
                    Shield Onboard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 text-center text-[10px] text-slate-700 font-black tracking-[0.4em] uppercase">
        Aegis Guardian Intelligence Configuration • v2.0
      </footer>
    </div>
  );
}
