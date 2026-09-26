import mongoose, { Document } from 'mongoose';
export declare enum NodeState {
    LOCKED = "LOCKED",
    RECOMMENDED = "RECOMMENDED",
    CURRENT = "CURRENT",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    REVIEW_REQUIRED = "REVIEW_REQUIRED",
    MASTERED = "MASTERED",
    SKIPPED = "SKIPPED"
}
export interface ILearningPathNode extends Document {
    path: mongoose.Types.ObjectId;
    topic: mongoose.Types.ObjectId;
    state: NodeState;
    order: number;
}
export declare const LearningPathNode: mongoose.Model<ILearningPathNode, {}, {}, {}, Document<unknown, {}, ILearningPathNode, {}, mongoose.DefaultSchemaOptions> & ILearningPathNode & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILearningPathNode>;
export interface ILearningPath extends Document {
    student: mongoose.Types.ObjectId;
    subject: mongoose.Types.ObjectId;
    isActive: boolean;
}
export declare const LearningPath: mongoose.Model<ILearningPath, {}, {}, {}, Document<unknown, {}, ILearningPath, {}, mongoose.DefaultSchemaOptions> & ILearningPath & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILearningPath>;
export interface ILearningSession extends Document {
    student: mongoose.Types.ObjectId;
    topic: mongoose.Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    selfReportedDifficulty?: number;
}
export declare const LearningSession: mongoose.Model<ILearningSession, {}, {}, {}, Document<unknown, {}, ILearningSession, {}, mongoose.DefaultSchemaOptions> & ILearningSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILearningSession>;
export interface IRevisionItem extends Document {
    student: mongoose.Types.ObjectId;
    topic: mongoose.Types.ObjectId;
    lastStudied: Date;
    revisionPriority: 'HIGH' | 'NORMAL' | 'LOW';
    recommendedRevisionDate: Date;
    status: 'PENDING' | 'COMPLETED';
}
export declare const RevisionItem: mongoose.Model<IRevisionItem, {}, {}, {}, Document<unknown, {}, IRevisionItem, {}, mongoose.DefaultSchemaOptions> & IRevisionItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRevisionItem>;
export interface ITeacherIntervention extends Document {
    teacher: mongoose.Types.ObjectId;
    targetTopic: mongoose.Types.ObjectId;
    studentsAffected: mongoose.Types.ObjectId[];
    recommendationNote: string;
    isApplied: boolean;
}
export declare const TeacherIntervention: mongoose.Model<ITeacherIntervention, {}, {}, {}, Document<unknown, {}, ITeacherIntervention, {}, mongoose.DefaultSchemaOptions> & ITeacherIntervention & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITeacherIntervention>;
//# sourceMappingURL=learning.model.d.ts.map