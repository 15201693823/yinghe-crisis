// Vercel Serverless Function - Coze API 代理
// 解决浏览器CORS跨域限制 + 隐藏Token

const BOT_ID = '7651497078316810240';
const COZE_API = 'https://api.coze.cn/v3/chat';

export default async function handler(req, res) {
    // CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, user_id, conversation_id, message } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const body = {
            bot_id: BOT_ID,
            user_id: user_id || 'player_default',
            stream: false,
            auto_save_history: true,
            additional_messages: [{
                role: 'user',
                content: message,
                content_type: 'text'
            }]
        };

        if (conversation_id) {
            body.conversation_id = conversation_id;
        }

        const response = await fetch(COZE_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            console.error('[Proxy] Coze API error:', response.status, data);
            return res.status(response.status).json({ error: 'Coze API error', detail: data });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: 'Coze API timeout' });
        }
        return res.status(500).json({ error: 'Proxy error', detail: error.message });
    }
}
