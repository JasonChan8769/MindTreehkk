export default async function handler(req, res) {
  // 1. 設定 CORS (允許網頁呼叫)
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

    // 【關鍵修正】加入你擁有的所有模型，並優先嘗試 2.5
    // 程式會自動一個接一個試，直到成功為止
    const modelsToTry = [
      'gemini-2.5-flash',          // 優先嘗試
      'gemini-2.0-flash-exp',      // 備用
      'gemini-1.5-flash',          // 備用
      'gemini-1.5-flash-latest',   // 備用
      'gemini-1.5-pro',            // 備用
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

        if (response.ok) {
          console.log(`✅ Success using: ${model}`);
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
