'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useVoiceAgent = (backendUrl: string = 'http://localhost:4000') => {
  const [state, setState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    socketRef.current = io(backendUrl);
    synthesisRef.current = window.speechSynthesis;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        if (event.results[0].isFinal) {
          socketRef.current?.emit('message', transcript);
          stopRecording();
        }
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
    }

    socketRef.current.on('agent-state', (newState: any) => setState(newState));
    socketRef.current.on('agent-msg', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
      speak(msg);
    });

    return () => {
      socketRef.current?.disconnect();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, [backendUrl]);

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthesisRef.current.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    synthesisRef.current.speak(utterance);
  };

  const sendTextMessage = (text: string) => socketRef.current?.emit('message', text);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {}
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return { state, isRecording, messages, startRecording, stopRecording, sendTextMessage, speak };
};
