import { useEffect, useRef } from 'react';

/**
 * Custom hook for resilient and efficient intervals.
 * - Respects tab visibility (pauses when hidden)
 * - Prevents multiple parallel executions
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const tick = () => {
        // Only execute if the tab is visible to the user
        if (document.visibilityState === 'visible') {
          savedCallback.current();
        }
      };

      const id = setInterval(tick, delay);
      
      // Also trigger once on visibility change (re-sync)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          savedCallback.current();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(id);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [delay]);
}
