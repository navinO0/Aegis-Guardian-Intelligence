import { Router } from 'express';
import { uploadPolicy, listPolicies, askDoubt, getDoubts, updatePolicyImage } from '../controllers/policy.controller.js';

const router = Router();

/**
 * @swagger
 * /api/policies/upload:
 *   post:
 *     summary: Upload and index a new policy document (PDF)
 *     tags: [Policies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               pdfBase64:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Policy upload initiated
 */
router.post('/upload', uploadPolicy);

/**
 * @swagger
 * /api/policies:
 *   get:
 *     summary: List all indexed policies
 *     tags: [Policies]
 *     responses:
 *       200:
 *         description: List of policies
 */
router.get('/', listPolicies);

/**
 * @swagger
 * /api/policies/{id}/doubts:
 *   post:
 *     summary: Ask a specific question about a policy (Doubt)
 *     tags: [Policies]
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
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI answer to policy doubt
 *   get:
 *     summary: Get all doubts related to a policy
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doubts
 */
router.post('/:id/doubts', askDoubt);
router.get('/:id/doubts', getDoubts);

/**
 * @swagger
 * /api/policies/{id}/image:
 *   patch:
 *     summary: Update policy thumbnail/image
 *     tags: [Policies]
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
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image updated
 */
router.patch('/:id/image', updatePolicyImage);

export default router;
