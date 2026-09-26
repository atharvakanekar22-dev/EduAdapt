import { Router } from 'express';
import { getLearningPath, startSession, endSession, getTopicDetails } from '../controllers/learning.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/path/:subjectId', getLearningPath);
router.get('/topic/:id', getTopicDetails);
router.post('/sessions', startSession);
router.post('/sessions/:sessionId/end', endSession);

export default router;
