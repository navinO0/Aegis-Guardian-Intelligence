'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Layout, Trash2, ChevronRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const CreateWorkspaceModal = dynamic(() => import('./CreateWorkspaceModal'), { ssr: false });

import { useInterval } from '@/hooks/useInterval';

import { toast } from 'react-hot-toast';

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

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace and all its contents?')) return;
    
    try {
      await axios.delete(`http://localhost:4000/api/workspaces/${id}`);
      toast.success('Workspace secure-deleted');
      fetchWorkspaces();
      if (activeId === id) {
        router.push('/');
      }
    } catch (err) {
      toast.error('Failed to delete workspace');
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Background refresh every minute (only when tab is visible)
  useInterval(() => {
    fetchWorkspaces();
  }, 60000);

  return (
    <>
      <motion.div 
        animate={{ width: isCollapsed ? 70 : 260 }}
        className="h-screen bg-card border-r border-border flex flex-col z-30 transition-all duration-500 overflow-hidden"
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          {!isCollapsed && (
            <h2 className="font-bold text-sm tracking-widest text-muted-foreground uppercase ml-2">Workspaces</h2>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors mx-auto"
          >
            <ChevronRight className={cn("transition-transform duration-500", !isCollapsed && "rotate-180")} size={16} />
          </button>
        </div>

        <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pt-4">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => router.push(`/workspace/${ws.id}`)}
              className={cn(
                "w-full group flex items-center justify-between p-2.5 rounded-lg transition-all",
                activeId === ws.id 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-all",
                  activeId === ws.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                )}>
                  <Briefcase size={14} />
                </div>
                {!isCollapsed && (
                  <div className="text-left overflow-hidden">
                    <p className="text-sm font-semibold truncate">{ws.name}</p>
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <button
                  onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-all"
                  title="Delete Workspace"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "w-full bg-primary text-primary-foreground p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm",
              isCollapsed && "aspect-square p-0"
            )}
          >
            <Plus size={16} />
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
