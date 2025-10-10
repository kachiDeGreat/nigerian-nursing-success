// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the API key from environment variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface ExplanationRequest {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
}

// Fallback function remains the same
const generateFallbackExplanation = (request: ExplanationRequest): string => {
  const { correctAnswer, userAnswer } = request;
  let explanation = `The correct answer is "${correctAnswer}" because it aligns with established nursing protocols and best practices. `;
  if (userAnswer && userAnswer !== "No answer selected") {
    explanation += `Your selected answer "${userAnswer}" may not fully address the clinical scenario described in the question. `;
  }
  explanation += `Remember to review the fundamental principles related to this topic and consider the most evidence-based approach in similar clinical situations.`;
  return explanation;
};

export const generateExplanationWithFallback = async (
  request: ExplanationRequest
): Promise<string> => {
  // ✅ CORRECTED: Use the latest, stable model names.
  // "gemini-1.5-flash-latest" is faster and more cost-effective for this task.
  const modelsToTry = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
As a nursing educator, explain why the correct answer is right and why the selected answer is wrong. Be concise but educational.

QUESTION: ${request.question}

OPTIONS:
${request.options
  .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
  .join("\n")}

CORRECT ANSWER: ${request.correctAnswer}
USER'S SELECTED ANSWER: ${request.userAnswer}

Please provide:
1. Why the correct answer is right (2-3 sentences)
2. Why the selected answer is wrong (1-2 sentences)
3. Key learning point (1 sentence)

Format as a short educational explanation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`Model ${modelName} failed, trying next...`, error); // Log the actual error for better debugging
      continue;
    }
  }

  // If all models fail, use fallback
  console.error("All Gemini models failed. Using fallback explanation.");
  return generateFallbackExplanation(request);
};
