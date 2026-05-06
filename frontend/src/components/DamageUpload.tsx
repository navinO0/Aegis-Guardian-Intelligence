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
    <div className="w-full max-w-lg mx-auto bg-card border border-border p-6 rounded-2xl shadow-xl">
      <div 
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300",
          status === 'idle' && "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          status === 'uploading' && "border-primary/50 bg-primary/5 cursor-wait",
          status === 'success' && "border-emerald-500/30 bg-emerald-500/5"
        )}
      >
        {preview ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={clear} className="p-2 bg-destructive rounded-full text-destructive-foreground">
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center gap-4 cursor-pointer w-full py-8 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Upload size={24} />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Upload Context Image</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-semibold">Visual data for AI consultation</p>
            </div>
          </div>
        )}

        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />

        {preview && status === 'idle' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleUpload}
            className="mt-6 w-full py-3 bg-primary hover:opacity-90 rounded-lg font-bold text-primary-foreground text-xs transition-all shadow-sm"
          >
            Confirm & Analyze
          </motion.button>
        )}

        {status === 'uploading' && (
          <div className="mt-6 flex items-center gap-2 text-primary font-bold text-xs">
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </div>
        )}

        {status === 'success' && (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mt-6 flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
            <CheckCircle2 size={16} />
            Success
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DamageUpload;
