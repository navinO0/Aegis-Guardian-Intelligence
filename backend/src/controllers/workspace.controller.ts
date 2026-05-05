import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { PolicyService } from '../services/policy.service.js';
import { aiProvider } from '../providers/manager.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();
const policyService = new PolicyService();
// No need to instantiate ai here, use the global aiProvider

export const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name) throw new AppError('Workspace name is required', 400);

    const workspace = await prisma.workspace.create({
      data: { name, description }
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

export const listWorkspaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { policies: true, claims: true }
        }
      }
    });
    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        policies: {
          select: { id: true, title: true, imageUrl: true, createdAt: true }
        },
        claims: {
          orderBy: { createdAt: 'desc' }
        },
        conversations: {
          orderBy: { createdAt: 'asc' },
          take: 20
        }
      }
    });

    if (!workspace) throw new AppError('Workspace not found', 404);
    res.json(workspace);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.workspace.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const askWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { question, imageBase64 } = req.body;

    if (!question) throw new AppError('Question is required', 400);

    // Search logic: Search across all policies in the workspace
    const embedding = await aiProvider.generateEmbedding(question);
    const vectorString = `[${embedding.join(',')}]`;

    const chunks: any[] = await prisma.$queryRawUnsafe(
      `SELECT pc."content", 1 - (pc."embedding" <=> $1::vector) as similarity
       FROM "PolicyChunk" pc
       JOIN "Policy" p ON pc."policyId" = p."id"
       WHERE p."workspaceId" = $2
       ORDER BY pc."embedding" <=> $1::vector
       LIMIT 10`,
      vectorString,
      id
    );

    const context = chunks.map(c => c.content).join('\n\n');

    const history = await prisma.workspaceConversation.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentHistory = history.reverse().map(h => `User: ${h.question}\nShadow: ${h.answer}`).join('\n\n');

    const prompt = `
      You are the "Aegis Guardian", a premium AI document representative.
      Your goal is to analyze the documents in this workspace and provide precise, high-end advice.
      The user is asking a question about their insurance, warranties, or legal docs.
      ${imageBase64 ? 'AN IMAGE HAS BEEN ATTACHED. ANALYZE THE IMAGE CONTENT AND CROSS-REFERENCE IT WITH THE DOCUMENTS.' : ''}

      WORKSPACE CONTEXT:
      ${context || 'No documents uploaded yet in this workspace.'}

      HISTORY:
      ${recentHistory || 'None'}
      
      INPUT:
      ${question}

      GUIDELINES:
      - Use ONLY the provided context if possible.
      - Be elegant and professional.
      - If an image is present, describe what you see and how it relates to the policy terms.
      - If details are missing, suggest what documents should be uploaded.
    `;

    let answer;
    if (imageBase64) {
      const buffer = Buffer.from(imageBase64, 'base64');
      logger.info({ sizeKB: Math.round(buffer.length / 1024) }, '📸 Processing attached image');
      answer = await aiProvider.analyzeImage([buffer], prompt);
    } else {
      answer = await aiProvider.generateText(prompt);
    }

    const conversation = await prisma.workspaceConversation.create({
      data: {
        workspaceId: id,
        question,
        answer,
        imageUrl: imageBase64 ? `data:image/png;base64,${imageBase64}` : null
      }
    });

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: { policies: true }
    });

    if (!workspace) throw new AppError('Workspace not found', 404);

    const allContent = workspace.policies.map(p => `--- ${p.title} ---\n${p.content}`).join('\n\n');
    
    const prompt = `
      You are the "Doc Representator".
      Summarize the following massive collection of documents into a human-readable high-end executive overview.
      Highlight coverage gaps, key expiration dates, and critical terms.

      DOCUMENTS CONTENT:
      ${allContent.substring(0, 10000)} // Limit to 10k chars for fast summary
    `;

    const summary = await aiProvider.generateText(prompt);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};
