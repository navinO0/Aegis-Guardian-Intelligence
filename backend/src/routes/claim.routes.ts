import { Router } from 'express';
import { createClaim, getClaimStatus, listClaims } from '../controllers/claim.controller.js';

const router = Router();

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Initiate a new insurance claim analysis
 *     tags: [Claims]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               imageBase64:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Claim initiation started
 *   get:
 *     summary: List all initiated claim analyses
 *     tags: [Claims]
 *     responses:
 *       200:
 *         description: List of claims
 */
router.post('/', createClaim);
router.get('/', listClaims);

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Get details and AI advice for a specific claim
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim details and advocacy advice
 */
router.get('/:id', getClaimStatus);

export default router;
