import mongoose from 'mongoose';
export declare class AdaptiveService {
    /**
     * Generates or updates the Adaptive Learning Path based on Mastery and Prerequisites.
     */
    static updateLearningPath(studentId: string, subjectId: string): Promise<mongoose.Document<unknown, {}, import("../models/learning.model").ILearningPath, {}, mongoose.DefaultSchemaOptions> & import("../models/learning.model").ILearningPath & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    static generateRecommendation(studentId: string, topicId: mongoose.Types.ObjectId, actionType: 'LEARN' | 'PRACTICE' | 'REVISE', reason: string): Promise<void>;
}
//# sourceMappingURL=adaptive.service.d.ts.map