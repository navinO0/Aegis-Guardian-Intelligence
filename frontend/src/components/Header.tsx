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
  X,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const isHome = pathname === '/';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'AI Providers', path: '/settings/providers', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 border-b border-border px-6 py-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-primary rounded-lg shadow-sm transition-transform group-hover:scale-105" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Aegis Intelligence
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                  isActive 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon size={14} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={() => router.push('/settings/providers')}
            className={cn(
              "p-2 rounded-lg border transition-all",
              pathname === '/settings/providers'
                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Settings"
          >
            <Settings size={18} />
          </button>
          
          <button 
            className="md:hidden p-2 bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border px-6 py-4 shadow-xl"
          >
            <div className="flex flex-col gap-2">
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
                      "flex items-center gap-4 p-4 rounded-xl font-bold text-left transition-all",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted border border-border text-muted-foreground hover:text-foreground"
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
