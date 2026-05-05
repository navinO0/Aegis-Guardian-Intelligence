'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Layout, Trash2, ChevronRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import CreateWorkspaceModal from './CreateWorkspaceModal';

export default function WorkspaceSidebar() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string;

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/workspaces');
      setWorkspaces(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchWorkspaces();
    const interval = setInterval(fetchWorkspaces, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <motion.div 
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="h-screen bg-background/80 backdrop-blur-xl border-r border-border flex flex-col z-30 transition-all duration-500 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20" />
               <h2 className="font-bold text-lg tracking-tight text-foreground">Workspaces</h2>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
          >
            <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={20} />
          </button>
        </div>

        <div className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar pt-4">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => router.push(`/workspace/${ws.id}`)}
              className={cn(
                "w-full group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
                activeId === ws.id 
                  ? "bg-primary/10 border border-primary/20 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                activeId === ws.id ? "bg-primary shadow-lg shadow-primary/20 text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"
              )}>
                <Briefcase size={18} />
              </div>
              {!isCollapsed && (
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold truncate">{ws.name}</p>
                  <p className="text-[10px] opacity-50 font-medium">{ws._count?.policies || 0} Documents</p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full bg-card border border-border text-foreground p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted hover:border-primary/30 transition-all shadow-xl",
              isCollapsed && "px-0"
            )}
          >
            <Plus size={20} className="text-primary" />
            {!isCollapsed && "New Workspace"}
          </button>
        </div>
      </motion.div>

      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchWorkspaces}
      />
    </>
  );
}
