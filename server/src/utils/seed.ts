import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Role, StudentProfile } from '../models/user.model';
import { Subject, Topic, LearningObjective, Prerequisite } from '../models/content.model';
import { MasteryRecord, MasteryLevel, StudentLearningProfile, Recommendation } from '../models/intelligence.model';
import { LearningPath, LearningPathNode, NodeState } from '../models/learning.model';

dotenv.config();

export const seedDatabase = async () => {
  // 1. Create Student
  const hash = await bcrypt.hash('password123', 10);
  const student = await User.create({ email: 'student@example.com', name: 'Demo Student', passwordHash: hash, role: Role.STUDENT });
  await StudentProfile.create({ user: student._id, learningGoal: 'Learn Python', studyTimeAvailability: 10, learningPreferences: ['Visual', 'Practice-first'] });
  
  // 2. Create Subject
  const python = await Subject.create({ name: 'Python Programming', description: 'Fundamentals of Python' });

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
    const topic = await Topic.create({ ...t, subject: python._id });
    topics.push(topic);
  }

  // 4. Prerequisites (Linear for simplicity)
  for (let i = 1; i < topics.length; i++) {
    await Prerequisite.create({ topic: topics[i]._id, prerequisiteTopic: topics[i-1]._id });
  }

  // 5. Mastery Profile (Student A scenario)
  await MasteryRecord.create({ student: student._id, topic: topics[0]!._id, score: 0.92, level: MasteryLevel.MASTERED });
  await MasteryRecord.create({ student: student._id, topic: topics[1]!._id, score: 0.86, level: MasteryLevel.MASTERED });
  await MasteryRecord.create({ student: student._id, topic: topics[2]!._id, score: 0.48, level: MasteryLevel.WEAK });
  await MasteryRecord.create({ student: student._id, topic: topics[3]!._id, score: 0.72, level: MasteryLevel.DEVELOPING });
  await MasteryRecord.create({ student: student._id, topic: topics[4]!._id, score: 0.38, level: MasteryLevel.WEAK });

  await StudentLearningProfile.create({ student: student._id, currentFocusSubject: python._id, detectedMisconceptions: ['Nested Loops'] });

  // 6. Recommendation
  await Recommendation.create({
    student: student._id,
    recommendedTopic: topics[2]!._id,
    actionType: 'PRACTICE',
    reason: 'Your recent accuracy is 48% and you made repeated mistakes in nested loops.',
    isActive: true
  });

  // 7. Learning Path Nodes for Student A
  const path = await LearningPath.create({ student: student._id, subject: python._id });
  await LearningPathNode.create({ path: path._id, topic: topics[0]!._id, state: NodeState.MASTERED, order: 1 });
  await LearningPathNode.create({ path: path._id, topic: topics[1]!._id, state: NodeState.MASTERED, order: 2 });
  await LearningPathNode.create({ path: path._id, topic: topics[2]!._id, state: NodeState.CURRENT, order: 3 });
  await LearningPathNode.create({ path: path._id, topic: topics[3]!._id, state: NodeState.LOCKED, order: 4 });
  await LearningPathNode.create({ path: path._id, topic: topics[4]!._id, state: NodeState.LOCKED, order: 5 });

  // 8. Create Student B
  const studentB = await User.create({ email: 'studentB@example.com', name: 'Demo Student B', passwordHash: hash, role: Role.STUDENT });
  await StudentProfile.create({ user: studentB._id, learningGoal: 'Learn Python', studyTimeAvailability: 10, learningPreferences: ['Reading'] });
  
  await MasteryRecord.create({ student: studentB._id, topic: topics[0]!._id, score: 0.95, level: MasteryLevel.MASTERED });
  await MasteryRecord.create({ student: studentB._id, topic: topics[1]!._id, score: 0.90, level: MasteryLevel.MASTERED });
  await MasteryRecord.create({ student: studentB._id, topic: topics[2]!._id, score: 0.88, level: MasteryLevel.MASTERED }); // Loops strong
  await MasteryRecord.create({ student: studentB._id, topic: topics[3]!._id, score: 0.85, level: MasteryLevel.MASTERED }); // Functions strong
  await MasteryRecord.create({ student: studentB._id, topic: topics[4]!._id, score: 0.60, level: MasteryLevel.DEVELOPING }); // OOP developing

  await StudentLearningProfile.create({ student: studentB._id, currentFocusSubject: python._id, detectedMisconceptions: [] });

  // 9. Add Learning Objectives, Questions and Assessment for Loops
  const { Question, Assessment } = await import('../models/assessment.model');

  // Create Learning Objectives
  const loLoops1 = await LearningObjective.create({ topic: topics[2]!._id, code: 'LO-LOOPS-1', description: 'Understand basic loops' });
  const loLoops2 = await LearningObjective.create({ topic: topics[2]!._id, code: 'LO-LOOPS-2', description: 'Understand nested loops' });
  
  const loVars = await LearningObjective.create({ topic: topics[0]!._id, code: 'LO-VARS-1', description: 'Understand variables' });
  const loCond = await LearningObjective.create({ topic: topics[1]!._id, code: 'LO-COND-1', description: 'Understand if/else' });
  
  const q1 = await Question.create({
    topic: topics[2]!._id,
    learningObjective: loLoops1._id,
    type: 'MULTIPLE_CHOICE',
    content: 'What will `for i in range(3): print(i)` output?',
    options: ['1 2 3', '0 1 2', '0 1 2 3', '1 2'],
    correctAnswer: '0 1 2',
    difficulty: 3,
    misconceptionTags: ['Range off-by-one']
  });

  const q2 = await Question.create({
    topic: topics[2]!._id,
    learningObjective: loLoops1._id,
    type: 'MULTIPLE_CHOICE',
    content: 'Which loop is best when you do not know in advance how many times it will run?',
    options: ['for', 'while', 'do-while', 'foreach'],
    correctAnswer: 'while',
    difficulty: 4,
    misconceptionTags: ['Loop Selection']
  });

  const q3 = await Question.create({
    topic: topics[2]!._id,
    learningObjective: loLoops2._id,
    type: 'MULTIPLE_CHOICE',
    content: 'What happens in a nested loop if the inner loop breaks?',
    options: ['Both loops stop', 'Outer loop stops', 'Inner loop stops', 'Program crashes'],
    correctAnswer: 'Inner loop stops',
    difficulty: 6,
    misconceptionTags: ['Nested Loops Break']
  });

  await Assessment.create({
    subject: python._id,
    title: 'Loops Practice Assessment',
    description: 'Test your understanding of loops.',
    type: 'PRACTICE',
    isDiagnostic: false,
    questions: [q1._id, q2._id, q3._id]
  });

  // Diagnostic Assessment Questions
  const dqVars = await Question.create({
    topic: topics[0]!._id,
    learningObjective: loVars._id,
    type: 'MULTIPLE_CHOICE',
    content: 'How do you assign the value 5 to a variable named x in Python?',
    options: ['int x = 5;', 'x = 5', 'let x = 5', 'x <- 5'],
    correctAnswer: 'x = 5',
    difficulty: 2,
    misconceptionTags: ['Syntax confusion']
  });

  const dqCond = await Question.create({
    topic: topics[1]!._id,
    learningObjective: loCond._id,
    type: 'MULTIPLE_CHOICE',
    content: 'Which statement is used to execute code if a condition is true?',
    options: ['if', 'while', 'for', 'switch'],
    correctAnswer: 'if',
    difficulty: 3,
    misconceptionTags: ['Conditionals']
  });

  const dqLoops = await Question.create({
    topic: topics[2]!._id,
    learningObjective: loLoops1._id,
    type: 'MULTIPLE_CHOICE',
    content: 'What does a continue statement do?',
    options: ['Stops the loop', 'Skips to the next iteration', 'Exits the program', 'Returns a value'],
    correctAnswer: 'Skips to the next iteration',
    difficulty: 5,
    misconceptionTags: ['Loop Control']
  });

  await Assessment.create({
    subject: python._id,
    title: 'Python Diagnostic Assessment',
    description: 'Initial assessment to determine your starting knowledge.',
    type: 'DIAGNOSTIC',
    isDiagnostic: true,
    questions: [dqVars._id, dqCond._id, dqLoops._id]
  });

  console.log('Seeding completed successfully!');
};

export const seed = async (mongoUri?: string) => {
  if (mongoUri) {
     await mongoose.connect(mongoUri);
     console.log('Connected to DB for seeding...');
  }
  // Clear existing
  await mongoose.connection.dropDatabase();
  await seedDatabase();
  if (mongoUri) {
     process.exit(0);
  }
};

if (require.main === module) {
  seed(process.env.DATABASE_URL || 'mongodb://localhost:27017/eduadapt').catch(console.error);
}
