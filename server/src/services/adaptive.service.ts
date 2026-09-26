import mongoose from 'mongoose';
import { Prerequisite, Topic } from '../models/content.model';
import { MasteryRecord, MasteryLevel, Recommendation } from '../models/intelligence.model';
import { LearningPath, LearningPathNode, NodeState } from '../models/learning.model';

export class AdaptiveService {
  /**
   * Generates or updates the Adaptive Learning Path based on Mastery and Prerequisites.
   */
  static async updateLearningPath(studentId: string, subjectId: string) {
    // 1. Fetch all topics for the subject
    const topics = await Topic.find({ subject: subjectId }).sort({ order: 1 });
    const topicIds = topics.map(t => t._id);

    // 2. Fetch Prerequisites
    const prerequisites = await Prerequisite.find({ topic: { $in: topicIds } });

    // 3. Fetch Mastery Records
    const masteries = await MasteryRecord.find({ student: studentId, topic: { $in: topicIds } });
    const masteryMap = new Map(masteries.map(m => [m.topic.toString(), m]));

    // 4. Find or Create Learning Path
    let path = await LearningPath.findOne({ student: studentId, subject: subjectId });
    if (!path) {
      path = await LearningPath.create({ student: studentId, subject: subjectId });
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
        return pMastery && (pMastery.level === MasteryLevel.DEVELOPING || pMastery.level === MasteryLevel.MASTERED);
      });

      let state = NodeState.LOCKED;

      if (mastery?.level === MasteryLevel.MASTERED) {
        state = NodeState.MASTERED;
      } else if (mastery?.level === MasteryLevel.WEAK) {
        state = NodeState.REVIEW_REQUIRED;
      } else if (preReqsMet) {
        if (!firstCurrentFound) {
          state = NodeState.CURRENT;
          firstCurrentFound = true;

          // Generate explainable recommendation
          await this.generateRecommendation(studentId, topic._id, 'LEARN', 'You have completed the prerequisites and are ready to learn this topic.');
        } else {
          state = NodeState.RECOMMENDED;
        }
      }

      // Update Node
      await LearningPathNode.findOneAndUpdate(
        { path: path._id, topic: topic._id },
        { state, order: topic.order },
        { upsert: true }
      );
    }

    return path;
  }

  static async generateRecommendation(studentId: string, topicId: mongoose.Types.ObjectId, actionType: 'LEARN'|'PRACTICE'|'REVISE', reason: string) {
    // Deactivate previous for this topic
    await Recommendation.updateMany(
      { student: studentId, recommendedTopic: topicId, isActive: true },
      { isActive: false }
    );

    await Recommendation.create({
      student: studentId,
      recommendedTopic: topicId,
      actionType,
      reason,
      isActive: true
    });
  }
}
