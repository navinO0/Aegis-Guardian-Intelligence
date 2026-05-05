'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { showApiError, showApiSuccess } from '@/lib/api-error';

interface DamageUploadProps {
  onUploadSuccess?: (id: string) => void;
  workspaceId?: string;
}

const DamageUpload: React.FC<DamageUploadProps> = ({ onUploadSuccess, workspaceId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file || !preview) return;

    setStatus('uploading');
    try {
      const base64 = preview.split(',')[1];
      const response = await axios.post('http://localhost:4000/api/claims', {
        userId: 'demo-user',
        description: 'Contextual analysis request',
        imageBase64: base64,
        workspaceId: workspaceId || null
      });

      setStatus('success');
      showApiSuccess('Context submitted for AI analysis!');
      if (onUploadSuccess) onUploadSuccess(response.data.claimId);
    } catch (error) {
      setStatus('error');
      showApiError(error);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all duration-300",
          status === 'idle' && "border-slate-700 bg-slate-900/40 hover:border-blue-500/50 hover:bg-slate-800/40",
          status === 'uploading' && "border-blue-500/50 bg-blue-500/5 cursor-wait",
          status === 'success' && "border-emerald-500/50 bg-emerald-500/5"
        )}
      >
        {preview ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
            <img src={preview} alt="Context preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={clear} className="p-2 bg-red-500 rounded-full text-white">
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center gap-4 cursor-pointer w-full py-12 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
              <Upload size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-200">Upload Visual Proof</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Image context for advisor</p>
            </div>
          </div>
        )}

        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />

        {preview && status === 'idle' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleUpload}
            className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40"
          >
            Analyze Visuals
          </motion.button>
        )}

        {status === 'uploading' && (
          <div className="mt-6 flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Loader2 size={20} className="animate-spin" />
            Vetting Proof...
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-6 flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={20} />
            Context Queued
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DamageUpload;
