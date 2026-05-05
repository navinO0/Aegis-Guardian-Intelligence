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
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(12px)',
          maxWidth: '420px',
        },
        success: {
          iconTheme: {
            primary: 'var(--primary)',
            secondary: 'var(--primary-foreground)',
          },
          style: {
            borderColor: 'var(--primary)',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#f87171',
            secondary: 'var(--card)',
          },
          style: {
            borderColor: 'rgba(248, 113, 113, 0.2)',
          },
        },
      }}
    />
  );
}
