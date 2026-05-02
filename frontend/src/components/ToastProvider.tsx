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
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid rgba(148, 163, 184, 0.15)',
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
            primary: '#34d399',
            secondary: '#0f172a',
          },
          style: {
            borderColor: 'rgba(52, 211, 153, 0.2)',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#f87171',
            secondary: '#0f172a',
          },
          style: {
            borderColor: 'rgba(248, 113, 113, 0.2)',
          },
        },
      }}
    />
  );
}
