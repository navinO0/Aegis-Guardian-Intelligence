import { Router } from 'express';
import { createClaim, getClaimStatus, listClaims } from '../controllers/claim.controller.js';

const router = Router();

router.post('/', createClaim);
router.get('/', listClaims);
router.get('/:id', getClaimStatus);

export default router;
