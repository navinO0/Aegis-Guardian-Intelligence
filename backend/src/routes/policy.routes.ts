import { Router } from 'express';
import { uploadPolicy, listPolicies, askDoubt, getDoubts, updatePolicyImage } from '../controllers/policy.controller.js';

const router = Router();

router.post('/upload', uploadPolicy);
router.get('/', listPolicies);
router.post('/:id/doubts', askDoubt);
router.get('/:id/doubts', getDoubts);
router.patch('/:id/image', updatePolicyImage);

export default router;
