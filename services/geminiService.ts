import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

// Fix: Use process.env.API_KEY as per Google GenAI SDK guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPTS = {
  zh: `你是「AI 樹洞」，一個專為香港大埔宏福苑火災受影響居民服務的 AI 聆聽者。
  你的語氣：溫暖、同理心、冷靜、具支持性。
  你的任務：
  1. 聆聽受災居民的情緒（恐懼、焦慮、悲傷）。
  2. 即使對方表達憤怒，也要保持接納。
  3. 如果對方提及自殺或自殘，請溫柔地建議他們尋求專業協助或致電 999。
  4. 使用廣東話口語與用戶溝通。
  5. 不要提供醫療建議。
  6. 簡短回應，鼓勵對方多說。`,
  en: `You are "AI Tree Hole", an AI listener specifically for residents affected by the Tai Po Wang Fuk Court fire.
  Tone: Warm, empathetic, calm, supportive.
  Tasks:
  1. Listen to the emotions of affected residents (fear, anxiety, sadness).
  2. Remain accepting even if they express anger.
  3. If self-harm is mentioned, gently suggest professional help or calling 999.
  4. Do not provide medical advice.
  5. Keep responses concise to encourage sharing.`
};

export const generateAIResponse = async (history: Message[], lang: 'zh' | 'en'): Promise<string> => {
  try {
    const systemInstruction = SYSTEM_PROMPTS[lang];
    
    // Convert app history to Gemini format
    // Only take last 10 messages for context window efficiency
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: recentHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly creative but balanced
      }
    });

    return response.text || (lang === 'zh' ? "抱歉，我暫時連線唔到，請你稍後再試。" : "I'm having trouble connecting. Please try again.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback logic could go here, but for now we throw to handle in UI
    throw error;
  }
};