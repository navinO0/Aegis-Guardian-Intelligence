'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Drop-in toast provider with a premium dark-mode look.
 * Render this once in the root layout.
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 18px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '380px',
        },
        success: {
          iconTheme: {
            primary: 'var(--primary)',
            secondary: 'var(--primary-foreground)',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
