'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AIStateVisualizer from '@/components/AIStateVisualizer';
import { Mic, Image as ImageIcon, FileText, Settings, History, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import DamageUpload from '@/components/DamageUpload';
import PolicyDoubts from '@/components/PolicyDoubts';
import { AnimatePresence, motion } from 'framer-motion';
import { showApiError, showApiSuccess } from '@/lib/api-error';
import VoiceOverlay from '@/components/VoiceOverlay';

export default function Home() {
  const { state, isRecording, startRecording, stopRecording, sendTextMessage } = useVoiceAgent();
  const [showUploader, setShowUploader] = useState(false);
  const [showPolicyUpload, setShowPolicyUpload] = useState(false);
  const [activePolicy, setActivePolicy] = useState<{id: string, title: string} | null>(null);
  const [activeVoicePolicy, setActiveVoicePolicy] = useState<{id: string, title: string} | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const hasShownFetchError = useRef(false);
  const hasShownPolicyError = useRef(false);
  const previousClaimsRef = useRef<any[]>([]);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/policies');
      setPolicies(Array.isArray(response.data) ? response.data : []);
      hasShownPolicyError.current = false;
    } catch (err) {
      if (!hasShownPolicyError.current) {
        showApiError(err, 'Failed to sync documents');
        hasShownPolicyError.current = true;
      }
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/claims');
      const newClaims = Array.isArray(response.data) ? response.data : [];
      
      if (previousClaimsRef.current.length > 0) {
        newClaims.forEach((claim: any) => {
          const prev = previousClaimsRef.current.find(p => p.id === claim.id);
          if (prev && prev.status === 'PENDING' && claim.status === 'ANALYZED') {
            showApiSuccess(`Analysis complete: ${claim.description.substring(0, 30)}...`);
          } else if (prev && prev.status === 'PENDING' && claim.status === 'FAILED') {
            showApiError(null, `Analysis failed for: ${claim.description.substring(0, 30)}...`);
          }
        });
      }

      setClaims(newClaims);
      previousClaimsRef.current = newClaims;
      hasShownFetchError.current = false;
    } catch (err) {
      if (!hasShownFetchError.current) {
        showApiError(err);
        hasShownFetchError.current = true;
      }
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
    const interval = setInterval(() => {
      fetchClaims();
      fetchPolicies();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMicClick = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 flex flex-col items-center justify-between p-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="w-full max-w-6xl flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-lg" />
          <h1 className="text-xl font-bold tracking-tight">Aegis AI</h1>
        </div>
        <div className="flex gap-6 text-sm text-slate-400 font-medium">
          <button className="hover:text-slate-100 transition-colors flex items-center gap-1.5">
            <History size={16} /> History
          </button>
          <button className="hover:text-slate-100 transition-colors flex items-center gap-1.5">
            <Settings size={16} /> Settings
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Aegis Intelligence. <br /> Secure your rights.
          </h2>
          <p className="text-slate-500 mt-4 max-w-md mx-auto">
            Upload your Terms, Warranties, or Policies. I'll act as your shield and guide your strategy.
          </p>
        </motion.div>

        <AIStateVisualizer state={state} intensity={0.7} />

        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMicClick}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
              isRecording 
                ? "bg-red-500 shadow-red-500/20 ring-4 ring-red-500/10" 
                : "bg-gradient-to-tr from-blue-500 to-blue-600 shadow-blue-500/20"
            )}
          >
            <Mic size={32} className={isRecording ? "animate-pulse" : ""} />
          </motion.button>
          <span className="text-xs font-medium tracking-widest uppercase text-slate-500">
            {isRecording ? "Listening..." : "Speak to Consult"}
          </span>
        </div>
      </div>

      <div className="w-full max-w-6xl z-20 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Document Workspace</h3>
            <p className="text-slate-500 text-sm mt-1">Manage warranties, T&Cs, and policies.</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setShowUploader(true)}
              className="px-6 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition-all flex items-center gap-2"
            >
              <ImageIcon size={18} />
              Analyze Proof
            </button>
            <button 
              onClick={() => setShowPolicyUpload(true)}
              className="px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <FileText size={18} className="text-purple-400" />
              Add Doc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <motion.div 
              key={policy.id}
              whileHover={{ y: -5 }}
              className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all flex flex-col justify-between min-h-[220px]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {policy.imageUrl ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-800 ring-4 ring-slate-900/50">
                      <img src={policy.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                      <FileText size={24} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg text-white leading-tight">{policy.title}</h4>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1 italic">Knowledge Base Active</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActivePolicy(policy)}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:border-blue-500/50 transition-all"
                >
                  <FileText size={16} /> Consult
                </button>
                <button 
                  onClick={() => setActiveVoicePolicy(policy)}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-600 rounded-2xl text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Mic size={16} /> Voice
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl mt-16 mb-24 z-20 space-y-8">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          Active Consultations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claims.map((claim) => (
            <motion.div 
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-slate-800/30 p-6 rounded-[2rem] backdrop-blur-md"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    claim.status === 'ANALYZED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-blue-500 animate-pulse"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {claim.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-bold">{new Date(claim.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                {claim.advice || "Processing legal and document context..."}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="w-full max-w-6xl flex justify-between items-center py-8 text-[10px] text-slate-600 font-bold tracking-widest uppercase z-20 border-t border-slate-900">
        <div>OpenClaw AI • High Precision Analysis</div>
        <div>Model: Qwen 2.5 • Vision: {process.env.VISION_MODEL || 'Moondream'}</div>
      </footer>

      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl"
            >
              <DamageUpload onUploadSuccess={() => setShowUploader(false)} />
              <button 
                onClick={() => setShowUploader(false)}
                className="mt-4 text-slate-500 hover:text-white transition-colors w-full text-center text-sm font-medium"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPolicyUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl"
            >
              <h2 className="text-xl font-bold mb-4 tracking-tight">Index Document</h2>
              <p className="text-sm text-slate-400 mb-6">Upload a Warranty PDF, T&C, or Policy to begin analysis.</p>
              
              <input 
                type="text" 
                placeholder="Document Title (e.g. iPhone Warranty)" 
                className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                id="policy-title"
              />

              <button 
                onClick={() => document.getElementById('policy-image')?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-700 rounded-2xl mb-6 flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all overflow-hidden"
              >
                <div id="image-preview" className="flex flex-col items-center text-slate-500">
                  <ImageIcon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Thumbnails</span>
                </div>
              </button>

              <input 
                type="file" 
                id="policy-image" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      const container = document.getElementById('image-preview');
                      if (container) container.innerHTML = `<img src="${re.target?.result}" class="h-full w-full object-cover" />`;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <input 
                type="file" 
                accept="application/pdf"
                className="w-full mb-8 text-xs text-slate-500 font-medium"
                id="policy-file"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPolicyUpload(false)}
                  className="flex-1 py-3.5 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    const title = (document.getElementById('policy-title') as HTMLInputElement).value;
                    const file = (document.getElementById('policy-file') as HTMLInputElement).files?.[0];
                    const imageFile = (document.getElementById('policy-image') as HTMLInputElement).files?.[0];

                    if (!title || !file) return showApiError(null, 'Title and PDF required.');

                    const getBase64 = (f: File): Promise<string> => new Promise((res, rej) => {
                      const r = new FileReader();
                      r.readAsDataURL(f);
                      r.onload = () => res((r.result as string).split(',')[1]);
                      r.onerror = e => rej(e);
                    });

                    try {
                      const pdfBase64 = await getBase64(file);
                      let imageBase64 = null;
                      if (imageFile) imageBase64 = await getBase64(imageFile);

                      await axios.post('http://localhost:4000/api/policies/upload', { title, pdfBase64, imageBase64 });
                      showApiSuccess('Document indexed!');
                      setShowPolicyUpload(false);
                      fetchPolicies();
                    } catch (error) {
                      showApiError(error);
                    }
                  }}
                  className="flex-1 py-3.5 bg-blue-600 rounded-xl font-bold text-sm text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                  Index Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <PolicyDoubts 
                policyId={activePolicy.id} 
                policyTitle={activePolicy.title} 
                onClose={() => setActivePolicy(null)} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceOverlay 
        isOpen={!!activeVoicePolicy} 
        policyId={activeVoicePolicy?.id || ''} 
        policyTitle={activeVoicePolicy?.title || ''} 
        onClose={() => setActiveVoicePolicy(null)} 
      />
    </main>
  );
}
