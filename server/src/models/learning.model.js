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
exports.TeacherIntervention = exports.RevisionItem = exports.LearningSession = exports.LearningPath = exports.LearningPathNode = exports.NodeState = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var NodeState;
(function (NodeState) {
    NodeState["LOCKED"] = "LOCKED";
    NodeState["RECOMMENDED"] = "RECOMMENDED";
    NodeState["CURRENT"] = "CURRENT";
    NodeState["IN_PROGRESS"] = "IN_PROGRESS";
    NodeState["COMPLETED"] = "COMPLETED";
    NodeState["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
    NodeState["MASTERED"] = "MASTERED";
    NodeState["SKIPPED"] = "SKIPPED";
})(NodeState || (exports.NodeState = NodeState = {}));
const LearningPathNodeSchema = new mongoose_1.Schema({
    path: { type: mongoose_1.Schema.Types.ObjectId, ref: 'LearningPath', required: true },
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    state: { type: String, enum: Object.values(NodeState), default: NodeState.LOCKED },
    order: { type: Number, required: true }
}, { timestamps: true });
exports.LearningPathNode = mongoose_1.default.model('LearningPathNode', LearningPathNodeSchema);
const LearningPathSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.LearningPath = mongoose_1.default.model('LearningPath', LearningPathSchema);
const LearningSessionSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    selfReportedDifficulty: { type: Number }
}, { timestamps: true });
exports.LearningSession = mongoose_1.default.model('LearningSession', LearningSessionSchema);
const RevisionItemSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    lastStudied: { type: Date, required: true },
    revisionPriority: { type: String, enum: ['HIGH', 'NORMAL', 'LOW'], required: true },
    recommendedRevisionDate: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' }
}, { timestamps: true });
exports.RevisionItem = mongoose_1.default.model('RevisionItem', RevisionItemSchema);
const TeacherInterventionSchema = new mongoose_1.Schema({
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    targetTopic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    studentsAffected: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    recommendationNote: { type: String, required: true },
    isApplied: { type: Boolean, default: false }
}, { timestamps: true });
exports.TeacherIntervention = mongoose_1.default.model('TeacherIntervention', TeacherInterventionSchema);
//# sourceMappingURL=learning.model.js.map