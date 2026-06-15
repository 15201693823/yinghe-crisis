export const config = {
  runtime: 'edge',
};

const BOT_ID = '7651497078316810240';
const COZE_API = 'https://api.coze.cn/v3/chat';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { token, user_id, conversation_id, message } = body || {};

  if (!token || !message) {
    return new Response(JSON.stringify({ error: 'Missing token or message' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestBody = {
      bot_id: BOT_ID,
      user_id: user_id || 'player_default',
      stream: true,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: message,
          content_type: 'text',
        },
      ],
    };

    if (conversation_id) {
      requestBody.conversation_id = conversation_id;
    }

    const response = await fetch(COZE_API, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return new Response(
        JSON.stringify({ error: 'Coze API error', detail: errText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let answer = '';
    let chatId = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        try {
          const data = JSON.parse(line.slice(5).trim());
          if (data.id && !chatId) chatId = data.id;
          if (data.data && data.data.id && !chatId) chatId = data.data.id;
          if (data.type === 'answer' && data.content) {
            answer += data.content;
          }
          if (data.messages) {
            for (const msg of data.messages) {
              if (msg.role === 'assistant' && msg.type === 'answer' && msg.content) {
                answer = msg.content;
              }
            }
          }
        } catch (e) {
          // skip
        }
      }
    }

    if (buffer && buffer.startsWith('data:')) {
      try {
        const data = JSON.parse(buffer.slice(5).trim());
        if (data.messages) {
          for (const msg of data.messages) {
            if (msg.role === 'assistant' && msg.type === 'answer' && msg.content) {
              answer = msg.content;
            }
          }
        }
      } catch (e) {
        // skip
      }
    }

    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          id: chatId,
          messages: answer
            ? [{ role: 'assistant', type: 'answer', content: answer }]
            : [],
          status: 'completed',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', detail: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
