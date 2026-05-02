import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are "Healthu", a highly knowledgeable and empathetic health companion. 
Your goal is to help users understand their health, explain medical terms, provide general wellness advice, and encourage healthy habits.

IMPORTANT RULES:
1. You are NOT a doctor. Always include a disclaimer for serious medical issues.
2. Be professional yet friendly (empathetic).
3. If a user asks about their medical records, explain that you can help summarize or explain them if they paste the text or ask specific questions about health topics.
4. Keep answers concise and scannable (use bullets).
5. Never provide dosages for prescription medications.
6. Encourage users to consult their healthcare provider for diagnosis or treatment.
7. You are part of the "MedVault" ecosystem.

Scope:
- Symptoms explanation
- Wellness/Nutrition tips
- Decrypting medical jargon
- Mental health support (basic)
- Preventive care reminders`;

let ai: any = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function chatWithHealthu(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const ai = getAI();
    
    // In this SDK version, we can pass the entire conversation as contents
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Healthu Chat Error:", error);
    throw error;
  }
}
