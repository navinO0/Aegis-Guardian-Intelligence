import { PrismaClient } from '@prisma/client';
import { OllamaProvider } from '../providers/ollama.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();
const ai = new OllamaProvider();

export class PolicyService {
  /**
   * Performs semantic search across policy chunks using cosine distance
   */
  async searchRelatedPolicies(query: string, limit: number = 3) {
    try {
      const embedding = await ai.generateEmbedding(query);
      const vectorString = `[${embedding.join(',')}]`;

      const results: any[] = await prisma.$queryRawUnsafe(
        `SELECT "content", 1 - ("embedding" <=> $1::vector) as similarity
         FROM "PolicyChunk"
         ORDER BY "embedding" <=> $1::vector
         LIMIT $2`,
        vectorString,
        limit
      );

      return results;
    } catch (error) {
      logger.error(`Error searching policies: ${error}`);
      return [];
    }
  }

  /**
   * Performs semantic search limited to a specific policy
   */
  async searchPolicySpecific(policyId: string, query: string, limit: number = 5) {
    try {
      const embedding = await ai.generateEmbedding(query);
      const vectorString = `[${embedding.join(',')}]`;

      const results: any[] = await prisma.$queryRawUnsafe(
        `SELECT "content", 1 - ("embedding" <=> $1::vector) as similarity
         FROM "PolicyChunk"
         WHERE "policyId" = $2
         ORDER BY "embedding" <=> $1::vector
         LIMIT $3`,
        vectorString,
        policyId,
        limit
      );

      return results;
    } catch (error) {
      logger.error(`Error searching specific policy ${policyId}: ${error}`);
      return [];
    }
  }

  async storeDoubt(policyId: string, question: string, answer: string, imageUrl?: string) {
    return prisma.policyDoubt.create({
      data: { policyId, question, answer, imageUrl }
    });
  }

  async getDoubts(policyId: string) {
    return prisma.policyDoubt.findMany({
      where: { policyId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
