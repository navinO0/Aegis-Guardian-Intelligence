import type { Request, Response, NextFunction } from 'express';
import { PdfService } from '../services/pdf.service.js';
import { policyQueue } from '../workers/queue.config.js';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { PolicyService } from '../services/policy.service.js';
import { OllamaProvider } from '../providers/ollama.js';

const prisma = new PrismaClient();
const pdfService = new PdfService();
const policyService = new PolicyService();
const ai = new OllamaProvider();

export const uploadPolicy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, pdfBase64, imageBase64, workspaceId } = req.body;

    if (!title) throw new AppError('Document title is required', 400);
    if (!pdfBase64) throw new AppError('PDF content is required', 400);

    const buffer = Buffer.from(pdfBase64, 'base64');
    const text = await pdfService.extractText(buffer);
    const chunks = pdfService.chunkText(text);

    const policy = await prisma.policy.create({
      data: {
        title,
        content: text,
        imageUrl: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
        workspaceId: workspaceId || null
      }
    });

    await policyQueue.add(`index-${policy.id}`, {
      policyId: policy.id,
      chunks
    });

    res.status(201).json({ 
      success: true, 
      id: policy.id, 
      chunks: chunks.length 
    });
  } catch (error) {
    next(error);
  }
};

export const listPolicies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policies = await prisma.policy.findMany({
      select: { id: true, title: true, imageUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(policies);
  } catch (error) {
    next(error);
  }
};

export const askDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policyId = req.params.id as string;
    const { question, imageBase64 } = req.body;

    if (!question) throw new AppError('Question is required', 400);

    const chunks = await policyService.searchPolicySpecific(policyId, question);
    const context = chunks.map(c => c.content).join('\n\n');

    const history = await policyService.getDoubts(policyId);
    const recentHistory = history.slice(-5).map((d: any, idx: number) => {
      let step = `Turn ${idx + 1}:\nUser: ${d.question}`;
      if (d.imageUrl) step += ` [Image provided]`;
      step += `\nAdvisor: ${d.answer}`;
      return step;
    }).join('\n\n');

    const historyImages = history.slice(-5)
      .filter((d: any) => d.imageUrl && d.imageUrl.startsWith('data:image'))
      .map((d: any) => Buffer.from(d.imageUrl.split(',')[1], 'base64'));
    
    const allImages: Buffer[] = [...historyImages];
    if (imageBase64) allImages.push(Buffer.from(imageBase64, 'base64'));

    const prompt = `
      You are the "Aegis Guardian", a premium AI expert in document transparency, warranties, and insurance advocacy.
      Your goal is to provide clarity and shield the user from unfair terms or coverage gaps.

      CONTEXT:
      ${context}

      HISTORY:
      ${recentHistory || 'None'}
      
      INPUT:
      ${question}

      GUIDELINES:
      1. ANALYZE AND EXPLAIN: Provide elegant, detailed explanations. No one-word answers.
      2. DETAIL: Analysis must be 2-3 sentences.
      3. NO REPETITION: Don't repeat previous analysis.
      4. GUIDANCE: Provide a clear "Aegis Strategy" for claims or rights.
      5. PRESCRIPTIVE: List exact documents, evidence, or photos needed.
      6. FORMAT: 
         - **Aegis Analysis**
         - **🛡️ Aegis Strategy**
         - **❓ Required Information**
    `;

    let answer;
    let finalImageUrl = null;

    if (allImages.length > 0) {
      answer = await ai.analyzeImage(allImages, prompt);
      if (imageBase64) {
        const optimized = await ai.imageService.optimizeForAi(Buffer.from(imageBase64, 'base64'));
        finalImageUrl = `data:image/png;base64,${optimized.toString('base64')}`;
      }
    } else {
      answer = await ai.generateText(prompt);
    }

    const doubt = await policyService.storeDoubt(policyId, question, answer, finalImageUrl || undefined);
    res.json(doubt);
  } catch (error) {
    next(error);
  }
};

export const getDoubts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policyId = req.params.id as string;
    const doubts = await policyService.getDoubts(policyId);
    res.json(doubts);
  } catch (error) {
    next(error);
  }
};

export const updatePolicyImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policyId = req.params.id as string;
    const { imageBase64 } = req.body;

    if (!imageBase64) throw new AppError('Image data is required', 400);

    const policy = await prisma.policy.update({
      where: { id: policyId },
      data: { imageUrl: `data:image/png;base64,${imageBase64}` }
    });

    res.json(policy);
  } catch (error) {
    next(error);
  }
};
