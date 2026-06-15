// Vercel Serverless Function - Coze API 代理（流式模式）
// 解决浏览器CORS跨域限制 + 隐藏Token

const BOT_ID = '7651497078316810240';
const COZE_API = 'https://api.coze.cn/v3/chat';

export default async function handler(req, res) {
    // CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        const body = {
            bot_id: BOT_ID,
            user_id: user_id || 'player_default',
            stream: true,  // 流式模式更可靠
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

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

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.error('[Proxy] Coze API error:', response.status, errText);
            return res.status(response.status).json({ error: 'Coze API error', detail: errText });
        }

        // 收集SSE流式响应中的answer内容
        const contentType = response.headers.get('content-type') || '';
        let answer = '';
        let chatId = '';
        let isCompleted = false;

        if (contentType.includes('text/event-stream') || contentType.includes('stream')) {
            // 解析SSE流
            const text = await response.text();
            const lines = text.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('event:conversation.chat.completed')) {
                    isCompleted = true;
                }
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.slice(5).trim());
                        // 提取chat id
                        if (data.id && !chatId) chatId = data.id;
                        // 提取assistant answer内容
                        if (data.type === 'answer' && data.content) {
                            answer += data.content;
                        }
                        // completed事件中也有messages
                        if (data.messages) {
                            for (const msg of data.messages) {
                                if (msg.role === 'assistant' && msg.type === 'answer' && msg.content) {
                                    answer = msg.content; // completed里的更完整
                                }
                            }
                        }
                        if (data.data?.id && !chatId) chatId = data.data.id;
                    } catch (e) {
                        // 忽略非JSON行
                    }
                }
            }
        } else {
            // 非流式响应
            const data = await response.json();
            if (data.data?.id) chatId = data.data.id;
            const messages = data.data?.messages || [];
            const answerMsg = messages.find(m => m.role === 'assistant' && m.type === 'answer');
            if (answerMsg) answer = answerMsg.content;
        }

        // 返回统一格式
        return res.status(200).json({
            code: 0,
            data: {
                id: chatId,
                messages: answer ? [{ role: 'assistant', type: 'answer', content: answer }] : [],
                status: isCompleted ? 'completed' : 'in_progress'
            }
        });

    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: 'Coze API timeout' });
        }
        return res.status(500).json({ error: 'Proxy error', detail: error.message });
    }
}
