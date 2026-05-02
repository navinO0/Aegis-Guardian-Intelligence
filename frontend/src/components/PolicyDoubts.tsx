'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageSquare, History, X, Image as ImageIcon, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { showApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';

interface Doubt {
  id: string;
  question: string;
  answer: string;
  imageUrl?: string;
  createdAt: string;
}

interface PolicyDoubtsProps {
  policyId: string;
  policyTitle: string;
  onClose: () => void;
}

export default function PolicyDoubts({ policyId, policyTitle, onClose }: PolicyDoubtsProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isRecording, startRecording, stopRecording, speak } = useVoiceAgent();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setQuestion(transcript);
        if (transcript.length > 5) {
          setTimeout(() => {
             const form = document.getElementById('chat-form') as HTMLFormElement;
             form?.requestSubmit();
          }, 800);
        }
      };
      recognitionRef.current.onend = () => stopRecording();
    }
  }, []);

  const handleVoiceClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      startRecording();
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/policies/${policyId}/doubts`);
      setDoubts(response.data);
    } catch (err) {
      showApiError(err, 'Failed to fetch history');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [policyId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [doubts]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => setImageBase64((re.target?.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!question.trim() && !imageBase64) || isLoading) return;

    const currentQuestion = question;
    const currentImage = imageBase64;
    
    setQuestion('');
    setImageBase64(null);
    setIsLoading(true);

    try {
      const response = await axios.post(`http://localhost:4000/api/policies/${policyId}/doubts`, {
        question: currentQuestion || "Identify coverage from this image",
        imageBase64: currentImage
      });
      setDoubts(prev => [...prev, response.data]);
      if (response.data.answer) speak(response.data.answer.replace(/[*#`_]/g, ''));
    } catch (err) {
      showApiError(err, 'Could not get an answer');
      setQuestion(currentQuestion);
      setImageBase64(currentImage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 italic">Consultation</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{policyTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#020617]/50">
        <AnimatePresence mode='popLayout'>
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-sm">Inking records...</p>
            </div>
          ) : doubts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-12">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600">
                <History size={32} />
              </div>
              <p className="text-slate-400 text-sm italic">
                Awaiting your consultation on <span className="text-blue-400 font-semibold">{policyTitle}</span>.
              </p>
            </div>
          ) : (
            doubts.map((doubt) => (
              <motion.div key={doubt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg shadow-blue-900/20">
                    <p className="text-sm font-medium">{doubt.question}</p>
                    {doubt.imageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-white/20">
                        <img src={doubt.imageUrl} className="max-w-full h-auto max-h-48 object-cover" alt="Context" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 p-5 rounded-2xl rounded-tl-none max-w-[85%] relative">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-5 h-5 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-md" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Docu-Guardian</span>
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <div className="my-4 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50"><table className="min-w-full divide-y divide-slate-700" {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-slate-800/50" {...props} />,
                          th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-3 text-xs text-slate-400 border-t border-slate-700" {...props} />,
                        }}
                      >
                        {doubt.answer}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <form id="chat-form" onSubmit={handleAsk} className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        {imageBase64 && (
          <div className="mb-3 relative inline-block">
            <img src={`data:image/png;base64,${imageBase64}`} className="h-20 w-20 object-cover rounded-xl border border-blue-500/50" alt="Preview" />
            <button type="button" onClick={() => setImageBase64(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"><X size={12} /></button>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <button type="button" onClick={() => document.getElementById('chat-image-upload')?.click()} className={cn("p-4 rounded-2xl border h-[54px] w-[54px] flex items-center justify-center transition-all", imageBase64 ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-400")}>
            <ImageIcon size={24} />
          </button>
          
          <button type="button" onClick={handleVoiceClick} className={cn("p-4 rounded-2xl border h-[54px] w-[54px] flex items-center justify-center transition-all", isRecording ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse" : "bg-slate-800 border-slate-700 text-slate-400")}>
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <input type="file" id="chat-image-upload" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Inquire about terms or proof..."
              className="w-full bg-slate-800 border border-slate-700 p-4 pr-14 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 text-sm placeholder:text-slate-600 transition-all"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || (!question.trim() && !imageBase64)} className={cn("absolute right-2 top-2 p-2 rounded-xl transition-all", (question.trim() || imageBase64) && !isLoading ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-500")}>
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
