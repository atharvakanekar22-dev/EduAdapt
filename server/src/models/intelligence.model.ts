import mongoose, { Schema, Document } from 'mongoose';

export enum MasteryLevel {
  UNKNOWN = 'UNKNOWN',
  WEAK = 'WEAK',
  DEVELOPING = 'DEVELOPING',
  MASTERED = 'MASTERED'
}

export interface IMasteryRecord extends Document {
  student: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  learningObjective?: mongoose.Types.ObjectId;
  score: number; // 0.0 to 1.0
  level: MasteryLevel;
  confidence: number; // 0.0 to 1.0
}

const MasteryRecordSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  learningObjective: { type: Schema.Types.ObjectId, ref: 'LearningObjective' },
  score: { type: Number, required: true, default: 0 },
  level: { type: String, enum: Object.values(MasteryLevel), default: MasteryLevel.UNKNOWN },
  confidence: { type: Number, default: 0.5 }
}, { timestamps: true });

MasteryRecordSchema.index({ student: 1, topic: 1 });
MasteryRecordSchema.index({ student: 1, learningObjective: 1 });

export const MasteryRecord = mongoose.model<IMasteryRecord>('MasteryRecord', MasteryRecordSchema);

export interface IStudentLearningProfile extends Document {
  student: mongoose.Types.ObjectId;
  recentActivity: mongoose.Types.ObjectId[]; // refs to LearningSessions or AssessmentAttempts
  currentFocusSubject: mongoose.Types.ObjectId;
  detectedMisconceptions: string[];
}

const StudentLearningProfileSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recentActivity: [{ type: Schema.Types.ObjectId }],
  currentFocusSubject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  detectedMisconceptions: [{ type: String }]
}, { timestamps: true });

export const StudentLearningProfile = mongoose.model<IStudentLearningProfile>('StudentLearningProfile', StudentLearningProfileSchema);

export interface IRecommendation extends Document {
  student: mongoose.Types.ObjectId;
  recommendedTopic: mongoose.Types.ObjectId;
  actionType: 'LEARN' | 'PRACTICE' | 'REVISE' | 'ASSESS';
  reason: string;
  isActive: boolean;
}

const RecommendationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recommendedTopic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  actionType: { type: String, enum: ['LEARN', 'PRACTICE', 'REVISE', 'ASSESS'], required: true },
  reason: { type: String, required: true }, // The "Why am I learning this?" explanation
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

RecommendationSchema.index({ student: 1, isActive: 1 });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
