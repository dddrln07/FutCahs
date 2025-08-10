import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { paymentController } from '../controllers/paymentController.js';

const router = Router();

router.post('/checkout-session', authenticate, paymentController.createCheckoutSession);
router.post('/confirm', authenticate, paymentController.confirmCredit);

export default router;