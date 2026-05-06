import { Router } from 'express';
import { 
  listProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider,
  activateProvider
} from '../controllers/provider.controller.js';

const router = Router();

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: List all configured AI providers (Gemini, Ollama, etc.)
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: List of providers
 *   post:
 *     summary: Configuration a new AI provider
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               baseUrl:
 *                 type: string
 *               apiKey:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Provider created
 */
router.get('/', listProviders);
router.post('/', createProvider);

/**
 * @swagger
 * /api/providers/{id}:
 *   put:
 *     summary: Update provider configuration
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseUrl:
 *                 type: string
 *               apiKey:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider updated
 *   delete:
 *     summary: Remove an AI provider configuration
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Provider removed
 */
router.put('/:id', updateProvider);
router.delete('/:id', deleteProvider);

/**
 * @swagger
 * /api/providers/{id}/activate:
 *   post:
 *     summary: Set a provider as the primary active intelligence source
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider activated
 */
router.post('/:id/activate', activateProvider);

export default router;
