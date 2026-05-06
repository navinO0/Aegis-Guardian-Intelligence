import { Router } from 'express';
import { 
  createWorkspace, 
  listWorkspaces, 
  getWorkspace, 
  deleteWorkspace, 
  askWorkspace,
  getWorkspaceSummary
} from '../controllers/workspace.controller.js';

const router = Router();

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 *   get:
 *     summary: List all workspaces
 *     tags: [Workspaces]
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.post('/', createWorkspace);
router.get('/', listWorkspaces);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get workspace details
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace details
 *   delete:
 *     summary: Delete a workspace
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Workspace deleted
 */
router.get('/:id', getWorkspace);
router.delete('/:id', deleteWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}/summary:
 *   get:
 *     summary: Get or generate workspace intelligence summary
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: string
 *         description: Pass 'true' to force a fresh AI generation
 *     responses:
 *       200:
 *         description: Summary content
 */
router.get('/:id/summary', getWorkspaceSummary);

/**
 * @swagger
 * /api/workspaces/{id}/ask:
 *   post:
 *     summary: Chat with workspace documents (RAG)
 *     tags: [Workspaces]
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
 *               imageBase64:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/:id/ask', askWorkspace);

export default router;
