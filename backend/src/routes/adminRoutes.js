import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { adminController } from '../controllers/adminController.js';

const router = Router();

router.get('/users', authenticate, requireAdmin, adminController.listUsers);
router.get('/matches', authenticate, requireAdmin, adminController.listMatches);
router.post('/quiz', authenticate, requireAdmin, adminController.addQuizQuestion);
router.get('/fee', authenticate, requireAdmin, adminController.getFee);
router.post('/fee', authenticate, requireAdmin, adminController.setFee);

export default router;