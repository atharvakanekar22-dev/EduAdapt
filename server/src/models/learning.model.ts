import mongoose, { Schema, Document } from 'mongoose';

export enum NodeState {
  LOCKED = 'LOCKED',
  RECOMMENDED = 'RECOMMENDED',
  CURRENT = 'CURRENT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  MASTERED = 'MASTERED',
  SKIPPED = 'SKIPPED'
}

export interface ILearningPathNode extends Document {
  path: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  state: NodeState;
  order: number;
}

const LearningPathNodeSchema = new Schema({
  path: { type: Schema.Types.ObjectId, ref: 'LearningPath', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  state: { type: String, enum: Object.values(NodeState), default: NodeState.LOCKED },
  order: { type: Number, required: true }
}, { timestamps: true });

LearningPathNodeSchema.index({ path: 1, topic: 1 });
LearningPathNodeSchema.index({ path: 1, order: 1 });

export const LearningPathNode = mongoose.model<ILearningPathNode>('LearningPathNode', LearningPathNodeSchema);

export interface ILearningPath extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  isActive: boolean;
}

const LearningPathSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

LearningPathSchema.index({ student: 1, subject: 1, isActive: 1 });

export const LearningPath = mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);

export interface ILearningSession extends Document {
  student: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  selfReportedDifficulty?: number; // 1-5
}

const LearningSessionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  selfReportedDifficulty: { type: Number }
}, { timestamps: true });

export const LearningSession = mongoose.model<ILearningSession>('LearningSession', LearningSessionSchema);

export interface IRevisionItem extends Document {
  student: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  lastStudied: Date;
  revisionPriority: 'HIGH' | 'NORMAL' | 'LOW';
  recommendedRevisionDate: Date;
  status: 'PENDING' | 'COMPLETED';
}

const RevisionItemSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  lastStudied: { type: Date, required: true },
  revisionPriority: { type: String, enum: ['HIGH', 'NORMAL', 'LOW'], required: true },
  recommendedRevisionDate: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' }
}, { timestamps: true });

export const RevisionItem = mongoose.model<IRevisionItem>('RevisionItem', RevisionItemSchema);


