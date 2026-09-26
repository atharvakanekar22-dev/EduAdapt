import mongoose, { Schema, Document } from 'mongoose';

export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), required: true }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  learningGoal: string;
  studyTimeAvailability: number; // hours per week
  learningPreferences: string[]; // e.g., 'Visual', 'Practice-first'
}

const StudentProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  learningGoal: { type: String, default: '' },
  studyTimeAvailability: { type: Number, default: 0 },
  learningPreferences: [{ type: String }]
}, { timestamps: true });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

export interface ITeacherProfile extends Document {
  user: mongoose.Types.ObjectId;
  subjectsTaught: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
}

const TeacherProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjectsTaught: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const TeacherProfile = mongoose.model<ITeacherProfile>('TeacherProfile', TeacherProfileSchema);
