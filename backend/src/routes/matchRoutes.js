import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { matchController } from '../controllers/matchController.js';

const router = Router();

router.get('/open', matchController.listOpen);
router.post('/create', authenticate, matchController.create);
router.post('/join', authenticate, matchController.join);
router.post('/finish', authenticate, matchController.finish);

export default router;