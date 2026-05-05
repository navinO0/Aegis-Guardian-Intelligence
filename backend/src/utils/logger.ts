import pino from 'pino';
import pinoPretty from 'pino-pretty';

import dotenv from 'dotenv';
dotenv.config();

const isLoggingEnabled = process.env.ENABLE_LOGS === 'true';

export const logger = pino({
  level: isLoggingEnabled ? 'info' : 'silent',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});
