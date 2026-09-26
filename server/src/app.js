"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const assessment_routes_1 = __importDefault(require("./routes/assessment.routes"));
const learning_routes_1 = __importDefault(require("./routes/learning.routes"));
const tutor_routes_1 = __importDefault(require("./routes/tutor.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/assessments', assessment_routes_1.default);
app.use('/api/learning', learning_routes_1.default);
app.use('/api/tutor', tutor_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/teacher', teacher_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map