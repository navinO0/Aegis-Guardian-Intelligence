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
      data: { name: name as string, description: description as string }
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
    const id = req.params.id as string;
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
      where: { workspaceId: id as string },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentHistory = (history as any[]).reverse().map(h => `User: ${h.question}\nShadow: ${h.answer}`).join('\n\n');

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
        workspaceId: id as string,
        question: question as string,
        answer: answer as string,
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
    const id = req.params.id as string;
    const refresh = req.query.refresh as string; // Allow forcing a refresh

    const workspace: any = await prisma.workspace.findUnique({
      where: { id },
      include: { policies: true }
    });

    if (!workspace) throw new AppError('Workspace not found', 404);

    // If summary exists and we aren't forcing a refresh, return cached version
    if (workspace.summary && refresh !== 'true') {
      logger.info({ workspaceId: id }, '📦 Returning cached workspace summary');
      return res.json({ summary: workspace.summary, cached: true });
    }

    if (workspace.policies.length === 0) {
      return res.json({ summary: null, message: 'No documents to summarize' });
    }

    logger.info({ workspaceId: id }, '🧠 Generating fresh workspace summary');
    const allContent = workspace.policies.map(p => `--- ${p.title} ---\n${p.content}`).join('\n\n');
    
    const prompt = `
      You are the "Aegis Intelligence Architect".
      Summarize the following insurance Knowledge Base into a premium, executive intelligence overview.
      Structure the output into:
      1. **Strategic Summary**: A high-level view of the protection landscape.
      2. **Risk & Coverage Gaps**: Identify what is NOT covered.
      3. **Critical Clauses**: Highlight terms that favor the user.
      4. **Action Roadmap**: Next 3 steps for the user.

      DOCUMENTS CONTENT:
      ${allContent.substring(0, 15000)}
    `;

    const summary = await aiProvider.generateText(prompt);

    // Cache the summary in DB
    await prisma.workspace.update({
      where: { id: id as string },
      data: { 
        summary,
        summaryUpdatedAt: new Date()
      } as any
    });

    res.json({ summary, cached: false });
  } catch (error) {
    next(error);
  }
};
