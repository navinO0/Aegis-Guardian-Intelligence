/**
 * @swagger
 * components:
 *   schemas:
 *     Workspace:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         description: { type: string }
 *     Policy:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         title: { type: string }
 *         imageUrl: { type: string }
 */

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
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Workspace created }
 *   get:
 *     summary: List all workspaces
 *     tags: [Workspaces]
 *     responses:
 *       200: { description: List of workspaces }
 *
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get workspace details
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Workspace details }
 *   delete:
 *     summary: Delete a workspace
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Workspace deleted }
 *
 * /api/workspaces/{id}/summary:
 *   get:
 *     summary: Get or generate workspace intelligence summary
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: refresh
 *         schema: { type: string }
 *     responses:
 *       200: { description: Summary content }
 *
 * /api/workspaces/{id}/ask:
 *   post:
 *     summary: Chat with workspace documents (RAG)
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question: { type: string }
 *               imageBase64: { type: string }
 *     responses:
 *       200: { description: AI response }
 */

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
 *               title: { type: string }
 *               pdfBase64: { type: string }
 *               workspaceId: { type: string }
 *     responses:
 *       201: { description: Policy upload initiated }
 *
 * /api/policies:
 *   get:
 *     summary: List all indexed policies
 *     tags: [Policies]
 *     responses:
 *       200: { description: List of policies }
 *
 * /api/policies/{id}/doubts:
 *   post:
 *     summary: Ask a specific question about a policy (Doubt)
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question: { type: string }
 *     responses:
 *       200: { description: AI answer }
 *   get:
 *     summary: Get all doubts related to a policy
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of doubts }
 *
 * /api/policies/{id}/image:
 *   patch:
 *     summary: Update policy thumbnail/image
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl: { type: string }
 *     responses:
 *       200: { description: Image updated }
 */

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
 *               description: { type: string }
 *               imageBase64: { type: string }
 *               workspaceId: { type: string }
 *     responses:
 *       201: { description: Claim initiation started }
 *   get:
 *     summary: List all initiated claim analyses
 *     tags: [Claims]
 *     responses:
 *       200: { description: List of claims }
 *
 * /api/claims/{id}:
 *   get:
 *     summary: Get details and AI advice for a specific claim
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Claim details and advocacy advice }
 */

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: List all configured AI providers (Gemini, Ollama, etc.)
 *     tags: [Providers]
 *     responses:
 *       200: { description: List of providers }
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
 *               name: { type: string }
 *               type: { type: string }
 *               baseUrl: { type: string }
 *               apiKey: { type: string }
 *               model: { type: string }
 *     responses:
 *       201: { description: Provider created }
 *
 * /api/providers/{id}:
 *   put:
 *     summary: Update provider configuration
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseUrl: { type: string }
 *               apiKey: { type: string }
 *               model: { type: string }
 *     responses:
 *       200: { description: Provider updated }
 *   delete:
 *     summary: Remove an AI provider configuration
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Provider removed }
 *
 * /api/providers/{id}/activate:
 *   post:
 *     summary: Set a provider as the primary active intelligence source
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Provider activated }
 */
