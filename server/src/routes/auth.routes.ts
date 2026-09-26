import { Router } from 'express';
import { register, login, onboarding } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/onboarding', requireAuth, onboarding);

export default router;
