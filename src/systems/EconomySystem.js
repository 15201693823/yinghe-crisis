// ============================================================
// 经济系统 - 核心引擎
// 基于供需模型 + 三方满意度 + GDP/通胀
// ============================================================

class EconomySystem {
    constructor() {
        // 基础变量
        this.gdp = 1000;
        this.previousGdp = 1000;
        this.population = 5000;
        this.inflation = 0.02;
        this.unemployment = 0.05;
        this.tradeBalance = 0;
        this.govRevenue = 200;
        this.govReserve = 500;

        // 三方满意度 (0-100)
        this.satisfaction = {
            merchant: 60,
            miner: 50,
            governor: 55
        };

        // 商品系统（深拷贝初始数据）
        this.commodities = {};
        for (const [key, data] of Object.entries(COMMODITY_DATA)) {
            this.commodities[key] = { ...data };
        }

        // 外部事件修正因子
        this.eventModifier = 1.0;

        // 历史记录
        this.history = {
            gdp: [],
            inflation: [],
            satisfaction: { merchant: [], miner: [], governor: [] },
            prices: {}
        };

        // 回合数
        this.turn = 1;
        this.chapter = 1;
    }

    // ---- 价格公式 ----
    // P = P_base × (Supply/Demand) × (1 + tariff) × (1 + inflation) × E
    calculatePrice(commodityId) {
        const c = this.commodities[commodityId];
        const supplyDemandRatio = c.supply / Math.max(c.demand, 1);
        const price = c.basePrice * supplyDemandRatio * (1 + c.tariff) * (1 + this.inflation) * this.eventModifier;
        return Math.round(price * 100) / 100;
    }

    // ---- 供给量变化 ----
    // Supply_new = Supply_base × (1 + production_change) × (1 - disruption) × labor_factor
    updateSupply(commodityId, productionChange = 0, disruption = 0, laborFactor = 1.0) {
        const c = this.commodities[commodityId];
        c.supply = c.supply * (1 + productionChange) * (1 - disruption) * laborFactor;
        c.supply = Math.max(c.supply, 1);
    }

    // ---- 需求量变化 ----
    // Demand_new = Demand_base × (1 + pop_growth) × (1 + gdp_growth) × urgency
    updateDemand(commodityId, urgency = 1.0) {
        const c = this.commodities[commodityId];
        const popGrowth = 0.001;
        const gdpGrowth = (this.gdp - this.previousGdp) / Math.max(this.previousGdp, 1);
        c.demand = c.demand * (1 + popGrowth) * (1 + gdpGrowth) * urgency;
        c.demand = Math.max(c.demand, 1);
    }

    // ---- GDP 公式 ----
    // GDP = Σ(交易量 × 价格) + 服务收入 - 补贴支出
    calculateGDP() {
        let tradeValue = 0;
        for (const [id, c] of Object.entries(this.commodities)) {
            const price = this.calculatePrice(id);
            const tradeVolume = Math.min(c.supply, c.demand);
            tradeValue += tradeVolume * price;
        }
        this.previousGdp = this.gdp;
        this.gdp = tradeValue + 50 - 10; // 服务收入50, 基础补贴10
        return this.gdp;
    }

    // ---- 通胀率 (CPI) ----
    calculateInflation() {
        let currentCPI = 0;
        let baseCPI = 0;
        for (const [id, c] of Object.entries(this.commodities)) {
            const currentPrice = this.calculatePrice(id);
            currentCPI += currentPrice * c.cpiWeight;
            baseCPI += c.basePrice * c.cpiWeight;
        }
        const prevInflation = this.inflation;
        // 简化：用当前价格相对于基期的变化
        this.inflation = (currentCPI / baseCPI) - 1;
        return this.inflation;
    }

    // ---- 满意度更新 ----
    updateSatisfaction(changes = {}) {
        // 商会满意度
        this.satisfaction.merchant += (changes.tradeVolumeChange > 0 ? 2 : (changes.tradeVolumeChange < 0 ? -3 : 0))
            + (changes.profitMargin > 0.2 ? 3 : -1)
            + (changes.tariffChange || 0) * 20
            + (changes.govIntervention ? -2 : 0);

        // 矿工满意度
        this.satisfaction.miner += (changes.orePriceChange > 0 ? 3 : -2)
            + (changes.wageChange || 0) * 10
            + (changes.tariffOnExport || 0) * 15
            + (changes.subsidyToMiners ? 5 : 0);

        // 总督满意度
        this.satisfaction.governor += (this.getStabilityIndex() > 0.7 ? 2 : -3)
            + (changes.revenueChange || 0) * 5
            + (this.getMinSatisfaction() < 30 ? -5 : 0)
            + (this.unemployment > 0.15 ? -3 : 0);

        // 约束到 0-100
        for (let key in this.satisfaction) {
            this.satisfaction[key] = Math.max(0, Math.min(100, Math.round(this.satisfaction[key])));
        }
    }

    // ---- 稳定指数 ----
    getStabilityIndex() {
        return 0.4 * (this.getMinSatisfaction() / 100)
             + 0.2 * (1 - this.inflation)
             + 0.2 * (1 - this.unemployment)
             + 0.1 * (this.tradeBalance / Math.max(this.gdp, 1))
             + 0.1 * (this.govReserve / 500);
    }

    getMinSatisfaction() {
        return Math.min(this.satisfaction.merchant, this.satisfaction.miner, this.satisfaction.governor);
    }

    // ---- 贸易余额 ----
    calculateTradeBalance() {
        let exports = 0;
        let imports = 0;
        for (const [id, c] of Object.entries(this.commodities)) {
            const price = this.calculatePrice(id);
            const volume = Math.min(c.supply, c.demand) * 0.5;
            exports += volume * price * (1 - c.tariff);
            imports += volume * price * (1 + c.tariff) * this.eventModifier;
        }
        this.tradeBalance = exports - imports;
        return this.tradeBalance;
    }

