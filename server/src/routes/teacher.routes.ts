import { Router } from 'express';
import { 
  getDashboard, 
  getStudents, 
  getStudentIntelligence, 
  getMisconceptions,
  createIntervention,
  applyOverride,
  createContent
} from '../controllers/teacher.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { Role } from '../models/user.model';

const router = Router();

router.use(requireAuth);
router.use(requireRole(Role.TEACHER));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.get('/students/:id', getStudentIntelligence);
router.get('/misconceptions', getMisconceptions);
router.post('/interventions', createIntervention);
router.post('/override', applyOverride);
router.post('/content', createContent);

export default router;
