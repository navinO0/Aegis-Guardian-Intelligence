import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiProvider } from '../providers/manager.js';
import { AppError } from '../utils/AppError.js';

const prisma = new PrismaClient();

export const listProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await prisma.aiProvider.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(providers);
  } catch (error) {
    next(error);
  }
};

export const createProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, baseUrl, apiKey, model, config } = req.body;
    
    if (!name || !type || !model) {
      throw new AppError('Name, type, and model are required', 400);
    }

    const provider = await prisma.aiProvider.create({
      data: { name, type, baseUrl, apiKey, model, config }
    });

    res.status(201).json(provider);
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, type, baseUrl, apiKey, model, config, isActive } = req.body;

    // If making this provider active, deactivate all others first (optional, but usually one active ai at a time)
    if (isActive) {
      await prisma.aiProvider.updateMany({
        where: { id: { not: id } },
        data: { isActive: false }
      });
    }

    const provider = await prisma.aiProvider.update({
      where: { id },
      data: { name, type, baseUrl, apiKey, model, config, isActive }
    });

    // If the active provider changed, reload the manager
    if (isActive) {
      await aiProvider.reload();
    }

    res.json(provider);
  } catch (error) {
    next(error);
  }
};

export const deleteProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.aiProvider.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const activateProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Deactivate others
    await prisma.aiProvider.updateMany({
      data: { isActive: false }
    });

    const provider = await prisma.aiProvider.update({
      where: { id },
      data: { isActive: true }
    });

    await aiProvider.reload();

    res.json(provider);
  } catch (error) {
    next(error);
  }
};
