// ============================================================
// 关系系统 - NPC亲密度管理
// ============================================================

class RelationshipSystem {
    constructor() {
        this.intimacy = {};
        this.interactions = {}; // npcId -> 交互次数

        // 初始化所有NPC亲密度为0
        for (const npcId of Object.keys(NPC_DATA)) {
            this.intimacy[npcId] = 0;
            this.interactions[npcId] = 0;
        }
    }

    // ---- 获取亲密度 ----
    getIntimacy(npcId) {
        return this.intimacy[npcId] || 0;
    }

    // ---- 修改亲密度 ----
    changeIntimacy(npcId, delta) {
        if (!this.intimacy.hasOwnProperty(npcId)) return;
        this.intimacy[npcId] = Math.max(0, Math.min(10, this.intimacy[npcId] + delta));
        
        // 检查是否触发亲密度奖励
        const npc = NPC_DATA[npcId];
        if (npc.intimacyRewards) {
            for (const [threshold, reward] of Object.entries(npc.intimacyRewards)) {
                if (this.intimacy[npcId] >= parseInt(threshold)) {
                    this.notifyReward(npcId, reward);
                }
            }
        }
    }

    // ---- 对话增加亲密度 ----
    onDialogue(npcId) {
        this.interactions[npcId] = (this.interactions[npcId] || 0) + 1;
        // 每3次对话增加1点亲密度
        if (this.interactions[npcId] % 3 === 0) {
            this.changeIntimacy(npcId, 1);
        }
    }

    // ---- 交易增加亲密度 ----
    onTrade(npcId, amount) {
        // 大额交易增加亲密度
        if (amount > 50) {
            this.changeIntimacy(npcId, 1);
        }
    }

    // ---- 决策影响亲密度 ----
    onDecision(npcId, effect) {
        if (effect.intimacyChange) {
            this.changeIntimacy(npcId, effect.intimacyChange);
        }
        // 对同势力NPC的连锁影响
        const npc = NPC_DATA[npcId];
        if (npc && effect.factionEffect && effect.factionEffect[npc.faction]) {
            this.changeIntimacy(npcId, effect.factionEffect[npc.faction]);
        }
    }

    // ---- 通知亲密度奖励 ----
    notifyReward(npcId, reward) {
        console.log(`[关系] ${NPC_DATA[npcId].name} 亲密度奖励解锁: ${reward.desc}`);
        // 实际游戏中会弹通知
        if (window.GAME_STATE.scene) {
            const scene = window.GAME_STATE.scene;
            scene.events.emit('intimacyReward', { npcId, reward });
        }
    }

    // ---- 获取关系网络数据（用于关系图可视化）----
    getRelationshipGraph() {
        const nodes = [];
        const links = [];

        // 玩家节点
        nodes.push({ id: 'player', name: '谈判官', group: 'player', intimacy: -1 });

        // NPC节点
        for (const [npcId, npc] of Object.entries(NPC_DATA)) {
            nodes.push({
                id: npcId,
                name: npc.name,
                group: npc.faction,
                intimacy: this.intimacy[npcId]
            });

            // 玩家-NPC关系
            if (this.intimacy[npcId] > 0) {
                links.push({
                    source: 'player',
                    target: npcId,
                    strength: this.intimacy[npcId] / 10
                });
            }
        }

        // NPC之间的固定关系（势力内联盟）
        const factionAlliances = [
            { source: 'chen_boss', target: 'ajie', type: 'trade' },
            { source: 'lao_zhao', target: 'xiao_mei', type: 'ally' },
            { source: 'chen_boss', target: 'lao_zhao', type: 'conflict' },
            { source: 'governor_lin', target: 'jiu_jie', type: 'tension' },
            { source: 'captain_su', target: 'chen_boss', type: 'trade' }
        ];

        for (const alliance of factionAlliances) {
            links.push(alliance);
        }

        return { nodes, links };
    }

    // ---- 获取所有关系摘要 ----
    getSummary() {
        const result = {};
        for (const [npcId, npc] of Object.entries(NPC_DATA)) {
            result[npcId] = {
                name: npc.name,
                faction: npc.faction,
                intimacy: this.intimacy[npcId],
                interactions: this.interactions[npcId],
                rewards: npc.intimacyRewards
            };
        }
        return result;
    }
}

window.RelationshipSystem = RelationshipSystem;
