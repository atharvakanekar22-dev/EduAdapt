import mongoose, { Schema, Document } from 'mongoose';

export enum TutorMode {
  SOCRATIC_HINT = 'SOCRATIC_HINT',
  EXPLAIN_CONCEPT = 'EXPLAIN_CONCEPT',
  EXPLAIN_MISTAKE = 'EXPLAIN_MISTAKE',
  SOCRATIC_CHAT = 'SOCRATIC_CHAT'
}

export interface ITutorConversation extends Document {
  student: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  learningObjective?: mongoose.Types.ObjectId;
  session?: mongoose.Types.ObjectId;
}

const TutorConversationSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  learningObjective: { type: Schema.Types.ObjectId, ref: 'LearningObjective' },
  session: { type: Schema.Types.ObjectId, ref: 'LearningSession' }
}, { timestamps: true });

TutorConversationSchema.index({ student: 1, topic: 1 });
TutorConversationSchema.index({ student: 1, session: 1 });

export const TutorConversation = mongoose.model<ITutorConversation>('TutorConversation', TutorConversationSchema);

export interface ITutorMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  role: 'user' | 'model';
  content: string;
  tutorMode?: TutorMode;
  metadata?: any;
}

const TutorMessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'TutorConversation', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  tutorMode: { type: String, enum: Object.values(TutorMode) },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

TutorMessageSchema.index({ conversation: 1, createdAt: 1 });

export const TutorMessage = mongoose.model<ITutorMessage>('TutorMessage', TutorMessageSchema);
