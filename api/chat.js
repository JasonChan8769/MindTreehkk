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

  // 2. 取得 API Key
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API Key is missing.' });
  }

  try {
    const { history, systemInstruction } = req.body;

    // 【客製化更新】根據你的 API 列表，優先使用 2.5 和 2.0 系列
    const modelsToTry = [
      'gemini-2.5-flash',          // 列表 index 2
      'gemini-2.0-flash',          // 列表 index 7
      'gemini-2.0-flash-001',      // 列表 index 8
      'gemini-flash-latest',       // 列表 index 29 (自動指向最新版)
      'gemini-2.0-flash-lite',     // 列表 index 11 (輕量版)
      'gemini-1.5-flash'           // 備用
    ];

    let lastError = null;

    // 3. 自動迴圈嘗試
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

        if (response.ok) {
          console.log(`✅ Success with model: ${model}`);
          return res.status(200).json(data);
        }

        console.warn(`Model ${model} failed:`, data.error?.message);
        lastError = data.error?.message;

      } catch (err) {
        lastError = err.message;
      }
    }

    throw new Error(`All models failed. Last error: ${lastError}`);

  } catch (error) {
    console.error('Proxy Final Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
