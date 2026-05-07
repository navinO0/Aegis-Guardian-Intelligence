import pino from 'pino';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

const isLoggingEnabled = process.env.ENABLE_LOGS === 'true';

// Ensure logs directory exists relative to backend
const logDir = path.join(process.cwd(), '../infrastructure/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Multi-stream configuration for pino (Console + File)
const streams = [
  { 
    level: 'info', 
    stream: (pino as any).transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    })
  },
  { 
    level: 'info', 
    stream: (pino as any).destination({
      dest: path.join(logDir, 'backend.log'),
      sync: true
    })
  }
];

export const logger = pino(
  { level: isLoggingEnabled ? 'info' : 'silent' },
  (pino as any).multistream(streams)
);
