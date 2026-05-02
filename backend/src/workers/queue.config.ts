import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

const connection = new (Redis as any)(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const visionQueue = new Queue('vision-analysis', { connection });
export const policyQueue = new Queue('policy-indexing', { connection });

logger.info('🐘 BullMQ Queues initialized');

export { connection };
