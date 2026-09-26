"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommendation = exports.StudentLearningProfile = exports.MasteryRecord = exports.MasteryLevel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var MasteryLevel;
(function (MasteryLevel) {
    MasteryLevel["UNKNOWN"] = "UNKNOWN";
    MasteryLevel["WEAK"] = "WEAK";
    MasteryLevel["DEVELOPING"] = "DEVELOPING";
    MasteryLevel["MASTERED"] = "MASTERED";
})(MasteryLevel || (exports.MasteryLevel = MasteryLevel = {}));
const MasteryRecordSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    learningObjective: { type: mongoose_1.Schema.Types.ObjectId, ref: 'LearningObjective' },
    score: { type: Number, required: true, default: 0 },
    level: { type: String, enum: Object.values(MasteryLevel), default: MasteryLevel.UNKNOWN },
    confidence: { type: Number, default: 0.5 }
}, { timestamps: true });
exports.MasteryRecord = mongoose_1.default.model('MasteryRecord', MasteryRecordSchema);
const StudentLearningProfileSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    recentActivity: [{ type: mongoose_1.Schema.Types.ObjectId }],
    currentFocusSubject: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject' },
    detectedMisconceptions: [{ type: String }]
}, { timestamps: true });
exports.StudentLearningProfile = mongoose_1.default.model('StudentLearningProfile', StudentLearningProfileSchema);
const RecommendationSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    recommendedTopic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    actionType: { type: String, enum: ['LEARN', 'PRACTICE', 'REVISE', 'ASSESS'], required: true },
    reason: { type: String, required: true }, // The "Why am I learning this?" explanation
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.Recommendation = mongoose_1.default.model('Recommendation', RecommendationSchema);
//# sourceMappingURL=intelligence.model.js.map