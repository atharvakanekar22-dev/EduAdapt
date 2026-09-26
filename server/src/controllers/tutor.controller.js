"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const ai_service_1 = require("../services/ai.service");
const content_model_1 = require("../models/content.model");
const sendMessage = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { topicId, message, history } = req.body;
        const topic = await content_model_1.Topic.findById(topicId);
        const topicName = topic ? topic.name : 'a general topic';
        const responseText = await ai_service_1.AIService.getSocraticResponse(studentId, topicName, message, history);
        res.status(200).json({ text: responseText });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=tutor.controller.js.map