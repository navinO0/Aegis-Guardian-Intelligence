import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Global Express error-handling middleware.
 *
 * In LOCAL / development mode (`NODE_ENV=local`) the full error object
 * is returned to the caller — message, stack trace, and name — so devs
 * can debug without checking server logs.
 *
 * In production only a sanitised message is returned.
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isLocal = process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development';

  // Always log to server
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
  });

  // Build response payload
  const payload: Record<string, unknown> = {
    success: false,
    error: err.message || 'Internal Server Error',
  };

  if (isLocal) {
    payload.stack = err.stack;
    payload.name = err.name;
    // If the original error wraps a cause, surface it too
    if ((err as any).cause) {
      payload.cause = String((err as any).cause);
    }
  }

  res.status(statusCode).json(payload);
};
