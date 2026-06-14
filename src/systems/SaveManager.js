// ============================================================
// SaveManager - 本地存档管理
// ============================================================
class SaveManager {
    constructor() {
        this.saveKey = 'yinghe_save';
        this.autoSaveInterval = 30000; // 30秒自动存档
        this.timer = null;
    }

    // ---- 保存游戏 ----
    save() {
        try {
            const data = {
                version: 2,
                timestamp: Date.now(),
                player: { ...window.GAME_STATE.player },
                factionSatisfaction: { ...window.GAME_STATE.factionSatisfaction },
                flags: { ...window.GAME_STATE.flags },
                economyStatus: { ...window.GAME_STATE.economyStatus },
                currentScene: window.GAME_STATE.currentScene,
                // 关系系统
                relationships: {
                    intimacy: { ...window.GAME_STATE.relationships?.intimacy },
                    interactions: { ...window.GAME_STATE.relationships?.interactions }
                },
                // 剧情系统
                story: {
                    mainQuest: window.GAME_STATE.story?.mainQuest,
                    stage: window.GAME_STATE.story?.stage,
                    keyDecisions: window.GAME_STATE.story?.keyDecisions || [],
                    events: (window.GAME_STATE.story?.events || []).map(e => ({
                        type: e.type,
                        description: e.description,
                        time: e.time
                    })),
                    _channelHintTriggered: window.GAME_STATE.story?._channelHintTriggered
                },
                // 对话历史（最近5条）
                dialogueHistory: {}
            };

            // 保存对话历史
            if (window.GAME_STATE.dialogue?.conversationHistory) {
                for (const [npcId, history] of Object.entries(window.GAME_STATE.dialogue.conversationHistory)) {
                    data.dialogueHistory[npcId] = history.slice(-10);
                }
            }

            localStorage.setItem(this.saveKey, JSON.stringify(data));
            console.log('[Save] 存档成功', new Date().toLocaleTimeString());
            return true;
        } catch (e) {
            console.error('[Save] 存档失败:', e);
            return false;
        }
    }

    // ---- 读取存档 ----
    load() {
        try {
            const raw = localStorage.getItem(this.saveKey);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.version !== 2) {
                console.warn('[Save] 存档版本不匹配');
                return null;
            }
            console.log('[Save] 读档成功', new Date(data.timestamp).toLocaleString());
            return data;
        } catch (e) {
            console.error('[Save] 读档失败:', e);
            return null;
        }
    }

    // ---- 恢复游戏状态 ----
    restore(data) {
        if (!data) return false;
        try {
            // 恢复玩家
            Object.assign(window.GAME_STATE.player, data.player);
            Object.assign(window.GAME_STATE.factionSatisfaction, data.factionSatisfaction);
            Object.assign(window.GAME_STATE.flags, data.flags);
            Object.assign(window.GAME_STATE.economyStatus, data.economyStatus);

            // 恢复关系
            if (data.relationships && window.GAME_STATE.relationships) {
                Object.assign(window.GAME_STATE.relationships.intimacy, data.relationships.intimacy);
                Object.assign(window.GAME_STATE.relationships.interactions, data.relationships.interactions);
            }

            // 恢复剧情
            if (data.story && window.GAME_STATE.story) {
                window.GAME_STATE.story.mainQuest = data.story.mainQuest;
                window.GAME_STATE.story.stage = data.story.stage;
                window.GAME_STATE.story.keyDecisions = data.story.keyDecisions;
                window.GAME_STATE.story.events = data.story.events;
                window.GAME_STATE.story._channelHintTriggered = data.story._channelHintTriggered;
            }

            // 恢复对话历史
            if (data.dialogueHistory && window.GAME_STATE.dialogue) {
                window.GAME_STATE.dialogue.conversationHistory = data.dialogueHistory;
            }

            console.log('[Save] 状态恢复完成');
            return true;
        } catch (e) {
            console.error('[Save] 恢复失败:', e);
            return false;
        }
    }

    // ---- 检查是否有存档 ----
    hasSave() {
        return !!localStorage.getItem(this.saveKey);
    }

    // ---- 删除存档 ----
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        console.log('[Save] 存档已删除');
    }

    // ---- 启动自动存档 ----
    startAutoSave() {
        this.stopAutoSave();
        this.timer = setInterval(() => this.save(), this.autoSaveInterval);
        console.log('[Save] 自动存档已启动');
    }

    // ---- 停止自动存档 ----
    stopAutoSave() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

window.saveManager = new SaveManager();
