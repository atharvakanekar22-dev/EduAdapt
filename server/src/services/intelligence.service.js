"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceService = void 0;
const intelligence_model_1 = require("../models/intelligence.model");
const assessment_model_1 = require("../models/assessment.model");
// Factor weights for mastery
const WEIGHTS = {
    correctness: 0.5,
    difficulty: 0.2,
    recentPerformance: 0.2,
    consistency: 0.1
};
class IntelligenceService {
    /**
     * Deterministic Mastery Estimation Engine
     * Calculates a mastery score (0-1) for a topic based on an assessment attempt
     */
    static async updateMasteryFromAssessment(studentId, answers) {
        // Group answers by topic and learning objective
        const topicResults = {};
        for (const ans of answers) {
            const question = await assessment_model_1.Question.findById(ans.questionId);
            if (!question)
                continue;
            const topicId = question.topic.toString();
            if (!topicResults[topicId]) {
                topicResults[topicId] = [];
            }
            topicResults[topicId].push({
                isCorrect: ans.isCorrect,
                difficulty: question.difficulty,
                misconceptionTags: question.misconceptionTags || []
            });
        }
        // Process each topic
        for (const topicId of Object.keys(topicResults)) {
            const results = topicResults[topicId];
            let correctCount = 0;
            let difficultySum = 0;
            const newMisconceptions = [];
            results.forEach(r => {
                if (r.isCorrect)
                    correctCount++;
                else
                    newMisconceptions.push(...r.misconceptionTags);
                difficultySum += r.difficulty;
            });
            const avgDifficulty = difficultySum / results.length;
            const correctnessRatio = correctCount / results.length;
            // Base score calculation
            const baseScore = (correctnessRatio * WEIGHTS.correctness) +
                ((avgDifficulty / 10) * WEIGHTS.difficulty) +
                (0.8 * WEIGHTS.recentPerformance) + // Mock recent perf
                (0.9 * WEIGHTS.consistency); // Mock consistency
            const finalScore = Math.min(Math.max(baseScore, 0), 1);
            // Determine level
            let level = intelligence_model_1.MasteryLevel.UNKNOWN;
            if (finalScore >= 0.85)
                level = intelligence_model_1.MasteryLevel.MASTERED;
            else if (finalScore >= 0.5)
                level = intelligence_model_1.MasteryLevel.DEVELOPING;
            else
                level = intelligence_model_1.MasteryLevel.WEAK;
            // Update or create MasteryRecord
            await intelligence_model_1.MasteryRecord.findOneAndUpdate({ student: studentId, topic: topicId }, {
                score: finalScore,
                level,
                confidence: 0.8 // Increased confidence after assessment
            }, { upsert: true, new: true });
            // Update StudentLearningProfile (Knowledge Gap & Misconception)
            if (newMisconceptions.length > 0) {
                await intelligence_model_1.StudentLearningProfile.findOneAndUpdate({ student: studentId }, { $addToSet: { detectedMisconceptions: { $each: newMisconceptions } } });
            }
        }
    }
}
exports.IntelligenceService = IntelligenceService;
//# sourceMappingURL=intelligence.service.js.map