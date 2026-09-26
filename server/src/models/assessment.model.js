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
exports.Answer = exports.AssessmentAttempt = exports.Assessment = exports.Question = exports.QuestionType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["SHORT_ANSWER"] = "SHORT_ANSWER";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
const QuestionSchema = new mongoose_1.Schema({
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    learningObjective: { type: mongoose_1.Schema.Types.ObjectId, ref: 'LearningObjective' },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    difficulty: { type: Number, default: 5 },
    content: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    hints: [{ type: String }],
    misconceptionTags: [{ type: String }]
}, { timestamps: true });
exports.Question = mongoose_1.default.model('Question', QuestionSchema);
const AssessmentSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    subject: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject' },
    questions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Question' }],
    isDiagnostic: { type: Boolean, default: false }
}, { timestamps: true });
exports.Assessment = mongoose_1.default.model('Assessment', AssessmentSchema);
const AssessmentAttemptSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    assessment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    score: { type: Number, default: 0 },
    completedAt: { type: Date }
}, { timestamps: true });
exports.AssessmentAttempt = mongoose_1.default.model('AssessmentAttempt', AssessmentAttemptSchema);
const AnswerSchema = new mongoose_1.Schema({
    attempt: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AssessmentAttempt', required: true },
    question: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Question', required: true },
    studentAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 }
}, { timestamps: true });
exports.Answer = mongoose_1.default.model('Answer', AnswerSchema);
//# sourceMappingURL=assessment.model.js.map