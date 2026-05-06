'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-card border border-border rounded-2xl m-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            We've encountered an unexpected error. Our team has been notified.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCcw size={18} />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
