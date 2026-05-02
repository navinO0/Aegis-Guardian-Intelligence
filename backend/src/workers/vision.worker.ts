import { Worker, Job } from 'bullmq';
import { connection } from './queue.config.js';
import { OllamaProvider } from '../providers/ollama.js';
import { PolicyService } from '../services/policy.service.js';
import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const ai = new OllamaProvider();
const policyService = new PolicyService();
const prisma = new PrismaClient();

export const visionWorker = new Worker(
  'vision-analysis',
  async (job: Job) => {
    const { claimId, imageBuffer, prompt } = job.data;
    logger.info(`Analyzing damage for claim ${claimId}`);

    try {
      // 1. Vision Analysis
      const analysis = await ai.analyzeImage(Buffer.from(imageBuffer), prompt);
      
      // 2. RAG - Find relevant policy coverage
      const coverageChunks = await policyService.searchRelatedPolicies(analysis);
      const policyContext = coverageChunks.map(c => c.content).join('\n\n');

      // 3. Generate Advocacy Advice
      const advicePrompt = `
        As an empathic insurance advocate, review this damage analysis and the user's policy.
        
        DAMAGE ANALYSIS:
        ${analysis}
        
        RELEVANT POLICY TEXT:
        ${policyContext}
        
        TASK:
        1. Summarize the damage in friendly terms.
        2. Identify if the policy covers this (be an advocate, find ways to help).
        3. Provide clear next steps for the user.
      `;
      
      const advice = await ai.generateText(advicePrompt);

      // 4. Update Claim Record
      await prisma.claim.update({
        where: { id: claimId },
        data: {
          analysis: analysis,
          advice: advice,
          status: 'ANALYZED'
        }
      });

      logger.info(`Claim ${claimId} analyzed and advice generated.`);
    } catch (error) {
      logger.error(`Vision analysis failed for claim ${claimId}: ${error}`);
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: 'FAILED' }
      });
    }
  },
  { connection }
);
