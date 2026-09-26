import { Router } from 'express';
import { getStudentAnalytics } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/student', getStudentAnalytics);

export default router;
