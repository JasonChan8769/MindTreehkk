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

    // 【修正】改用最通用的 'gemini-pro' (1.0 版本)
    // 這可以解決 'model not found' 的問題，確保先能連線成功
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: history,
          // 注意：gemini-pro 1.0 的 systemInstruction 格式略有不同，
          // 但 v1beta 為了相容性通常能接受，或是我們將其合併到 history 的第一條
          contents: [
            { role: 'user', parts: [{ text: systemInstruction }] }, // 將系統提示作為第一條訊息
            ...history
          ],
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
