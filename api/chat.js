export default async function handler(req, res) {
  // 1. 設定 CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 取得 API Key (請確保你在 Vercel 環境變數中已經更新了這把新鑰匙)
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API Key is missing. Please check Vercel Environment Variables.' });
  }

  try {
    const { history, systemInstruction } = req.body;

    // 定義模型列表：包含最新的 Flash 版本
    // 系統會依序嘗試，直到成功為止
    const modelsToTry = [
      'gemini-1.5-flash',          // 最穩定/付費版通常是這個
      'gemini-1.5-flash-latest',   // 強制使用最新版
      'gemini-2.0-flash-exp',      // 最新的 2.0 實驗版
      'gemini-1.5-pro',            // 備用：Pro 版本
      'gemini-1.0-pro'             // 備用：舊版
    ];

    let lastError = null;

    // 3. 自動迴圈嘗試所有模型
    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}...`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: history,
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: { temperature: 0.7 }
            }),
          }
        );

        const data = await response.json();

        // 如果成功，直接回傳結果
        if (response.ok) {
          return res.status(200).json(data);
        }

        console.warn(`Model ${model} failed:`, data.error?.message);
        lastError = data.error?.message || response.statusText;

      } catch (err) {
        console.warn(`Model ${model} network error:`, err.message);
        lastError = err.message;
      }
    }

    // 4. 如果全部都失敗了
    throw new Error(`All models failed. Please check your API Key permissions. Last error: ${lastError}`);

  } catch (error) {
    console.error('Proxy Final Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
