"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAssessment = exports.getAssessmentById = exports.getAssessments = void 0;
const assessment_model_1 = require("../models/assessment.model");
const intelligence_service_1 = require("../services/intelligence.service");
const getAssessments = async (req, res) => {
    try {
        const assessments = await assessment_model_1.Assessment.find({ isDiagnostic: true }).populate('subject');
        res.status(200).json(assessments);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAssessments = getAssessments;
const getAssessmentById = async (req, res) => {
    try {
        const assessment = await assessment_model_1.Assessment.findById(req.params.id).populate('questions');
        if (!assessment) {
            res.status(404).json({ error: 'Assessment not found' });
            return;
        }
        // Don't send correct answers to the client during the test
        const sanitizedQuestions = assessment.questions.map((q) => ({
            _id: q._id,
            content: q.content,
            options: q.options,
            type: q.type,
            difficulty: q.difficulty
        }));
        res.status(200).json({ ...assessment.toObject(), questions: sanitizedQuestions });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getAssessmentById = getAssessmentById;
const submitAssessment = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { assessmentId } = req.params;
        const { answers } = req.body; // Array of { questionId, studentAnswer, timeSpent }
        const assessment = await assessment_model_1.Assessment.findById(assessmentId).populate('questions');
        if (!assessment) {
            res.status(404).json({ error: 'Assessment not found' });
            return;
        }
        const attempt = new assessment_model_1.AssessmentAttempt({
            student: studentId,
            assessment: assessmentId,
            completedAt: new Date()
        });
        let correctCount = 0;
        const processedAnswers = await Promise.all(answers.map(async (ans) => {
            const question = await assessment_model_1.Question.findById(ans.questionId);
            const isCorrect = question?.correctAnswer === ans.studentAnswer;
            if (isCorrect)
                correctCount++;
            return new assessment_model_1.Answer({
                attempt: attempt._id,
                question: ans.questionId,
                studentAnswer: ans.studentAnswer,
                isCorrect,
                timeSpent: ans.timeSpent || 0
            }).save();
        }));
        attempt.score = (correctCount / assessment.questions.length) * 100;
        await attempt.save();
        // Trigger the Knowledge Gap Engine and Mastery Engine
        await intelligence_service_1.IntelligenceService.updateMasteryFromAssessment(studentId, answers);
        res.status(200).json({ attemptId: attempt._id, score: attempt.score });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.submitAssessment = submitAssessment;
//# sourceMappingURL=assessment.controller.js.map