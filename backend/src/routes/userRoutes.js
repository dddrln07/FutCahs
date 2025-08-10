import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { userController } from '../controllers/userController.js';

const router = Router();

router.get('/me', authenticate, userController.me);

export default router;