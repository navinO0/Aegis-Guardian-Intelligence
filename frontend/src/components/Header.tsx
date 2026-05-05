'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Shield, 
  Settings, 
  Home, 
  Layers, 
  Cpu, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const isHome = pathname === '/';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'AI Providers', path: '/settings/providers', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border px-6 py-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform" />
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-foreground group-hover:text-primary transition-colors">
            Aegis
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-2 bg-muted/50 border border-border p-1.5 rounded-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={16} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/settings/providers')}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              pathname === '/settings/providers'
                ? "bg-primary border-primary/50 text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings size={20} />
          </button>
          
          <button 
            className="md:hidden p-3 bg-muted border border-border rounded-2xl text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-background/95 border-b border-border mt-4 -mx-6 px-6 pb-6"
          >
            <div className="flex flex-col gap-3 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl font-bold text-left transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                        : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={20} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
