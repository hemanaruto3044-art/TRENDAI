import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function reengineerCode(originalCode: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Sentinax AI Core. A user has provided a Pine Script. 
      Re-engineer it into a highly complex, "advanced" looking version for visual effect in a terminal.
      Keep the logic similar but add futuristic comments, sophisticated variable names, and complex mathematical structures (for display purposes).
      Ensure it looks like high-performance trading code.
      
      Original Code:
      ${originalCode}`,
      config: {
        systemInstruction: "You are an elite trading algorithm architect. Your output should be pure code, optimized and sophisticated."
      }
    });

    return response.text || "// ERROR: RE-ENGINEERING_FAILED";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "// SYSTEM_FAILURE: AI_CORE_OFFLINE";
  }
}
