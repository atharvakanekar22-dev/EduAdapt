import { Router } from 'express';
import { sendMessage } from '../controllers/tutor.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.post('/message', sendMessage);

export default router;
