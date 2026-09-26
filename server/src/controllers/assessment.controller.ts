import { Request, Response } from 'express';
import { Assessment, AssessmentAttempt, Answer, Question } from '../models/assessment.model';
import { IntelligenceService } from '../services/intelligence.service';
import { AdaptiveService } from '../services/adaptive.service';

export const getAssessments = async (req: Request, res: Response): Promise<void> => {
  try {
    const assessments = await Assessment.find().populate('subject');
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAssessmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate('questions');
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    // Don't send correct answers to the client during the test
    const sanitizedQuestions = (assessment as any).questions.map((q: any) => ({
      _id: q._id,
      content: q.content,
      options: q.options,
      type: q.type,
      difficulty: q.difficulty
    }));
    
    res.status(200).json({ ...assessment.toObject(), questions: sanitizedQuestions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitAssessment = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { assessmentId } = req.params;
    const { answers } = req.body; // Array of { questionId, studentAnswer, timeSpent }

    const assessment = await Assessment.findById(assessmentId).populate('questions');
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    const attempt = new AssessmentAttempt({
      student: studentId,
      assessment: assessmentId,
      completedAt: new Date()
    });

    let correctCount = 0;
    const processedAnswers = await Promise.all(answers.map(async (ans: any) => {
      const question = await Question.findById(ans.questionId);
      const isCorrect = question?.correctAnswer === ans.studentAnswer;
      if (isCorrect) correctCount++;

      await new Answer({
        attempt: attempt._id,
        question: ans.questionId,
        studentAnswer: ans.studentAnswer,
        isCorrect,
        timeSpent: ans.timeSpent || 0
      }).save();

      return { ...ans, isCorrect }; // Pass isCorrect down to IntelligenceService
    }));

    attempt.score = (correctCount / (assessment as any).questions.length) * 100;
    await attempt.save();

    // Trigger the Knowledge Gap Engine and Mastery Engine
    await IntelligenceService.updateMasteryFromAssessment(studentId, processedAnswers);

    // Regenerate Recommendation and Learning Path
    await AdaptiveService.updateLearningPath(studentId, assessment.subject.toString());

    res.status(200).json({ attemptId: attempt._id, score: attempt.score });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
