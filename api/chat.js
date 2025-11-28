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

    // 【關鍵更新】擴充模型列表，包含所有可能的版本號
    // 程式會依序嘗試，直到找到你的 Key 能用的那個
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.0-pro',
      'gemini-pro'
    ];

    let lastError = null;
    let successModel = '';

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
