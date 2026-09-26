"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("../controllers/teacher.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// Add role check middleware here (e.g. requireRole(Role.TEACHER))
router.get('/analytics', teacher_controller_1.getClassAnalytics);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map