import { Worker, Job } from 'bullmq';
import { connection } from './queue.config.js';
import { OllamaProvider } from '../providers/ollama.js';
import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const ai = new OllamaProvider();
const prisma = new PrismaClient();

export const policyWorker = new Worker(
  'policy-indexing',
  async (job: Job) => {
    const { policyId, chunks } = job.data;

    for (const chunk of chunks) {
      try {
        const embedding = await ai.generateEmbedding(chunk);
        
        if (!embedding || embedding.length !== 768) continue;

        await prisma.$executeRawUnsafe(
          `INSERT INTO "PolicyChunk" ("id", "policyId", "content", "embedding") 
           VALUES (gen_random_uuid(), $1, $2, $3::vector)`,
          policyId, chunk, `[${embedding.join(',')}]`
        );
      } catch (error) {}
    }
  },
  { connection }
);
