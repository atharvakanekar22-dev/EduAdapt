import { Request, Response } from 'express';
import { MasteryRecord, StudentLearningProfile, Recommendation } from '../models/intelligence.model';
import { RevisionItem, LearningSession } from '../models/learning.model';

export const getStudentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;

    // Only fetch topic-level mastery
    const mastery = await MasteryRecord.find({ 
      student: studentId, 
      learningObjective: { $exists: false } 
    }).populate('topic');
    const profile = await StudentLearningProfile.findOne({ student: studentId });
    const revisions = await RevisionItem.find({ student: studentId, status: 'PENDING' }).populate('topic');
    const recentSessions = await LearningSession.find({ student: studentId })
      .sort({ startTime: -1 })
      .limit(5)
      .populate('topic');
    
    const activeRecommendation = await Recommendation.findOne({ student: studentId, isActive: true }).populate('recommendedTopic');
      
    res.status(200).json({ mastery, profile, revisions, recentSessions, activeRecommendation });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
