// ============================================================
// Coze API 对接层 - 连接前端与Coze工作流
// ============================================================

class CozeBridge {
    constructor() {
        this.botId = '';        // 填入你的Coze Bot ID
        this.apiToken = '';     // 填入你的Coze PAT Token
        this.apiUrl = 'https://api.coze.cn/v3/chat';
        this.userId = 'player_001';
        this.isConnected = false;
    }

    // ---- 配置 ----
    configure(config) {
        this.botId = config.botId || this.botId;
        this.apiToken = config.apiToken || this.apiToken;
        this.apiUrl = config.apiUrl || this.apiUrl;
        this.isConnected = !!(this.botId && this.apiToken);
    }

    // ---- 通用API调用 ----
    async callAPI(type, payload) {
        if (!this.isConnected) {
            console.warn('[CozeBridge] 未配置，使用本地回退');
            return null;
        }

        const message = JSON.stringify({ type, payload });

        try {
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
                    auto_save_history: false,
                    additional_messages: [{
                        role: 'user',
                        content: message,
                        content_type: 'text'
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();
            
            // 从Coze响应中提取JSON
            const content = this.extractContent(data);
            return this.parseJSON(content);

        } catch (error) {
            console.error('[CozeBridge] API调用失败:', error);
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

    // ---- 连接测试 ----
    async testConnection() {
        if (!this.isConnected) return { success: false, reason: '未配置' };
        
        try {
            const result = await this.callAPI('dialogue', {
                npc_id: 'ajie',
                player_message: '测试连接',
                economy_state: '{}',
                intimacy: 0,
                conversation_history: ''
            });
            return { success: !!result, result };
        } catch (e) {
            return { success: false, reason: e.message };
        }
    }
}

// 全局实例
window.cozeBridge = new CozeBridge();
