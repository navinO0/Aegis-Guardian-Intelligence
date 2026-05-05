'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, FileText, Send, Sparkles, Plus, Image as ImageIcon, Loader2, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import { showApiError, showApiSuccess } from '@/lib/api-error';
import DamageUpload from '@/components/DamageUpload';
import VoiceOverlay from '@/components/VoiceOverlay';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchWorkspace = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/workspaces/${workspaceId}`);
      setWorkspace(res.data);
    } catch (err) {
      showApiError(err);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/workspaces/${workspaceId}/summary`);
      setSummary(res.data.summary);
    } catch (err) {
      showApiError(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
    const interval = setInterval(fetchWorkspace, 8000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  useEffect(() => {
    scrollToBottom();
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
        <header className="p-6 border-b border-border flex justify-between items-center backdrop-blur-md bg-background/50 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{workspace.name}</h1>
              <p className="text-xs text-muted-foreground font-medium">Insurance & Document Intelligence</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setShowClaimUpload(true)}
              className="px-5 py-2 bg-primary rounded-xl text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Sparkles size={14} /> Analyze Claim
            </button>
            <button 
              onClick={() => setShowDocUpload(true)}
              className="px-5 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-all flex items-center gap-2"
            >
              <Plus size={14} className="text-primary" /> Add Document
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {/* Docs Section */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
              <div className="w-1 h-3 bg-primary rounded-full" /> Workspace Knowledge Base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspace.policies.map((p: any) => (
                <motion.div 
                  key={p.id}
                  whileHover={{ y: -4 }}
                  className="bg-card/40 border border-border p-5 rounded-[2rem] hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {p.imageUrl ? (
                       <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-border" alt="" />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <FileText size={20} />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-foreground truncate">{p.title}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Indexed</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveVoicePolicy(p)}
                      className="flex-1 py-2.5 bg-primary rounded-xl text-[10px] font-bold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      Voice Consult
                    </button>
                  </div>
                </motion.div>
              ))}
              {workspace.policies.length === 0 && (
                <div className="col-span-full border-2 border-dashed border-border rounded-[2rem] p-12 text-center text-muted-foreground font-medium">
                  No documents in this workspace. Upload your policies to begin.
                </div>
              )}
            </div>
          </section>

          {/* Doc Representator Summary */}
          <section className="bg-gradient-to-br from-primary/20 to-blue-900/10 border border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={120} className="text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">Doc Representator™</h3>
                  <p className="text-sm text-muted-foreground">High-precision workspace intelligence</p>
                </div>
                <button 
                  onClick={generateSummary}
                  disabled={summaryLoading || workspace.policies.length === 0}
                  className="px-6 py-2.5 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-30 flex items-center gap-2"
                >
                  {summaryLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {summary ? 'Refresh Summary' : 'Generate Overview'}
                </button>
              </div>
              
              {summary ? (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-background/50 p-8 rounded-3xl border border-border text-foreground text-sm leading-relaxed font-medium">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">
                  Analyze your knowledge base to reveal coverage gaps and risks.
                </div>
              )}
            </div>
          </section>

          {/* Claims/Analysis Section */}
          {workspace.claims.length > 0 && (
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
                <div className="w-1 h-3 bg-emerald-500 rounded-full" /> Claims Analysis
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workspace.claims.map((c: any) => (
                  <div key={c.id} className="bg-card/30 border border-border/20 p-6 rounded-[2rem] backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{c.status}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2">{c.description}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">{c.advice}</p>
                  </div>
                ))}
              </div>
            </section>
          )}          {/* Chat Section */}
          <section className="flex flex-col flex-1 pb-32">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
              <div className="w-1 h-3 bg-purple-500 rounded-full" /> Shadow Consultations
            </h3>
            <div className="space-y-6">
              {workspace.conversations?.map((conv: any) => (
                <div key={conv.id} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-primary/10 border border-primary/20 px-5 py-3 rounded-2xl max-w-[80%] text-sm font-medium text-foreground flex flex-col gap-3">
                      {conv.imageUrl && (
                        <div className="w-full max-w-[300px] rounded-xl overflow-hidden border border-primary/30 shadow-lg">
                          <img src={conv.imageUrl} className="w-full h-auto object-cover" alt="User upload" />
                        </div>
                      )}
                      {conv.question}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-card border border-border px-6 py-4 rounded-[2rem] max-w-[90%] text-sm leading-relaxed text-foreground prose prose-invert prose-sm">
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
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-background via-background to-transparent z-10">
          <AnimatePresence>
            {chatImagePreview && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-4xl mx-auto mb-4 relative"
              >
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-2xl relative group">
                  <img src={chatImagePreview} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    onClick={() => { setChatImage(null); setChatImagePreview(null); }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <form 
            onSubmit={handleAsk}
            className="max-w-4xl mx-auto bg-card/80 backdrop-blur-2xl border border-border p-2 rounded-3xl flex items-center gap-2 shadow-2xl"
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
              className="p-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the documents in this workspace..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium p-4 text-foreground"
            />
             <button 
              type="submit"
              disabled={loading}
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {showClaimUpload && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <DamageUpload onUploadSuccess={() => setShowClaimUpload(false)} workspaceId={workspaceId} />
              <button onClick={() => setShowClaimUpload(false)} className="mt-4 w-full text-center text-muted-foreground text-sm font-bold">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDocUpload && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="w-full max-w-lg bg-card border border-border p-8 rounded-[2rem] shadow-2xl">
                <h2 className="text-xl font-bold mb-2">Index Workspace Document</h2>
                <p className="text-sm text-muted-foreground mb-6">This document will be added to the {workspace.name} knowledge base.</p>
                <div className="space-y-4">
                  <input id="p-title" placeholder="Document Title" className="w-full bg-background border border-border p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary text-foreground" />
                  <input type="file" id="p-pdf" accept="application/pdf" className="w-full text-xs text-muted-foreground" />
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowDocUpload(false)} className="flex-1 py-4 border border-border rounded-2xl font-bold text-muted-foreground">Cancel</button>
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
                      className="flex-1 py-4 bg-primary rounded-2xl font-bold text-primary-foreground"
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
