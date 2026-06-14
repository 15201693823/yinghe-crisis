// ============================================================
// Coze API 对接层 - 连接前端与Coze工作流
// ============================================================

class CozeBridge {
    constructor() {
        // 从URL参数读取配置
        const params = new URLSearchParams(window.location.search);
        this.botId = params.get('bot_id') || '';
        this.apiToken = params.get('token') || '';
        this.proxyUrl = params.get('proxy') || '';  // 可选CORS代理
        this.apiUrl = this.proxyUrl || 'https://api.coze.cn/v3/chat';
        this.userId = 'player_' + Math.random().toString(36).substr(2, 8);
        this.isConnected = !!(this.botId && this.apiToken);
        this.conversationId = {};  // npcId -> conversation_id
        
        if (this.isConnected) {
            console.log('[CozeBridge] 已配置，Bot ID:', this.botId);
        } else {
            console.log('[CozeBridge] 未配置，使用本地对话');
        }
    }

    // ---- 配置 ----
    configure(config) {
        this.botId = config.botId || this.botId;
        this.apiToken = config.apiToken || this.apiToken;
        this.proxyUrl = config.proxyUrl || this.proxyUrl;
        this.apiUrl = this.proxyUrl || 'https://api.coze.cn/v3/chat';
        this.isConnected = !!(this.botId && this.apiToken);
    }

    // ---- 通用API调用 ----
    async callAPI(type, payload) {
        if (!this.isConnected) {
            console.warn('[CozeBridge] 未配置，使用本地回退');
            return null;
        }

        const message = JSON.stringify({ type, payload });
        const npcId = payload.npc_id || 'unknown';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bot_id: this.botId,
                    user_id: this.userId,
                    stream: false,
                    auto_save_history: true,
                    conversation_id: this.conversationId[npcId] || undefined,
                    additional_messages: [{
                        role: 'user',
                        content: message,
                        content_type: 'text'
                    }]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn('[CozeBridge] API返回错误:', response.status);
                return null;
            }

            const data = await response.json();
            
            // 保存conversation_id用于后续对话
            if (data.data?.id) {
                this.conversationId[npcId] = data.data.id;
            }

            // 从Coze响应中提取JSON
            const content = this.extractContent(data);
            return this.parseJSON(content);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('[CozeBridge] API调用超时');
            } else {
                console.warn('[CozeBridge] API调用失败:', error.message);
            }
            return null;
        }
    }

    // ---- 提取Coze响应内容 ----
    extractContent(data) {
        // Coze v3 API 响应格式
        if (data.data) {
            // 非流式响应
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
            // 尝试直接解析
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
            return null;
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
        if (!this.botId || !this.apiToken) {
            console.log('[CozeBridge] 缺少bot_id或token');
            this.isConnected = false;
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
            console.log('[CozeBridge] 连接测试:', this.isConnected ? '成功' : '失败');
            return this.isConnected;
        } catch (e) {
            this.isConnected = false;
            console.warn('[CozeBridge] 连接失败:', e.message);
            return false;
        }
    }
}

// 全局实例
window.cozeBridge = new CozeBridge();
