import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

// 1. 從環境變數讀取 API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. 初始化 AI
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

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
  if (!apiKey) {
    return lang === 'zh' 
      ? "[系統錯誤] 找不到 API Key。請檢查 Vercel 設定。" 
      : "System Error: API Key missing.";
  }

  try {
    const systemInstruction = SYSTEM_PROMPTS[lang];
    
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // 【重要修改】使用 gemini-1.5-pro (目前最強穩定版)
    // 如果未來 Gemini 3 上線，你只需要將下方的 'gemini-1.5-pro' 改成 'gemini-3.0-pro' 即可
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro', 
      contents: recentHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Empty response from AI";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // --- 除錯模式 ---
    const errorMessage = error.message || JSON.stringify(error);
    
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return `[除錯模式] 找不到模型 (404)。你嘗試使用的模型名稱可能不存在或無權限。目前已設定為 gemini-1.5-pro。`;
    }
    
    if (errorMessage.includes("403") || errorMessage.includes("permission")) {
      return `[除錯模式] 權限不足 (403)。請確認 API Key 是否有 IP/Referrer 限制，或該服務在目前地區(如香港)不可用。`;
    }

    return `[除錯模式] 連線錯誤: ${errorMessage}`;
  }
};