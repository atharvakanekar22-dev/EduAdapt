"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassAnalytics = void 0;
const intelligence_model_1 = require("../models/intelligence.model");
const learning_model_1 = require("../models/learning.model");
const getClassAnalytics = async (req, res) => {
    try {
        const teacherId = req.user.id;
        // In a real app, filter by students assigned to this teacher
        // Simple mock class analytics: aggregate mastery by topic
        const masteries = await intelligence_model_1.MasteryRecord.find().populate('topic');
        const topicStats = {};
        masteries.forEach(m => {
            const topicId = m.topic._id.toString();
            if (!topicStats[topicId]) {
                topicStats[topicId] = {
                    topic: m.topic,
                    mastered: 0,
                    developing: 0,
                    weak: 0,
                    total: 0
                };
            }
            topicStats[topicId].total++;
            if (m.level === intelligence_model_1.MasteryLevel.MASTERED)
                topicStats[topicId].mastered++;
            else if (m.level === intelligence_model_1.MasteryLevel.DEVELOPING)
                topicStats[topicId].developing++;
            else
                topicStats[topicId].weak++;
        });
        const interventions = await learning_model_1.TeacherIntervention.find({ teacher: teacherId, isApplied: false }).populate('targetTopic');
        res.status(200).json({ topicStats: Object.values(topicStats), interventions });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getClassAnalytics = getClassAnalytics;
//# sourceMappingURL=teacher.controller.js.map