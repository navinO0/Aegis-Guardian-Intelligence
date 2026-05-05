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

router.post('/', createWorkspace);
router.get('/', listWorkspaces);
router.get('/:id', getWorkspace);
router.get('/:id/summary', getWorkspaceSummary);
router.delete('/:id', deleteWorkspace);
router.post('/:id/ask', askWorkspace);

export default router;
