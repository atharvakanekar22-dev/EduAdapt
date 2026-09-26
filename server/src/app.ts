import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import assessmentRoutes from './routes/assessment.routes';
import learningRoutes from './routes/learning.routes';
import tutorRoutes from './routes/tutor.routes';
import analyticsRoutes from './routes/analytics.routes';
import teacherRoutes from './routes/teacher.routes';

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/teacher', teacherRoutes);

export default app;
