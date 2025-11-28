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

  // 2. 取得 Key
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server Error: API Key is missing in Vercel Env Vars' });
  }

  try {
    const { history, systemInstruction } = req.body;

    // 【終極修正】使用 gemini-1.5-flash
    // 這是目前 Google 主推的免費模型，如果這個也不行，那肯定是 API 沒開通
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
      // 捕捉詳細錯誤
      const errorMsg = data.error?.message || response.statusText;
      console.error('Google API Error:', errorMsg);
      throw new Error(errorMsg);
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
