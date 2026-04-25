
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const CLEAN_OUTPUT_INSTRUCTION = "Output only clean, organized plain text. Do not use any markdown symbols like asterisks (*), hashtags (#), or backticks. Use clear paragraph breaks for organization. If you need bullets, use a simple dash (-) or clear numbering (1.). Avoid any special symbols or formatting markers.";

export const explainLesson = async (lesson: string, level: 'beginner' | 'intermediate' | 'advanced') => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Instruction: ${CLEAN_OUTPUT_INSTRUCTION}\n\nTask: Explain the following lesson in ${level} terms: ${lesson}. Make it engaging and easy to understand. Organize it into clear sections with simple headings (no markdown symbols).`,
  });
  return response.text;
};

export const generateSummary = async (content: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Instruction: ${CLEAN_OUTPUT_INSTRUCTION}\n\nTask: Summarize the following content in 3-5 clear points: ${content}. Use simple dashes (-) for points.`,
  });
  return response.text;
};

export const generateQuiz = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 3-question multiple choice quiz about ${topic}. Return it in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateStudyPlan = async (subjects: string[], weaknesses: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a weekly study plan for a student who is strong in ${subjects.join(', ')} but struggles with ${weaknesses.join(', ')}. Include short tasks, video suggestions, and practice questions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["video", "practice", "reading"] },
                duration: { type: Type.STRING }
              },
              required: ["title", "type", "duration"]
            }
          }
        },
        required: ["title", "tasks"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
