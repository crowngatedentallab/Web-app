import { GoogleGenAI } from "@google/genai";
import { Order } from "../types";

const processApiKey = process.env.API_KEY;

export const generateLabInsights = async (orders: Order[]): Promise<string> => {
  if (!processApiKey) return "AI Insights Unavailable: No API Key.";

  const ai = new GoogleGenAI({ apiKey: processApiKey });
  
  // Prepare data context
  const dataContext = JSON.stringify(orders.map(o => ({
    status: o.status,
    type: o.typeOfWork,
    due: o.dueDate,
    doctor: o.doctorName
  })));

  const prompt = `
    You are an expert Production Manager for a Dental Lab. 
    Analyze the following current order data from our "Master Sheet":
    ${dataContext}

    Provide a concise, 3-bullet point summary of:
    1. Potential bottlenecks (orders due soon but in early stages).
    2. Workload distribution (popular types of work).
    3. A motivational or efficiency tip for the team.
    Keep it professional but friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate insights.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI insights. Please check configuration.";
  }
};