import mongoose, { Schema, Document } from 'mongoose';

export enum InterventionType {
  RETEACH = 'RETEACH',
  PRACTICE = 'PRACTICE',
  REVISION = 'REVISION',
  ASSIGNMENT = 'ASSIGNMENT',
  UNLOCK = 'UNLOCK',
  INDIVIDUAL_SUPPORT = 'INDIVIDUAL_SUPPORT'
}

export interface ITeacherIntervention extends Document {
  teacher: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  topic?: mongoose.Types.ObjectId;
  learningObjective?: mongoose.Types.ObjectId;
  type: InterventionType;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'DISMISSED';
}

const TeacherInterventionSchema = new Schema({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic' },
  learningObjective: { type: Schema.Types.ObjectId, ref: 'LearningObjective' },
  type: { type: String, enum: Object.values(InterventionType), required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'DISMISSED'], default: 'PENDING' }
}, { timestamps: true });

export const TeacherIntervention = mongoose.model<ITeacherIntervention>('TeacherIntervention', TeacherInterventionSchema);

export enum OverrideAction {
  ASSIGN_PRACTICE = 'ASSIGN_PRACTICE',
  FORCE_REVISION = 'FORCE_REVISION',
  UNLOCK_TOPIC = 'UNLOCK_TOPIC',
  RECOMMEND_TOPIC = 'RECOMMEND_TOPIC',
  MARK_REVIEW = 'MARK_REVIEW'
}

export interface ITeacherOverride extends Document {
  teacher: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  action: OverrideAction;
  reason: string;
}

const TeacherOverrideSchema = new Schema({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  action: { type: String, enum: Object.values(OverrideAction), required: true },
  reason: { type: String, required: true }
}, { timestamps: true });

export const TeacherOverride = mongoose.model<ITeacherOverride>('TeacherOverride', TeacherOverrideSchema);
