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
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Consultation</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{policyTitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
        <AnimatePresence mode='popLayout'>
          {isFetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-xs font-bold uppercase tracking-widest">Inking records...</p>
            </div>
          ) : doubts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <History size={32} />
              </div>
              <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                Awaiting your consultation on <br /><span className="text-primary font-bold">{policyTitle}</span>.
              </p>
            </div>
          ) : (
            doubts.map((doubt) => (
              <motion.div key={doubt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl max-w-[80%] shadow-sm">
                    <p className="text-sm font-medium text-foreground">{doubt.question}</p>
                    {doubt.imageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border shadow-sm">
                        <img src={doubt.imageUrl} className="max-w-full h-auto max-h-48 object-cover" alt="Context" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-card border border-border p-5 rounded-xl max-w-[90%] relative shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aegis Intelligence</span>
                    </div>
                    <div className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => <div className="my-4 overflow-x-auto rounded-lg border border-border bg-muted/50"><table className="min-w-full divide-y divide-border" {...props} /></div>,
                          thead: ({node, ...props}) => <thead className="bg-muted" {...props} />,
                          th: ({node, ...props}) => <th className="px-4 py-2 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-2 text-xs text-foreground border-t border-border" {...props} />,
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

      <form id="chat-form" onSubmit={handleAsk} className="p-4 border-t border-border bg-card/80 backdrop-blur-xl">
        {imageBase64 && (
          <div className="mb-3 relative inline-block">
            <img src={`data:image/png;base64,${imageBase64}`} className="h-16 w-16 object-cover rounded-lg border-2 border-primary shadow-lg" alt="Preview" />
            <button type="button" onClick={() => setImageBase64(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90 transition-all"><X size={10} /></button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button type="button" onClick={() => document.getElementById('chat-image-upload')?.click()} className={cn("p-4 rounded-xl border h-[52px] w-[52px] flex items-center justify-center transition-all", imageBase64 ? "bg-primary/20 border-primary shadow-sm text-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground")}>
            <ImageIcon size={20} />
          </button>
          
          <button type="button" onClick={handleVoiceClick} className={cn("p-4 rounded-xl border h-[52px] w-[52px] flex items-center justify-center transition-all", isRecording ? "bg-destructive/10 border-destructive text-destructive animate-pulse" : "bg-muted border-border text-muted-foreground hover:text-foreground")}>
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input type="file" id="chat-image-upload" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about your coverage..."
              className="w-full bg-muted border border-border p-3.5 pr-12 rounded-xl focus:ring-1 focus:ring-primary/20 outline-none text-foreground text-sm font-medium transition-all"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || (!question.trim() && !imageBase64)} className={cn("absolute right-1.5 top-1.5 p-2 rounded-lg transition-all", (question.trim() || imageBase64) && !isLoading ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground/30")}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
