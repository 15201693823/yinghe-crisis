// ============================================================
// 决策卡系统 - AI驱动生成 + 选择 + 效果执行
// ============================================================

class DecisionCardSystem {
    constructor() {
        this.activeCards = [];
        this.usedCards = [];
        this.cardHistory = [];
        this.isGenerating = false;
    }

    // ---- 生成决策卡 ----
    async generateCards() {
        this.isGenerating = true;
        const economy = window.GAME_STATE.economy;
        const status = economy.getStatusSummary();
        const recentDecisions = this.cardHistory.slice(-2);

        let cards;
        
        if (this.canUseAI()) {
            // 使用 Coze API 生成
            try {
                cards = await this.generateViaAI(status, recentDecisions);
            } catch (e) {
                cards = this.generateLocally(status);
            }
        } else {
            cards = this.generateLocally(status);
        }

        this.activeCards = cards;
        this.isGenerating = false;
        return cards;
    }

    // ---- 通过AI生成决策卡 ----
    async generateViaAI(status, recentDecisions) {
        // 调用 Coze Bot 生成决策卡
        const prompt = `你是《星贸纪元》的决策卡生成器。
当前经济状态：
GDP: ${status.gdp}, 增长率: ${status.gdpGrowth}
通胀率: ${status.inflation}
商品价格: ${JSON.stringify(status.prices)}
三方满意度: 商会${status.satisfaction.merchant}, 矿工${status.satisfaction.miner}, 总督${status.satisfaction.governor}
当前回合: ${status.turn}, 章节: ${status.chapter}
近2回合决策历史: ${JSON.stringify(recentDecisions)}

请生成1-2张决策卡，要求：
1. 卡牌名称要有科幻感和政策感
2. 背景描述要结合当前经济数据
3. 效果预览的数值要合理
4. AI预测要基于当前趋势给出1-2句判断
5. 实施成本在10-60之间

输出JSON格式：
{ "cards": [{ "name": "...", "rarity": "common|rare|gray", "description": "...", "effects": { "merchant_happy": 0, "miner_happy": 0, "gov_happy": 0, "gdp": 0, "inflation": 0 }, "prediction": "...", "cost": 0 }] }`;

        // TODO: 接入 Coze API
        return this.generateLocally(status);
    }

    // ---- 本地生成决策卡 ----
    generateLocally(status) {
        const cards = [];
        const sat = status.satisfaction;

        // 常规卡 - 根据经济状态选择
        const regularCards = this.getRegularCards(status);
        cards.push(...regularCards);

        // 事件卡 - 根据特殊状态触发
        const eventCards = this.getEventCards(status);
        cards.push(...eventCards);

        // 灰色卡 - 黑市解锁后
        if (window.GAME_STATE.flags.blackMarketUnlocked) {
            const grayCards = this.getGrayCards();
            if (grayCards && Math.random() < 0.3) {
                cards.push(grayCards);
            }
        }

        // 最多保留3张
        return cards.slice(0, 3);
    }

    getRegularCards(status) {
        const sat = status.satisfaction;
        const cards = [];

        // 关税调整
        cards.push({
            id: 'tariff_adjust',
            name: '关税调整令',
            rarity: 'common',
            description: `调整进出口关税率，当前通胀${status.inflation}，${parseFloat(status.inflation) > 0.05 ? '通胀偏高需收紧' : '经济平稳可适度调整'}。`,
            effects: {
                merchant_happy: -5,
                miner_happy: 5,
                gov_happy: 0,
                gdp: -0.02,
                inflation: -0.01
            },
            prediction: `降低关税将刺激贸易但减少财政收入，当前财政储备充足可承受。`,
            cost: 20,
            type: 'tariff'
        });

        // 补贴发放
        if (sat.miner < 40) {
            cards.push({
                id: 'subsidy_miners',
                name: '矿工补贴令',
                rarity: 'common',
                description: `矿工满意度仅${sat.miner}，发放紧急补贴稳定局势。`,
                effects: {
                    merchant_happy: -3,
                    miner_happy: 10,
                    gov_happy: 3,
                    gdp: -0.01,
                    inflation: 0
                },
                prediction: '补贴能暂时安抚矿工，但长期需要结构性改革。',
                cost: 30,
                type: 'subsidy'
            });
        }

        // 价格干预
        const prices = status.prices;
        for (const [id, price] of Object.entries(prices)) {
            const basePrice = COMMODITY_DATA[id]?.basePrice || 10;
            if (price > basePrice * 1.3) {
                cards.push({
                    id: `price_control_${id}`,
                    name: `${COMMODITY_DATA[id]?.name || id}价格管制令`,
                    rarity: 'common',
                    description: `${COMMODITY_DATA[id]?.name || id}价格已涨至${price.toFixed(1)}星币（基准${basePrice}），涨幅超30%，实施价格管制。`,
                    effects: {
                        merchant_happy: -8,
                        miner_happy: 3,
                        gov_happy: 2,
                        gdp: -0.03,
                        inflation: -0.02
                    },
                    prediction: '限价会抑制通胀但可能引发供给短缺。',
                    cost: 15,
                    type: 'price_control'
                });
                break; // 只出一张价格干预卡
            }
        }

        return cards;
    }