    // ---- 回合推进 ----
    advanceTurn(decisionEffects = {}) {
        this.turn++;

        // 更新供需
        for (const [id, c] of Object.entries(this.commodities)) {
            let disruption = 0;
            let urgency = 1.0;

            // 事件影响
            if (window.GAME_STATE.flags.channelBroken && (id === 'food' || id === 'tech')) {
                disruption = 0.5;
            }
            if (window.GAME_STATE.flags.minerStrike && id === 'ore') {
                disruption = 0.7;
            }

            // 危机时期紧急需求
            if (this.getStabilityIndex() < 0.3) {
                if (id === 'food') urgency = 1.3;
                if (id === 'medicine') urgency = 1.5;
            }

            this.updateSupply(id, decisionEffects.productionChange || 0, disruption);
            this.updateDemand(id, urgency);
        }

        // 应用决策效果
        if (decisionEffects.tariffChange) {
            for (const c of Object.values(this.commodities)) {
                c.tariff = Math.max(0, c.tariff + decisionEffects.tariffChange);
            }
        }
        if (decisionEffects.subsidyToMiners) {
            this.govReserve -= 30;
        }

        // 计算经济指标
        this.calculateGDP();
        this.calculateInflation();
        this.calculateTradeBalance();
        this.updateSatisfaction(decisionEffects);

        // 章节推进
        if (this.turn > 5 && this.chapter === 1) this.chapter = 2;
        if (this.turn > 10 && this.chapter === 2) this.chapter = 3;

        // 事件触发检查
        this.checkEvents();

        // 记录历史
        this.recordHistory();

        return this.getStatus();
    }

    // ---- 事件触发 ----
    checkEvents() {
        // 航道断裂（第2-3章随机触发）
        if (!window.GAME_STATE.flags.channelBroken && this.chapter >= 2 && Math.random() < 0.15) {
            window.GAME_STATE.flags.channelBroken = true;
            this.eventModifier = 1.4;
        }

        // 矿工罢工
        if (!window.GAME_STATE.flags.minerStrike && this.satisfaction.miner < 20 && Math.random() < 0.3) {
            window.GAME_STATE.flags.minerStrike = true;
        }

        // 商会封锁
        if (!window.GAME_STATE.flags.merchantBlockade && this.satisfaction.merchant < 20 && Math.random() < 0.3) {
            window.GAME_STATE.flags.merchantBlockade = true;
        }

        // 黑市解锁（第2章）
        if (this.chapter >= 2) {
            window.GAME_STATE.flags.blackMarketUnlocked = true;
        }

        // 事件恢复
        if (window.GAME_STATE.flags.channelBroken && Math.random() < 0.2) {
            window.GAME_STATE.flags.channelBroken = false;
            this.eventModifier = 1.0;
        }
        if (window.GAME_STATE.flags.minerStrike && this.satisfaction.miner > 40) {
            window.GAME_STATE.flags.minerStrike = false;
        }
    }

    // ---- 历史记录 ----
    recordHistory() {
        this.history.gdp.push(this.gdp);
        this.history.inflation.push(this.inflation);
        this.history.satisfaction.merchant.push(this.satisfaction.merchant);
        this.history.satisfaction.miner.push(this.satisfaction.miner);
        this.history.satisfaction.governor.push(this.satisfaction.governor);

        for (const [id, c] of Object.entries(this.commodities)) {
            if (!this.history.prices[id]) this.history.prices[id] = [];
            this.history.prices[id].push(this.calculatePrice(id));
        }
    }

    // ---- 获取当前状态摘要（给AI NPC用）----
    getStatusSummary() {
        const prices = {};
        for (const [id, c] of Object.entries(this.commodities)) {
            prices[id] = this.calculatePrice(id);
        }
        return {
            gdp: Math.round(this.gdp),
            gdpGrowth: Math.round(((this.gdp - this.previousGdp) / this.previousGdp) * 10000) / 100 + '%',
            inflation: (this.inflation * 100).toFixed(1) + '%',
            unemployment: (this.unemployment * 100).toFixed(1) + '%',
            satisfaction: { ...this.satisfaction },
            prices,
            stability: (this.getStabilityIndex() * 100).toFixed(1) + '%',
            turn: this.turn,
            chapter: this.chapter,
            flags: { ...window.GAME_STATE.flags }
        };
    }

    // ---- 获取完整状态 ----
    getStatus() {
        return {
            ...this.getStatusSummary(),
            govReserve: this.govReserve,
            tradeBalance: Math.round(this.tradeBalance),
            commodities: Object.fromEntries(
                Object.entries(this.commodities).map(([id, c]) => [id, {
                    ...c,
                    currentPrice: this.calculatePrice(id)
                }])
            )
        };
    }

    // ---- 交易执行 ----
    executeTrade(commodityId, quantity, isBuy) {
        const c = this.commodities[commodityId];
        const price = this.calculatePrice(commodityId);
        const totalCost = price * quantity;

        if (isBuy) {
            if (c.stock < quantity) return { success: false, reason: '库存不足' };
            if (window.GAME_STATE.player.credits < totalCost) return { success: false, reason: '星币不足' };
            c.stock -= quantity;
            window.GAME_STATE.player.credits -= totalCost;
            c.demand += quantity * 0.1; // 购买增加需求
        } else {
            c.stock += quantity;
            window.GAME_STATE.player.credits += totalCost * 0.9; // 卖出价9折
            c.supply += quantity * 0.1; // 卖出增加供给
        }

        return { success: true, price, totalCost, newCredits: window.GAME_STATE.player.credits };
    }
}

window.EconomySystem = EconomySystem;
