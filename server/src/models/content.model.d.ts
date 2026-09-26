import mongoose, { Document } from 'mongoose';
export interface ISubject extends Document {
    name: string;
    description: string;
    isActive: boolean;
}
export declare const Subject: mongoose.Model<ISubject, {}, {}, {}, Document<unknown, {}, ISubject, {}, mongoose.DefaultSchemaOptions> & ISubject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubject>;
export interface ITopic extends Document {
    subject: mongoose.Types.ObjectId;
    name: string;
    description: string;
    order: number;
    difficulty: number;
    estimatedDuration: number;
}
export declare const Topic: mongoose.Model<ITopic, {}, {}, {}, Document<unknown, {}, ITopic, {}, mongoose.DefaultSchemaOptions> & ITopic & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITopic>;
export interface ILearningObjective extends Document {
    topic: mongoose.Types.ObjectId;
    code: string;
    description: string;
}
export declare const LearningObjective: mongoose.Model<ILearningObjective, {}, {}, {}, Document<unknown, {}, ILearningObjective, {}, mongoose.DefaultSchemaOptions> & ILearningObjective & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILearningObjective>;
export interface IPrerequisite extends Document {
    topic: mongoose.Types.ObjectId;
    prerequisiteTopic: mongoose.Types.ObjectId;
    isRequired: boolean;
}
export declare const Prerequisite: mongoose.Model<IPrerequisite, {}, {}, {}, Document<unknown, {}, IPrerequisite, {}, mongoose.DefaultSchemaOptions> & IPrerequisite & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPrerequisite>;
//# sourceMappingURL=content.model.d.ts.map