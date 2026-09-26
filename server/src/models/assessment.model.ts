import mongoose, { Schema, Document } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE'
}

export interface IQuestion extends Document {
  topic: mongoose.Types.ObjectId;
  learningObjective: mongoose.Types.ObjectId;
  type: QuestionType;
  difficulty: number;
  content: string;
  options: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string;
  hints: string[];
  misconceptionTags: string[]; // e.g. 'confuses inheritance with composition'
}

const QuestionSchema = new Schema({
  topic: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  learningObjective: { type: Schema.Types.ObjectId, ref: 'LearningObjective' },
  type: { type: String, enum: Object.values(QuestionType), required: true },
  difficulty: { type: Number, default: 5 },
  content: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  hints: [{ type: String }],
  misconceptionTags: [{ type: String }]
}, { timestamps: true });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

export interface IAssessment extends Document {
  title: string;
  subject: mongoose.Types.ObjectId;
  questions: mongoose.Types.ObjectId[];
  isDiagnostic: boolean;
}

const AssessmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  isDiagnostic: { type: Boolean, default: false }
}, { timestamps: true });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);

export interface IAssessmentAttempt extends Document {
  student: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  score: number;
  completedAt: Date;
}

const AssessmentAttemptSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assessment: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  score: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

export const AssessmentAttempt = mongoose.model<IAssessmentAttempt>('AssessmentAttempt', AssessmentAttemptSchema);

export interface IAnswer extends Document {
  attempt: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
}

const AnswerSchema = new Schema({
  attempt: { type: Schema.Types.ObjectId, ref: 'AssessmentAttempt', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  studentAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number, default: 0 }
}, { timestamps: true });

export const Answer = mongoose.model<IAnswer>('Answer', AnswerSchema);
