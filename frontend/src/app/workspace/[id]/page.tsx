'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, FileText, Send, Sparkles, Plus, Image as ImageIcon, Loader2, ArrowLeft, X, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import { showApiError, showApiSuccess } from '@/lib/api-error';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const DamageUpload = dynamic(() => import('@/components/DamageUpload'), { ssr: false });
const VoiceOverlay = dynamic(() => import('@/components/VoiceOverlay'), { ssr: false });
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
const IntelligenceScanner = dynamic(() => import('@/components/IntelligenceScanner'), { ssr: false });
import remarkGfm from 'remark-gfm';

import { useInterval } from '@/hooks/useInterval';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.id as string;
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showClaimUpload, setShowClaimUpload] = useState(false);
  const [activeVoicePolicy, setActiveVoicePolicy] = useState<{id: string, title: string} | null>(null);
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If we are within 100px of the bottom, consider us "at the bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  const fetchWorkspace = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/workspaces/${workspaceId}`);
      setWorkspace(res.data);
      // Auto-load summary if it exists in cache
      if (res.data.summary && !summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      showApiError(err);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      // Pass refresh=true to force a fresh AI generation
      const res = await axios.get(`http://localhost:4000/api/workspaces/${workspaceId}/summary?refresh=true`);
      setSummary(res.data.summary);
    } catch (err) {
      showApiError(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
    // No longer using naked setInterval here
  }, [workspaceId]);

  // Use visibility-aware polling with increased interval (20s)
  useInterval(() => {
    fetchWorkspace();
  }, 20000);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [workspace?.conversations]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || loading) return;

    setLoading(true);
    try {
      await axios.post(`http://localhost:4000/api/workspaces/${workspaceId}/ask`, { 
        question,
        imageBase64: chatImage
      });
      setQuestion('');
      setChatImage(null);
      setChatImagePreview(null);
      fetchWorkspace();
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const result = re.target?.result as string;
        setChatImagePreview(result);
        setChatImage(result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!workspace) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-500">
      <WorkspaceSidebar />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="px-8 py-4 border-b border-border flex justify-between items-center bg-card transition-colors duration-500">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">{workspace.name}</h1>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Workspace Intelligence</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={() => setShowClaimUpload(true)}
              className="px-4 py-2 bg-primary rounded-lg text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles size={14} /> Analyze Claim
            </button>
            <button 
              onClick={() => setShowDocUpload(true)}
              className="px-4 py-2 bg-muted border border-border rounded-lg text-xs font-bold text-foreground hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Add Document
            </button>
          </div>
        </header>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-8 space-y-12 max-w-6xl mx-auto w-full relative"
        >
          <AnimatePresence>
            {!isAtBottom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={scrollToBottom}
                className="fixed bottom-32 right-12 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border border-primary-foreground/20"
                title="Scroll to bottom"
              >
                <ArrowDown size={20} className="animate-bounce" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Docs Section */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <div className="w-1 h-3 bg-primary rounded-full" /> Knowledge Base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspace.policies.map((p: any) => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border p-5 rounded-xl hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {p.imageUrl ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border">
                        <Image src={p.imageUrl} fill className="object-cover" alt={p.title} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <FileText size={18} />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-foreground truncate">{p.title}</h4>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Indexed</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => setActiveVoicePolicy(p)}
                      className="flex-1 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg text-[10px] font-bold text-foreground transition-all"
                    >
                      Voice Consult
                    </button>
                  </div>
                </motion.div>
              ))}
              {workspace.policies.length === 0 && (
                <div className="col-span-full border-2 border-dashed border-border rounded-xl p-12 text-center text-muted-foreground font-medium text-sm">
                  No documents found. Index your policies to begin.
                </div>
              )}
            </div>
          </section>

          {/* Intelligence Overview */}
          <section className="bg-card border border-border p-8 rounded-2xl relative shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-20">
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Intelligence Overview</h3>
                <p className="text-xs text-muted-foreground font-medium">Automatic workspace synthesis</p>
              </div>
              <button 
                onClick={generateSummary}
                disabled={summaryLoading || workspace.policies.length === 0}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 flex items-center gap-2"
              >
                {summaryLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                {summary ? 'Refresh Analysis' : 'Generate Summary'}
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {summaryLoading ? (
                <motion.div 
                  key="scanner"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >
                  <IntelligenceScanner />
                </motion.div>
              ) : summary ? (
                <motion.div 
                  key="summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm dark:prose-invert max-w-none relative z-20"
                >
                  <div className="bg-muted/30 p-6 rounded-xl border border-border text-foreground leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <div className="py-12 text-center text-muted-foreground font-bold uppercase tracking-widest text-[9px] relative z-20">
                  Generate an analysis to reveal key insights across your documents.
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* Claims/Analysis Section */}
          {workspace.claims.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <div className="w-1 h-3 bg-emerald-500 rounded-full" /> Active Consultations
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workspace.claims.map((c: any) => (
                  <div key={c.id} className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-widest">{c.status}</span>
                      <span className="text-[9px] text-muted-foreground font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-2">{c.description}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-3">{c.advice}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Chat Section */}
          <section className="flex flex-col flex-1 pb-48">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <div className="w-1 h-3 bg-primary rounded-full" /> Interaction Log
            </h3>
            <div className="space-y-6">
              {workspace.conversations?.map((conv: any) => (
                <div key={conv.id} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-primary/5 border border-primary/20 px-4 py-3 rounded-xl max-w-[85%] text-sm font-medium text-foreground flex flex-col gap-3 shadow-sm">
                      {conv.imageUrl && (
                        <div className="w-full max-w-[400px] rounded-lg overflow-hidden border border-border shadow-sm">
                          <Image src={conv.imageUrl} width={400} height={300} className="w-full h-auto object-cover" alt="Uploaded Context" unoptimized />
                        </div>
                      )}
                      {conv.question}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-card border border-border px-5 py-4 rounded-xl max-w-[90%] text-sm leading-relaxed text-foreground prose-sm prose dark:prose-invert shadow-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {conv.answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
          </section>
        </div>

        {/* Input Dock */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            <AnimatePresence>
              {chatImagePreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 relative inline-block"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg relative group">
                    <Image src={chatImagePreview} width={96} height={96} className="w-full h-full object-cover" alt="Preview" unoptimized />
                    <button 
                      onClick={() => { setChatImage(null); setChatImagePreview(null); }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <form 
              onSubmit={handleAsk}
              className="bg-card border border-border p-1.5 rounded-xl flex items-center gap-2 shadow-xl focus-within:ring-1 focus-within:ring-primary/30 transition-all"
            >
              <input 
                type="file" 
                id="chat-image-input" 
                accept="image/*" 
                hidden 
                onChange={handleChatImageChange} 
              />
              <button 
                type="button" 
                onClick={() => document.getElementById('chat-image-input')?.click()}
                className="p-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ImageIcon size={18} />
              </button>
              <input 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Message your workspace advisor..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium p-3 text-foreground"
              />
               <button 
                type="submit"
                disabled={loading}
                className="p-3 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {showClaimUpload && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <DamageUpload onUploadSuccess={() => setShowClaimUpload(false)} workspaceId={workspaceId} />
              <button onClick={() => setShowClaimUpload(false)} className="mt-4 w-full text-center text-white/60 hover:text-white text-xs font-bold transition-all">CLOSE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDocUpload && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
             <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-2xl">
                <h2 className="text-xl font-bold mb-1">Index Document</h2>
                <p className="text-xs text-muted-foreground mb-6 font-medium">Add a legal or insurance policy to your intelligence base.</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Title</label>
                    <input id="p-title" placeholder="e.g. Home Policy 2024" className="w-full bg-background border border-border p-3 rounded-lg text-sm outline-none focus:border-primary transition-all font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">PDF File</label>
                    <input type="file" id="p-pdf" accept="application/pdf" className="w-full text-xs text-muted-foreground" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowDocUpload(false)} className="flex-1 py-3 bg-muted rounded-lg font-bold text-foreground text-xs">Cancel</button>
                    <button 
                      onClick={async () => {
                        const title = (document.getElementById('p-title') as HTMLInputElement).value;
                        const file = (document.getElementById('p-pdf') as HTMLInputElement).files?.[0];
                        if (!title || !file) return;
                        
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = async () => {
                          const base64 = (reader.result as string).split(',')[1];
                          await axios.post('http://localhost:4000/api/policies/upload', { title, pdfBase64: base64, workspaceId });
                          showApiSuccess('Document Indexed');
                          setShowDocUpload(false);
                          fetchWorkspace();
                        };
                      }}
                      className="flex-1 py-3 bg-primary rounded-lg font-bold text-primary-foreground text-xs"
                    >
                      Start Indexing
                    </button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceOverlay 
        isOpen={!!activeVoicePolicy} 
        policyId={activeVoicePolicy?.id || ''} 
        policyTitle={activeVoicePolicy?.title || ''} 
        onClose={() => setActiveVoicePolicy(null)} 
      />
    </div>
  );
}
