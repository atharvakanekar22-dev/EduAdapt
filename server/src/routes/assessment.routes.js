"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessment_controller_1 = require("../controllers/assessment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', assessment_controller_1.getAssessments);
router.get('/:id', assessment_controller_1.getAssessmentById);
router.post('/:assessmentId/submit', assessment_controller_1.submitAssessment);
exports.default = router;
//# sourceMappingURL=assessment.routes.js.map