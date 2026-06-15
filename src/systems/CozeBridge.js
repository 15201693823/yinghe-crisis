// ============================================================
// Coze API 对接层 - 通过Vercel代理连接Coze工作流
// ============================================================

class CozeBridge {
    constructor() {
        // 从URL参数读取配置
        const params = new URLSearchParams(window.location.search);
        this.botId = params.get('bot_id') || '7651497078316810240';
        this.apiToken = params.get('token') || '';
        // 代理地址 - Vercel serverless function
        this.proxyUrl = params.get('proxy') || 'https://coze-proxy-eta.vercel.app/api/chat';
        this.userId = 'player_' + Math.random().toString(36).substr(2, 8);
        this.isConnected = !!(this.botId && this.apiToken);
        this.conversationId = {};  // npcId -> conversation_id
        
        if (this.isConnected) {
            console.log('[CozeBridge] 已配置，Bot ID:', this.botId, '代理:', this.proxyUrl);
        } else {
            console.log('[CozeBridge] 未配置token，使用本地对话');
        }
    }

    // ---- 配置 ----
    configure(config) {
        this.botId = config.botId || this.botId;
        this.apiToken = config.apiToken || this.apiToken;
        this.proxyUrl = config.proxyUrl || this.proxyUrl;
        this.isConnected = !!(this.botId && this.apiToken);
    }

    // ---- 通用API调用（通过代理） ----
    async callAPI(type, payload) {
        const callId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        console.log(`[CozeBridge][${callId}] 调用 type=${type}, npc=${payload.npc_id || 'n/a'}`);

        if (!this.isConnected) {
            console.warn(`[CozeBridge][${callId}] ⚠️ 未配置token，回退本地对话`);
            return null;
        }

        const message = JSON.stringify({ type, payload });
        const npcId = payload.npc_id || 'unknown';
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.warn(`[CozeBridge][${callId}] ⏱️ 请求超时(25s)，已中止`);
                controller.abort();
            }, 25000);

            const body = {
                token: this.apiToken,
                user_id: this.userId,
                conversation_id: this.conversationId[npcId] || undefined,
                message: message
            };

            console.log(`[CozeBridge][${callId}] 📡 POST ${this.proxyUrl}`);

            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.warn(`[CozeBridge][${callId}] ❌ HTTP ${response.status}:`, errData);
                this.lastError = `HTTP ${response.status}`;
                return null;
            }

            const data = await response.json();
            const elapsed = Date.now() - startTime;
            console.log(`[CozeBridge][${callId}] ✅ 响应 (${elapsed}ms) keys:`, Object.keys(data || {}));

            if (data.error) {
                console.warn(`[CozeBridge][${callId}] ❌ 代理错误:`, data.error);
                this.lastError = data.error;
                return null;
            }

            // 保存conversation_id用于后续对话
            if (data.data?.id) {
                this.conversationId[npcId] = data.data.id;
            }

            // 从Coze响应中提取JSON
            const content = this.extractContent(data);
            return this.parseJSON(content);

        } catch (error) {
            const elapsed = Date.now() - startTime;
            if (error.name === 'AbortError') {
                console.warn(`[CozeBridge][${callId}] ⏱️ 调用超时 (${elapsed}ms)，回退本地对话`);
                this.lastError = '请求超时';
            } else {
                console.warn(`[CozeBridge][${callId}] ❌ 调用失败 (${elapsed}ms):`, error.message);
                this.lastError = error.message;
            }
            // 重要：始终返回null让上层走本地fallback
            return null;
        }
    }

    // ---- 提取Coze响应内容 ----
    extractContent(data) {
        // Coze v3 API 非流式响应格式
        if (data.data) {
            const messages = data.data.messages || [];
            const answerMsg = messages.find(m => m.role === 'assistant' && m.type === 'answer');
            if (answerMsg) return answerMsg.content;
        }
        // 旧格式兼容
        if (data.messages) {
            const answerMsg = data.messages.find(m => m.role === 'assistant' && m.type === 'answer');
            if (answerMsg) return answerMsg.content;
        }
        if (data.output && data.output.text) {
            return data.output.text;
        }
        return JSON.stringify(data);
    }

    // ---- 安全解析JSON ----
    parseJSON(content) {
        try {
            return JSON.parse(content);
        } catch (e) {
            // 尝试提取JSON块
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                try { return JSON.parse(jsonMatch[1]); } catch (e2) {}
            }
            // 尝试找{...}
            const braceMatch = content.match(/\{[\s\S]*\}/);
            if (braceMatch) {
                try { return JSON.parse(braceMatch[0]); } catch (e3) {}
            }
            console.warn('[CozeBridge] 无法解析JSON:', content);
            // 返回纯文本作为回复
            return { reply: content, intimacy_change: 0, attitude_signal: 'neutral' };
        }
    }

    // ---- NPC对话 ----
    async dialogue(npcId, playerMessage, economyState, intimacy, history) {
        const result = await this.callAPI('dialogue', {
            npc_id: npcId,
            player_message: playerMessage,
            economy_state: economyState,
            intimacy: intimacy,
            conversation_history: history
        });

        if (result) {
            return {
                reply: result.reply || result.content || '...',
                intimacy_change: result.intimacy_change || 0,
                attitude_signal: result.attitude_signal || 'neutral'
            };
        }
        return null;
    }

    // ---- 决策卡生成 ----
    async generateCards(economyState, turn, chapter, flags, recentDecisions) {
        const result = await this.callAPI('card', {
            economy_state: economyState,
            turn: turn,
            chapter: chapter,
            active_flags: flags,
            recent_decisions: recentDecisions
        });

        if (result && result.cards) {
            return result.cards;
        }
        return null;
    }

    // ---- 经济引擎 ----
    async advanceEconomy(currentState, decisionEffects, tradeLog) {
        const result = await this.callAPI('economy', {
            current_state: currentState,
            decision_effects: decisionEffects,
            player_trade_log: tradeLog
        });

        if (result) {
            return result;
        }
        return null;
    }

    // ---- 连接状态检测 ----
    async testAndConnect() {
        console.log('[CozeBridge] 开始连接测试...');
        console.log(`[CozeBridge] botId: ${this.botId ? '已配置' : '未配置'}, token: ${this.apiToken ? '已配置' : '未配置'}, proxy: ${this.proxyUrl}`);

        if (!this.apiToken) {
            console.log('[CozeBridge] ⚠️ 缺少token，使用本地对话');
            this.isConnected = false;
            this.lastError = '缺少token';
            return false;
        }
        
        try {
            const result = await this.callAPI('dialogue', {
                npc_id: 'ajie',
                player_message: '你好',
                economy_state: '{}',
                intimacy: 0,
                conversation_history: '[]'
            });
            this.isConnected = !!result;
            if (this.isConnected) {
                console.log('[CozeBridge] ✅ 连接测试成功：AI NPC对话已启用');
                this.lastError = null;
            } else {
                console.warn(`[CozeBridge] ⚠️ 连接测试失败: ${this.lastError || '未知错误'}，使用本地对话`);
            }
            return this.isConnected;
        } catch (e) {
            this.isConnected = false;
            this.lastError = e.message;
            console.warn('[CozeBridge] ❌ 连接失败:', e.message);
            return false;
        }
    }
}

// 全局实例
window.cozeBridge = new CozeBridge();
