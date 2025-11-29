import { Message } from '../types';

// 前端服務：負責將訊息發送給我們自己的後端 API (/api/chat)
// 這樣可以避免直接連線 Google 導致的地區限制 (404/403)

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
    
    // 轉換歷史訊息格式
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.isUser ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // 呼叫後端 API (/api/chat)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: recentHistory,
        systemInstruction: systemInstruction
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server Error: ${response.status}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || (lang === 'zh' ? "抱歉，我暫時連線唔到，請稍後再試。" : "Connection error.");

  } catch (error: any) {
    console.error("Proxy API Error:", error);
    return `[系統訊息] 連線錯誤: ${error.message}`;
  }
};
