"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const learning_controller_1 = require("../controllers/learning.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/path/:subjectId', learning_controller_1.getLearningPath);
router.post('/sessions', learning_controller_1.startSession);
router.post('/sessions/:sessionId/end', learning_controller_1.endSession);
exports.default = router;
//# sourceMappingURL=learning.routes.js.map