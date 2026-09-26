import mongoose, { Document } from 'mongoose';
export declare enum Role {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER"
}
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export interface IStudentProfile extends Document {
    user: mongoose.Types.ObjectId;
    learningGoal: string;
    studyTimeAvailability: number;
    learningPreferences: string[];
}
export declare const StudentProfile: mongoose.Model<IStudentProfile, {}, {}, {}, Document<unknown, {}, IStudentProfile, {}, mongoose.DefaultSchemaOptions> & IStudentProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStudentProfile>;
export interface ITeacherProfile extends Document {
    user: mongoose.Types.ObjectId;
    subjectsTaught: mongoose.Types.ObjectId[];
}
export declare const TeacherProfile: mongoose.Model<ITeacherProfile, {}, {}, {}, Document<unknown, {}, ITeacherProfile, {}, mongoose.DefaultSchemaOptions> & ITeacherProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITeacherProfile>;
//# sourceMappingURL=user.model.d.ts.map