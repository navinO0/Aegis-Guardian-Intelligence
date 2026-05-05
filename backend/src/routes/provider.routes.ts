import { Router } from 'express';
import { 
  listProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider,
  activateProvider
} from '../controllers/provider.controller.js';

const router = Router();

router.get('/', listProviders);
router.post('/', createProvider);
router.put('/:id', updateProvider);
router.delete('/:id', deleteProvider);
router.post('/:id/activate', activateProvider);

export default router;
