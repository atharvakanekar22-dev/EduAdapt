import mongoose, { Document } from 'mongoose';
export declare enum QuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    SHORT_ANSWER = "SHORT_ANSWER",
    TRUE_FALSE = "TRUE_FALSE"
}
export interface IQuestion extends Document {
    topic: mongoose.Types.ObjectId;
    learningObjective: mongoose.Types.ObjectId;
    type: QuestionType;
    difficulty: number;
    content: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    hints: string[];
    misconceptionTags: string[];
}
export declare const Question: mongoose.Model<IQuestion, {}, {}, {}, Document<unknown, {}, IQuestion, {}, mongoose.DefaultSchemaOptions> & IQuestion & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IQuestion>;
export interface IAssessment extends Document {
    title: string;
    subject: mongoose.Types.ObjectId;
    questions: mongoose.Types.ObjectId[];
    isDiagnostic: boolean;
}
export declare const Assessment: mongoose.Model<IAssessment, {}, {}, {}, Document<unknown, {}, IAssessment, {}, mongoose.DefaultSchemaOptions> & IAssessment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssessment>;
export interface IAssessmentAttempt extends Document {
    student: mongoose.Types.ObjectId;
    assessment: mongoose.Types.ObjectId;
    score: number;
    completedAt: Date;
}
export declare const AssessmentAttempt: mongoose.Model<IAssessmentAttempt, {}, {}, {}, Document<unknown, {}, IAssessmentAttempt, {}, mongoose.DefaultSchemaOptions> & IAssessmentAttempt & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssessmentAttempt>;
export interface IAnswer extends Document {
    attempt: mongoose.Types.ObjectId;
    question: mongoose.Types.ObjectId;
    studentAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
}
export declare const Answer: mongoose.Model<IAnswer, {}, {}, {}, Document<unknown, {}, IAnswer, {}, mongoose.DefaultSchemaOptions> & IAnswer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAnswer>;
//# sourceMappingURL=assessment.model.d.ts.map