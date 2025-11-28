export default async function handler(req, res) {
  // 1. 設定 CORS 允許跨域請求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 處理 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 取得 API Key
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Config Error: API Key missing' });
  }

  try {
    const { history, systemInstruction } = req.body;

    // 【修正】將模型改為 gemini-1.5-flash，這是最穩定的版本
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: history,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.7,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Google API Error');
    }

    // 4. 回傳結果
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
