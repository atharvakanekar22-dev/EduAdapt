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
exports.Prerequisite = exports.LearningObjective = exports.Topic = exports.Subject = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SubjectSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.Subject = mongoose_1.default.model('Subject', SubjectSchema);
const TopicSchema = new mongoose_1.Schema({
    subject: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    difficulty: { type: Number, default: 5 },
    estimatedDuration: { type: Number, default: 30 }
}, { timestamps: true });
exports.Topic = mongoose_1.default.model('Topic', TopicSchema);
const LearningObjectiveSchema = new mongoose_1.Schema({
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    code: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });
exports.LearningObjective = mongoose_1.default.model('LearningObjective', LearningObjectiveSchema);
const PrerequisiteSchema = new mongoose_1.Schema({
    topic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    prerequisiteTopic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    isRequired: { type: Boolean, default: true }
}, { timestamps: true });
exports.Prerequisite = mongoose_1.default.model('Prerequisite', PrerequisiteSchema);
//# sourceMappingURL=content.model.js.map