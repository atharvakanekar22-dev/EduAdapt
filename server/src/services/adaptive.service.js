"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveService = void 0;
const content_model_1 = require("../models/content.model");
const intelligence_model_1 = require("../models/intelligence.model");
const learning_model_1 = require("../models/learning.model");
class AdaptiveService {
    /**
     * Generates or updates the Adaptive Learning Path based on Mastery and Prerequisites.
     */
    static async updateLearningPath(studentId, subjectId) {
        // 1. Fetch all topics for the subject
        const topics = await content_model_1.Topic.find({ subject: subjectId }).sort({ order: 1 });
        const topicIds = topics.map(t => t._id);
        // 2. Fetch Prerequisites
        const prerequisites = await content_model_1.Prerequisite.find({ topic: { $in: topicIds } });
        // 3. Fetch Mastery Records
        const masteries = await intelligence_model_1.MasteryRecord.find({ student: studentId, topic: { $in: topicIds } });
        const masteryMap = new Map(masteries.map(m => [m.topic.toString(), m]));
        // 4. Find or Create Learning Path
        let path = await learning_model_1.LearningPath.findOne({ student: studentId, subject: subjectId });
        if (!path) {
            path = await learning_model_1.LearningPath.create({ student: studentId, subject: subjectId });
        }
        // 5. Evaluate states for each topic
        let firstCurrentFound = false;
        for (const topic of topics) {
            const topicId = topic._id.toString();
            const mastery = masteryMap.get(topicId);
            // Check prerequisites
            const preReqs = prerequisites.filter(p => p.topic.toString() === topicId);
            const preReqsMet = preReqs.every(p => {
                const pMastery = masteryMap.get(p.prerequisiteTopic.toString());
                return pMastery && (pMastery.level === intelligence_model_1.MasteryLevel.DEVELOPING || pMastery.level === intelligence_model_1.MasteryLevel.MASTERED);
            });
            let state = learning_model_1.NodeState.LOCKED;
            if (mastery?.level === intelligence_model_1.MasteryLevel.MASTERED) {
                state = learning_model_1.NodeState.MASTERED;
            }
            else if (mastery?.level === intelligence_model_1.MasteryLevel.WEAK) {
                state = learning_model_1.NodeState.REVIEW_REQUIRED;
            }
            else if (preReqsMet) {
                if (!firstCurrentFound) {
                    state = learning_model_1.NodeState.CURRENT;
                    firstCurrentFound = true;
                    // Generate explainable recommendation
                    await this.generateRecommendation(studentId, topic._id, 'LEARN', 'You have completed the prerequisites and are ready to learn this topic.');
                }
                else {
                    state = learning_model_1.NodeState.RECOMMENDED;
                }
            }
            // Update Node
            await learning_model_1.LearningPathNode.findOneAndUpdate({ path: path._id, topic: topic._id }, { state, order: topic.order }, { upsert: true });
        }
        return path;
    }
    static async generateRecommendation(studentId, topicId, actionType, reason) {
        // Deactivate previous for this topic
        await intelligence_model_1.Recommendation.updateMany({ student: studentId, recommendedTopic: topicId, isActive: true }, { isActive: false });
        await intelligence_model_1.Recommendation.create({
            student: studentId,
            recommendedTopic: topicId,
            actionType,
            reason,
            isActive: true
        });
    }
}
exports.AdaptiveService = AdaptiveService;
//# sourceMappingURL=adaptive.service.js.map