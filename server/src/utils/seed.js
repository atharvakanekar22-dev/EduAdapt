"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = exports.seedDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
const content_model_1 = require("../models/content.model");
const intelligence_model_1 = require("../models/intelligence.model");
const learning_model_1 = require("../models/learning.model");
dotenv_1.default.config();
const seedDatabase = async () => {
    // 1. Create Student
    const hash = await bcryptjs_1.default.hash('password123', 10);
    const student = await user_model_1.User.create({ email: 'student@example.com', name: 'Demo Student', passwordHash: hash, role: user_model_1.Role.STUDENT });
    await user_model_1.StudentProfile.create({ user: student._id, learningGoal: 'Learn Python', studyTimeAvailability: 10, learningPreferences: ['Visual', 'Practice-first'] });
    // 2. Create Subject
    const python = await content_model_1.Subject.create({ name: 'Python Programming', description: 'Fundamentals of Python' });
    // 3. Create Topics & Objectives
    const topicsData = [
        { name: 'Variables', order: 1, difficulty: 2 },
        { name: 'Conditions', order: 2, difficulty: 3 },
        { name: 'Loops', order: 3, difficulty: 5 },
        { name: 'Functions', order: 4, difficulty: 6 },
        { name: 'OOP', order: 5, difficulty: 8 }
    ];
    const topics = [];
    for (const t of topicsData) {
        const topic = await content_model_1.Topic.create({ ...t, subject: python._id });
        topics.push(topic);
    }
    // 4. Prerequisites (Linear for simplicity)
    for (let i = 1; i < topics.length; i++) {
        await content_model_1.Prerequisite.create({ topic: topics[i]._id, prerequisiteTopic: topics[i - 1]._id });
    }
    // 5. Mastery Profile (Student A scenario)
    await intelligence_model_1.MasteryRecord.create({ student: student._id, topic: topics[0]._id, score: 0.92, level: intelligence_model_1.MasteryLevel.MASTERED });
    await intelligence_model_1.MasteryRecord.create({ student: student._id, topic: topics[1]._id, score: 0.86, level: intelligence_model_1.MasteryLevel.MASTERED });
    await intelligence_model_1.MasteryRecord.create({ student: student._id, topic: topics[2]._id, score: 0.48, level: intelligence_model_1.MasteryLevel.WEAK });
    await intelligence_model_1.MasteryRecord.create({ student: student._id, topic: topics[3]._id, score: 0.72, level: intelligence_model_1.MasteryLevel.DEVELOPING });
    await intelligence_model_1.MasteryRecord.create({ student: student._id, topic: topics[4]._id, score: 0.38, level: intelligence_model_1.MasteryLevel.WEAK });
    await intelligence_model_1.StudentLearningProfile.create({ student: student._id, currentFocusSubject: python._id, detectedMisconceptions: ['Nested Loops'] });
    // 6. Recommendation
    await intelligence_model_1.Recommendation.create({
        student: student._id,
        recommendedTopic: topics[2]._id,
        actionType: 'PRACTICE',
        reason: 'Your recent accuracy is 48% and you made repeated mistakes in nested loops.',
        isActive: true
    });
    // 7. Learning Path Nodes
    const path = await learning_model_1.LearningPath.create({ student: student._id, subject: python._id });
    await learning_model_1.LearningPathNode.create({ path: path._id, topic: topics[0]._id, state: learning_model_1.NodeState.MASTERED, order: 1 });
    await learning_model_1.LearningPathNode.create({ path: path._id, topic: topics[1]._id, state: learning_model_1.NodeState.MASTERED, order: 2 });
    await learning_model_1.LearningPathNode.create({ path: path._id, topic: topics[2]._id, state: learning_model_1.NodeState.CURRENT, order: 3 });
    await learning_model_1.LearningPathNode.create({ path: path._id, topic: topics[3]._id, state: learning_model_1.NodeState.LOCKED, order: 4 });
    await learning_model_1.LearningPathNode.create({ path: path._id, topic: topics[4]._id, state: learning_model_1.NodeState.LOCKED, order: 5 });
    console.log('Seeding completed successfully!');
};
exports.seedDatabase = seedDatabase;
const seed = async (mongoUri) => {
    if (mongoUri) {
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to DB for seeding...');
    }
    // Clear existing
    await mongoose_1.default.connection.dropDatabase();
    await (0, exports.seedDatabase)();
    if (mongoUri) {
        process.exit(0);
    }
};
exports.seed = seed;
if (require.main === module) {
    (0, exports.seed)(process.env.DATABASE_URL || 'mongodb://localhost:27017/eduadapt').catch(console.error);
}
//# sourceMappingURL=seed.js.map