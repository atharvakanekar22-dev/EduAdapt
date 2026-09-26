"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const genai_1 = require("@google/genai");
class AIService {
    static ai = null;
    static getAI() {
        if (!this.ai) {
            const apiKey = process.env.AI_API_KEY;
            if (apiKey) {
                this.ai = new genai_1.GoogleGenAI({ apiKey });
            }
        }
        return this.ai;
    }
    static async getSocraticResponse(studentId, topicName, studentMessage, chatHistory) {
        const ai = this.getAI();
        // Fallback mode if API key is missing
        if (!ai) {
            return "The AI Tutor is temporarily unavailable. Please continue with guided practice.";
        }
        // Determine current mastery context
        const masteryContext = "The student is currently developing their skills in this topic.";
        const systemInstruction = `
      You are an AI Tutor for EduAdapt, designed to teach ${topicName}.
      You must follow a Socratic teaching style:
      - Ask guiding questions.
      - Identify misconceptions based on the student's input.
      - Provide hints, avoid immediately giving final answers.
      - Encourage reasoning.
      - Never fabricate facts or make psychological assessments.
      - Context: ${masteryContext}
    `;
        try {
            const chat = await ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction }
            });
            // Send the actual message
            const response = await chat.sendMessage({ message: studentMessage });
            return response.text || "I'm sorry, I couldn't process that.";
        }
        catch (error) {
            console.error("AI Service Error:", error);
            return "I'm having trouble connecting right now. Let's try again later.";
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map