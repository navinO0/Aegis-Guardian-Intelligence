import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

/**
 * Extracts a human-readable error message from an Axios error.
 * Prefers the backend's `error` field, falls back to status text or generic message.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }

  const axiosErr = error as AxiosError<{ error?: string; message?: string }>;

  // Server responded with an error payload
  if (axiosErr.response?.data) {
    const data = axiosErr.response.data;
    return data.error || data.message || `Request failed with status ${axiosErr.response.status}`;
  }

  // Network / timeout error  — no response from server
  if (axiosErr.request) {
    return 'Unable to reach the server. Please check your connection.';
  }

  return axiosErr.message || 'An unexpected error occurred';
}

/**
 * Shows an error toast with the API error message.
 * In development mode (when the backend returns a stack), it logs
 * the full payload to the browser console for easy debugging.
 */
export function showApiError(error: unknown, fallbackMessage?: string) {
  const message = fallbackMessage || getApiErrorMessage(error);
  toast.error(message);

  // Log full backend error details in console for devs
  if (axios.isAxiosError(error) && error.response?.data) {
    console.error('[API Error]', error.response.data);
  }
}

/**
 * Shows a success toast.
 */
export function showApiSuccess(message: string) {
  toast.success(message);
}
