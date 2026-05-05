import type { Request, Response, NextFunction } from 'express';
import { visionQueue } from '../workers/queue.config.js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const prisma = new PrismaClient();

export const createClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, description, imageBase64, workspaceId } = req.body;

    if (!userId || !description) {
      throw new AppError('userId and description are required', 400);
    }

    // Ensure the user exists (upsert) to satisfy FK constraint
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@demo.local` },
    });

    const claim = await prisma.claim.create({
      data: {
        userId,
        description,
        status: 'PENDING',
        workspaceId: workspaceId || null
      }
    });

    if (imageBase64) {
      await visionQueue.add(`analyze-${claim.id}`, {
        claimId: claim.id,
        imageBuffer: Buffer.from(imageBase64, 'base64'),
        prompt: `Analyze the insurance claim damage for: ${description}`
      });
    }

    res.status(201).json({ success: true, claimId: claim.id });
  } catch (error) {
    next(error);
  }
};

export const getClaimStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const claim = await prisma.claim.findUnique({ where: { id } });

    if (!claim) {
      throw new AppError(`Claim with id "${id}" not found`, 404);
    }

    res.json(claim);
  } catch (error) {
    next(error);
  }
};

export const listClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = await prisma.claim.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    next(error);
  }
};
