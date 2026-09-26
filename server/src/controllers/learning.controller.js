"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endSession = exports.startSession = exports.getLearningPath = void 0;
const learning_model_1 = require("../models/learning.model");
const intelligence_model_1 = require("../models/intelligence.model");
const adaptive_service_1 = require("../services/adaptive.service");
const getLearningPath = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { subjectId } = req.params;
        // Trigger an update to ensure it's fresh
        const path = await adaptive_service_1.AdaptiveService.updateLearningPath(studentId, subjectId);
        const nodes = await learning_model_1.LearningPathNode.find({ path: path._id })
            .populate('topic')
            .sort({ order: 1 });
        const activeRecommendation = await intelligence_model_1.Recommendation.findOne({
            student: studentId,
            isActive: true
        }).populate('recommendedTopic');
        res.status(200).json({ path, nodes, activeRecommendation });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getLearningPath = getLearningPath;
const startSession = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { topicId } = req.body;
        const session = new learning_model_1.LearningSession({
            student: studentId,
            topic: topicId,
            startTime: new Date()
        });
        await session.save();
        res.status(201).json(session);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.startSession = startSession;
const endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { selfReportedDifficulty } = req.body;
        const session = await learning_model_1.LearningSession.findByIdAndUpdate(sessionId, { endTime: new Date(), selfReportedDifficulty }, { new: true });
        res.status(200).json(session);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.endSession = endSession;
//# sourceMappingURL=learning.controller.js.map