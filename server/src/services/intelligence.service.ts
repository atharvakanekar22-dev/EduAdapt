import mongoose from 'mongoose';
import { MasteryRecord, MasteryLevel, StudentLearningProfile } from '../models/intelligence.model';
import { Question } from '../models/assessment.model';

// Factor weights for mastery
const WEIGHTS = {
  correctness: 0.5,
  difficulty: 0.2,
  recentPerformance: 0.2,
  consistency: 0.1
};

export class IntelligenceService {
  /**
   * Deterministic Mastery Estimation Engine
   * Calculates a mastery score (0-1) for a topic based on an assessment attempt
   */
  static async updateMasteryFromAssessment(studentId: string, answers: any[]) {
    // Group answers by topic and learning objective
    const topicResults: Record<string, any[]> = {};
    const objResults: Record<string, any[]> = {};
    
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;
      
      const topicId = question.topic.toString();
      if (!topicResults[topicId]) {
        topicResults[topicId] = [];
      }
      topicResults[topicId].push({
        isCorrect: ans.isCorrect,
        difficulty: question.difficulty,
        misconceptionTags: question.misconceptionTags || []
      });

      if (question.learningObjective) {
        const objId = question.learningObjective.toString();
        if (!objResults[objId]) objResults[objId] = [];
        objResults[objId].push({
           isCorrect: ans.isCorrect,
           difficulty: question.difficulty,
           topicId
        });
      }
    }

    const processResults = async (id: string, results: any[], isObjective: boolean, topicId?: string) => {
      let correctCount = 0;
      let difficultySum = 0;
      const newMisconceptions: string[] = [];

      results.forEach(r => {
        if (r.isCorrect) correctCount++;
        else if (r.misconceptionTags) newMisconceptions.push(...r.misconceptionTags);
        difficultySum += r.difficulty;
      });

      const avgDifficulty = difficultySum / results.length;
      const correctnessRatio = correctCount / results.length;

      // Base score calculation
      const baseScore = (correctnessRatio * WEIGHTS.correctness) + 
                        ((avgDifficulty / 10) * WEIGHTS.difficulty) + 
                        (0.8 * WEIGHTS.recentPerformance) + // Recent performance proxy
                        (0.9 * WEIGHTS.consistency);        // Consistency proxy

      const finalScore = Math.min(Math.max(baseScore, 0), 1);

      // Determine level
      let level = MasteryLevel.UNKNOWN;
      if (finalScore >= 0.85) level = MasteryLevel.MASTERED;
      else if (finalScore >= 0.5) level = MasteryLevel.DEVELOPING;
      else level = MasteryLevel.WEAK;

      // Fetch previous to apply decay/learning curve (simplified)
      const query = isObjective ? { student: studentId, learningObjective: id } : { student: studentId, topic: id };
      const prev = await MasteryRecord.findOne(query);
      
      let newScore = finalScore;
      if (prev) {
        const confidenceModifier = prev.confidence < 0.8 ? 1.2 : 1.0;
        newScore = (prev.score * 0.7) + (finalScore * 0.3 * confidenceModifier);
        newScore = Math.min(newScore, 1);
        if (newScore >= 0.85) level = MasteryLevel.MASTERED;
        else if (newScore >= 0.5) level = MasteryLevel.DEVELOPING;
        else level = MasteryLevel.WEAK;
      }

      await MasteryRecord.findOneAndUpdate(
        query,
        { 
          score: newScore,
          level,
          confidence: 0.8,
          topic: isObjective ? topicId : id // ensure topic is set
        },
        { upsert: true, new: true }
      );

      return newMisconceptions;
    };

    const allMisconceptions: string[] = [];

    // Process Topics
    for (const topicId of Object.keys(topicResults)) {
      const ms = await processResults(topicId, topicResults[topicId]!, false);
      allMisconceptions.push(...ms);
    }

    // Process Learning Objectives
    for (const objId of Object.keys(objResults)) {
      await processResults(objId, objResults[objId]!, true, objResults[objId]![0].topicId);
    }

    // Update StudentLearningProfile (Knowledge Gap & Misconception)
    if (allMisconceptions.length > 0) {
      await StudentLearningProfile.findOneAndUpdate(
        { student: studentId },
        { $addToSet: { detectedMisconceptions: { $each: allMisconceptions } } },
        { upsert: true }
      );
    }
  }
}
