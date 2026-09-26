"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAnalytics = void 0;
const intelligence_model_1 = require("../models/intelligence.model");
const learning_model_1 = require("../models/learning.model");
const getStudentAnalytics = async (req, res) => {
    try {
        const studentId = req.user.id;
        const mastery = await intelligence_model_1.MasteryRecord.find({ student: studentId }).populate('topic');
        const profile = await intelligence_model_1.StudentLearningProfile.findOne({ student: studentId });
        const revisions = await learning_model_1.RevisionItem.find({ student: studentId, status: 'PENDING' }).populate('topic');
        const recentSessions = await learning_model_1.LearningSession.find({ student: studentId })
            .sort({ startTime: -1 })
            .limit(5)
            .populate('topic');
        res.status(200).json({ mastery, profile, revisions, recentSessions });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getStudentAnalytics = getStudentAnalytics;
//# sourceMappingURL=analytics.controller.js.map