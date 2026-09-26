import { Request, Response } from 'express';
import { LearningPath, LearningPathNode, LearningSession } from '../models/learning.model';
import { Recommendation } from '../models/intelligence.model';
import { AdaptiveService } from '../services/adaptive.service';

import { Topic, LearningObjective, Prerequisite } from '../models/content.model';

export const getLearningPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { subjectId } = req.params;

    // Trigger an update to ensure it's fresh
    const path = await AdaptiveService.updateLearningPath(studentId, subjectId as string);

    const nodes = await LearningPathNode.find({ path: path._id })
      .populate('topic')
      .sort({ order: 1 });

    const activeRecommendation = await Recommendation.findOne({ 
      student: studentId, 
      isActive: true 
    }).populate('recommendedTopic');

    res.status(200).json({ path, nodes, activeRecommendation });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { topicId } = req.body;

    const session = new LearningSession({
      student: studentId,
      topic: topicId,
      startTime: new Date()
    });
    await session.save();

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const endSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { selfReportedDifficulty } = req.body;

    const session = await LearningSession.findByIdAndUpdate(
      sessionId,
      { endTime: new Date(), selfReportedDifficulty },
      { new: true }
    );

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTopicDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    const objectives = await LearningObjective.find({ topic: id });
    const prerequisites = await Prerequisite.find({ topic: id }).populate('prerequisiteTopic');
    
    res.status(200).json({ topic, objectives, prerequisites });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
