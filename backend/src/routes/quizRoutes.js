import { Router } from 'express';
import { quizController } from '../controllers/quizController.js';

const router = Router();

router.get('/random', quizController.random);

export default router;