import mongoose, { Document } from 'mongoose';
export declare enum MasteryLevel {
    UNKNOWN = "UNKNOWN",
    WEAK = "WEAK",
    DEVELOPING = "DEVELOPING",
    MASTERED = "MASTERED"
}
export interface IMasteryRecord extends Document {
    student: mongoose.Types.ObjectId;
    topic: mongoose.Types.ObjectId;
    learningObjective?: mongoose.Types.ObjectId;
    score: number;
    level: MasteryLevel;
    confidence: number;
}
export declare const MasteryRecord: mongoose.Model<IMasteryRecord, {}, {}, {}, Document<unknown, {}, IMasteryRecord, {}, mongoose.DefaultSchemaOptions> & IMasteryRecord & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMasteryRecord>;
export interface IStudentLearningProfile extends Document {
    student: mongoose.Types.ObjectId;
    recentActivity: mongoose.Types.ObjectId[];
    currentFocusSubject: mongoose.Types.ObjectId;
    detectedMisconceptions: string[];
}
export declare const StudentLearningProfile: mongoose.Model<IStudentLearningProfile, {}, {}, {}, Document<unknown, {}, IStudentLearningProfile, {}, mongoose.DefaultSchemaOptions> & IStudentLearningProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStudentLearningProfile>;
export interface IRecommendation extends Document {
    student: mongoose.Types.ObjectId;
    recommendedTopic: mongoose.Types.ObjectId;
    actionType: 'LEARN' | 'PRACTICE' | 'REVISE' | 'ASSESS';
    reason: string;
    isActive: boolean;
}
export declare const Recommendation: mongoose.Model<IRecommendation, {}, {}, {}, Document<unknown, {}, IRecommendation, {}, mongoose.DefaultSchemaOptions> & IRecommendation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRecommendation>;
//# sourceMappingURL=intelligence.model.d.ts.map