    getEventCards(status) {
        const cards = [];

        if (window.GAME_STATE.flags.channelBroken) {
            cards.push({
                id: 'channel_repair',
                name: '航道修复工程',
                rarity: 'rare',
                description: '贸易航道断裂！进口量骤降50%，物价飙升40%。紧急启动修复工程。',
                effects: {
                    merchant_happy: 8,
                    miner_happy: 0,
                    gov_happy: 5,
                    gdp: 0.05,
                    inflation: -0.03
                },
                prediction: '修复航道是当务之急，但工程耗资巨大。',
                cost: 50,
                type: 'event'
            });
        }

        if (window.GAME_STATE.flags.minerStrike) {
            cards.push({
                id: 'strike_mediation',
                name: '矿工罢工调解令',
                rarity: 'rare',
                description: '矿工联合会发起罢工！原材料产出暴跌70%。派出调解团队。',
                effects: {
                    merchant_happy: 5,
                    miner_happy: 8,
                    gov_happy: 3,
                    gdp: 0.03,
                    inflation: -0.02
                },
                prediction: '调解需要矿工和商会双方让步，不容易。',
                cost: 60,
                type: 'event'
            });
        }

        return cards;
    }

    getGrayCards() {
        const grayCards = [
            {
                id: 'black_market_dump',
                name: '黑市倾销',
                rarity: 'gray',
                description: '通过黑市渠道获取大量物资，价格仅为市价50%。',
                effects: {
                    merchant_happy: -10,
                    miner_happy: 0,
                    gov_happy: -20,
                    gdp: 0.02,
                    inflation: -0.03
                },
                prediction: '短期获利巨大，但30%概率被查，后果严重。',
                cost: 0,
                type: 'gray',
                risk: 0.3
            },
            {
                id: 'bribe_official',
                name: '贿赂官员',
                rarity: 'gray',
                description: '通过贿赂提升某方满意度+25，但道德值下降。',
                effects: {
                    merchant_happy: 10,
                    miner_happy: 10,
                    gov_happy: 5,
                    gdp: 0,
                    inflation: 0
                },
                prediction: '快速但危险，一旦被发现三方各-10满意度。',
                cost: 0,
                type: 'gray',
                risk: 0.25,
                moralCost: -15
            }
        ];

        return grayCards[Math.floor(Math.random() * grayCards.length)];
    }

    // ---- 执行决策卡 ----
    executeCard(cardId) {
        const card = this.activeCards.find(c => c.id === cardId);
        if (!card) return { success: false, reason: '卡牌不存在' };

        // 检查星币是否足够
        if (window.GAME_STATE.player.credits < card.cost) {
            return { success: false, reason: '星币不足' };
        }

        // 扣除成本
        window.GAME_STATE.player.credits -= card.cost;

        // 处理风险
        if (card.risk && Math.random() < card.risk) {
            // 风险触发
            return {
                success: true,
                card,
                riskTriggered: true,
                message: '决策失败！负面效果已触发。'
            };
        }

        // 道德值变化
        if (card.moralCost) {
            window.GAME_STATE.player.moral += card.moralCost;
        }

        // 应用效果到经济系统
        const effects = {
            tariffChange: card.type === 'tariff' ? -0.05 : 0,
            subsidyToMiners: card.type === 'subsidy',
            tradeVolumeChange: (card.effects.gdp > 0) ? 1 : -1,
            profitMargin: card.effects.merchant_happy > 0 ? 0.3 : 0.1,
            govIntervention: card.type === 'price_control',
            orePriceChange: card.effects.miner_happy > 0 ? 1 : -1,
            revenueChange: card.effects.gov_happy > 0 ? 0.01 : -0.01
        };

        window.GAME_STATE.economy.updateSatisfaction({
            ...effects,
            tariffChange: card.type === 'tariff' ? -0.05 : 0
        });

        // 移动到已用列表
        this.activeCards = this.activeCards.filter(c => c.id !== cardId);
        this.usedCards.push(card);
        this.cardHistory.push({
            turn: window.GAME_STATE.economy.turn,
            cardName: card.name,
            effects: card.effects
        });

        return { success: true, card, riskTriggered: false };
    }

    // ---- 谈判修改决策卡 ----
    negotiateCard(cardId, npcId) {
        const relationship = window.GAME_STATE.relationships;
        const intimacy = relationship.getIntimacy(npcId);

        const successRate = intimacy >= 3 ? 0.6 : 0.2;
        const success = Math.random() < successRate;

        if (success) {
            // 修改成功：效果打折
            const card = this.activeCards.find(c => c.id === cardId);
            if (card) {
                for (const key of Object.keys(card.effects)) {
                    if (typeof card.effects[key] === 'number') {
                        card.effects[key] = Math.round(card.effects[key] * 0.6);
                    }
                }
                card.cost = Math.round(card.cost * 0.7);
            }
            relationship.changeIntimacy(npcId, 1);
            return { success: true, message: `${NPC_DATA[npcId].name}同意了修改方案！效果已调整。` };
        } else {
            // 修改失败
            window.GAME_STATE.economy.updateSatisfaction({
                tariffChange: 0,
                tradeVolumeChange: 0
            });
            // 对应势力满意度-5
            const npc = NPC_DATA[npcId];
            window.GAME_STATE.economy.satisfaction[npc.faction === 'neutral' ? 'merchant' : npc.faction] -= 5;
            return { success: false, message: `${NPC_DATA[npcId].name}拒绝了修改，白跑一趟。` };
        }
    }

    canUseAI() {
        return !!window.GAME_STATE.dialogue?.apiUrl;
    }

    // ---- 获取当前可用卡牌 ----
    getActiveCards() {
        return this.activeCards;
    }
}

window.DecisionCardSystem = DecisionCardSystem;
