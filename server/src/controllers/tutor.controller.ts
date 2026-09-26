import { Request, Response } from 'express';
import { AIService, StudentLearningContext } from '../services/ai.service';
import { Topic, LearningObjective } from '../models/content.model';
import { Question } from '../models/assessment.model';
import { MasteryRecord, StudentLearningProfile } from '../models/intelligence.model';
import { TutorConversation, TutorMessage, TutorMode } from '../models/tutor.model';

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { topicId, objectiveId, message, tutorMode = TutorMode.SOCRATIC_CHAT, currentQuestionId, studentAnswer, allowLeakage = false, sessionId } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    let objectiveName;
    if (objectiveId) {
      const obj = await LearningObjective.findById(objectiveId);
      if (obj) objectiveName = obj.description;
    }

    // Authoritative Mastery
    const masteryQuery = objectiveId ? { student: studentId, learningObjective: objectiveId } : { student: studentId, topic: topicId };
    const mastery = await MasteryRecord.findOne(masteryQuery);

    const profile = await StudentLearningProfile.findOne({ student: studentId });
    const detectedMisconceptions = profile?.detectedMisconceptions || [];

    // Current Question for Leakage Protection / Explaining mistake
    let currentQuestionText, correctAnswer;
    if (currentQuestionId) {
      const q = await Question.findById(currentQuestionId);
      if (q) {
        currentQuestionText = q.content;
        correctAnswer = q.correctAnswer;
      }
    }

    const context: StudentLearningContext = {
      topicName: topic.name,
      objectiveName,
      masteryLevel: mastery?.level || 'UNKNOWN',
      masteryScore: mastery?.score || 0,
      detectedMisconceptions,
      currentQuestion: currentQuestionText,
      studentAnswer,
      correctAnswer,
      tutorMode,
      allowAnswerLeakage: allowLeakage
    };

    // Find or create conversation
    let conversation = await TutorConversation.findOne({
      student: studentId,
      topic: topicId,
      session: sessionId || { $exists: false }
    }).sort({ createdAt: -1 });

    if (!conversation) {
      conversation = await TutorConversation.create({
        student: studentId,
        topic: topicId,
        learningObjective: objectiveId,
        session: sessionId
      });
    }

    // Persist Student Message
    await TutorMessage.create({
      conversation: conversation._id,
      role: 'user',
      content: message,
      tutorMode
    });

    // Fetch Recent History (last 10 messages)
    const rawHistory = await TutorMessage.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10);
      
    // Exclude the message we just saved from history, otherwise it duplicates
    const chatHistory = rawHistory.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Call AI
    const responseText = await AIService.getSocraticResponse(message, context, chatHistory);

    // Persist AI Response
    await TutorMessage.create({
      conversation: conversation._id,
      role: 'model',
      content: responseText,
      tutorMode
    });

    res.status(200).json({ text: responseText, conversationId: conversation._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
