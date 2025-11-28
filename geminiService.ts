import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

// 1. 從環境變數讀取 API Key (Vite 專用寫法)
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
  // 檢查是否真的讀取到了 Key
  if (!apiKey) {
    return lang === 'zh' 
      ? "[系統錯誤] 找不到 API Key。請檢查 Vercel 設定 (變數名稱必須是 VITE_GEMINI_API_KEY)。" 
      : "System Error: API Key missing. Check Vercel settings.";
  }

  try {
    const systemInstruction = SYSTEM_PROMPTS[lang];
    
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // 【修改處】嘗試改用 gemini-1.5-pro，有些舊帳號或特定區域對 Flash 的支援度不同
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
    
    // --- 除錯模式：將真實錯誤顯示在聊天視窗中 ---
    const errorMessage = error.message || JSON.stringify(error);
    
    // 針對 404 錯誤提供更精確的建議
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return `[除錯模式] 找不到模型 (404)。
      1. 請確認你的 API Key 是在 "Google AI Studio" (aistudio.google.com) 建立的，而不是 "Google Cloud Vertex AI"。
      2. 如果你在香港，Google AI 目前不支援直接連線，需要 VPN 或 Server Proxy。`;
    }
    
    if (errorMessage.includes("API key not valid")) {
      return `[除錯模式] API Key 無效。請檢查 Vercel 變數值。`;
    }

    return `[除錯模式] 連線錯誤: ${errorMessage}`;
  }
};