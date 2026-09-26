import { GoogleGenAI } from '@google/genai';
import { TutorMode } from '../models/tutor.model';

export interface StudentLearningContext {
  topicName: string;
  objectiveName?: string;
  masteryLevel: string;
  masteryScore: number;
  detectedMisconceptions: string[];
  currentQuestion?: string;
  studentAnswer?: string;
  correctAnswer?: string;
  tutorMode: TutorMode;
  allowAnswerLeakage: boolean;
}

export class AIService {
  private static ai: GoogleGenAI | null = null;

  private static getAI() {
    if (!this.ai) {
      const apiKey = process.env.AI_API_KEY;
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    }
    return this.ai;
  }

  static async getSocraticResponse(
    studentMessage: string, 
    context: StudentLearningContext,
    chatHistory: { role: string, parts: { text: string }[] }[] = []
  ): Promise<string> {
    const ai = this.getAI();
    
    // Fallback mode if API key is missing
    if (!ai) {
      if (context.tutorMode === TutorMode.EXPLAIN_MISTAKE) {
        return "Fallback Tutor: You seem to have a misconception about this topic. Please review the prerequisites.";
      }
      return "The AI Tutor is temporarily unavailable. Please continue with guided practice.";
    }

    let systemInstruction = `
You are EduAdapt's Socratic learning tutor.
Your purpose is to help the student understand and reason independently.
Do not complete assessed work for the student.
Prefer guiding questions, hints, decomposition, examples, and misconception clarification.
Never invent information about the student's progress.
Use only the learning context supplied by EduAdapt.
Encourage the student to attempt reasoning before receiving additional guidance.

### CURRENT LEARNING CONTEXT:
- Topic: ${context.topicName}
${context.objectiveName ? `- Objective: ${context.objectiveName}` : ''}
- Student's current mastery of this topic: ${context.masteryLevel} (${Math.round(context.masteryScore * 100)}%)
- Detected Misconceptions: ${context.detectedMisconceptions.length > 0 ? context.detectedMisconceptions.join(', ') : 'None'}

### TUTOR MODE: ${context.tutorMode}
`;

    if (context.tutorMode === TutorMode.SOCRATIC_HINT) {
      systemInstruction += `\nThe student is asking for a hint. Give the smallest useful conceptual hint or ask a guiding question. Do NOT reveal the direct answer.`;
    } else if (context.tutorMode === TutorMode.EXPLAIN_CONCEPT) {
      systemInstruction += `\nThe student wants to understand the concept. Explain clearly using simple examples suited to their mastery level.`;
    } else if (context.tutorMode === TutorMode.EXPLAIN_MISTAKE) {
      systemInstruction += `
The student just answered a question incorrectly.
- Question: ${context.currentQuestion || 'Unknown'}
- Student's Answer: ${context.studentAnswer || 'Unknown'}
- Correct Answer: ${context.correctAnswer || 'Unknown'}

Explain WHAT they misunderstood and WHY their reasoning failed. Give them a small follow-up question. Do not just state the correct answer.
`;
    }

    if (context.currentQuestion && !context.allowAnswerLeakage) {
      systemInstruction += `
### LEAKAGE PROTECTION:
The student is currently answering this question: "${context.currentQuestion}"
DO NOT REVEAL THE CORRECT ANSWER under any circumstances, even if they ask directly. Guide them instead.
`;
    }

    try {
      const chat = await ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction }
      });

      // Send the actual message
      const response = await chat.sendMessage({ 
        message: studentMessage,
        history: chatHistory.length > 0 ? chatHistory : undefined
      });
      return response.text || "I'm sorry, I couldn't process that.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I'm having trouble connecting right now. Let's try again later.";
    }
  }
}
