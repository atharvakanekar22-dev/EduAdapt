import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  description: string;
  isActive: boolean;
}

const SubjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);

export interface ITopic extends Document {
  subject: mongoose.Types.ObjectId;
  name: string;
  description: string;
  order: number;
  difficulty: number; // 1-10
  estimatedDuration: number; // minutes
}

const TopicSchema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  difficulty: { type: Number, default: 5 },
  estimatedDuration: { type: Number, default: 30 }
}, { timestamps: true });

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);

export interface ILearningObjective extends Document {
  topic: mongoose.Types.ObjectId;
  code: string; // e.g. LO1
  description: string;
}

const LearningObjectiveSchema = new Schema({
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  code: { type: String, required: true },
  description: { type: String, required: true }
}, { timestamps: true });

export const LearningObjective = mongoose.model<ILearningObjective>('LearningObjective', LearningObjectiveSchema);

export interface IPrerequisite extends Document {
  topic: mongoose.Types.ObjectId;
  prerequisiteTopic: mongoose.Types.ObjectId;
  isRequired: boolean;
}

const PrerequisiteSchema = new Schema({
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  prerequisiteTopic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  isRequired: { type: Boolean, default: true }
}, { timestamps: true });

export const Prerequisite = mongoose.model<IPrerequisite>('Prerequisite', PrerequisiteSchema);
