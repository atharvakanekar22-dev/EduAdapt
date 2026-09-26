import { Router } from 'express';
import { getAssessments, getAssessmentById, submitAssessment } from '../controllers/assessment.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post('/:assessmentId/submit', submitAssessment);

export default router;
