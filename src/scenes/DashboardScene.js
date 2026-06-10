// ============================================================
// DashboardScene - 经济仪表盘（Tab键打开）
// 参考：Aivilization的数据仪表盘 + 荧河的关系网络图
// ============================================================

class DashboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DashboardScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a1a');

        const econ = window.GAME_STATE.economy;
        const rel = window.GAME_STATE.relationships;
        const status = econ.getStatusSummary();

        // ---- 标题 ----
        this.add.text(width / 2, 20, '📊 经济仪表盘', {
            fontSize: '20px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        // ---- 核心指标面板 ----
        this.drawMetricsPanel(status);

        // ---- 三方满意度 ----
        this.drawSatisfactionPanel(status);

        // ---- 商品价格表 ----
        this.drawPriceTable(econ);

        // ---- 关系网络图 ----
        this.drawRelationshipGraph(rel);

        // ---- 事件状态 ----
        this.drawEventStatus();

        // 关闭提示
        this.add.text(width / 2, height - 15, '按 Tab / Esc 返回游戏', {
            fontSize: '11px', fill: '#666666', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(10);

        // 输入
        this.tabKey = this.input.keyboard.addKey('TAB');
        this.escKey = this.input.keyboard.addKey('ESC');
    }

    drawMetricsPanel(status) {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e, 0.9);
        g.fillRoundedRect(20, 45, 300, 130, 8);
        g.lineStyle(1, 0x00ffa3, 0.4);
        g.strokeRoundedRect(20, 45, 300, 130, 8);

        this.add.text(35, 52, '核心指标', { fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' });

        const metrics = [
            { label: 'GDP', value: status.gdp + ' 星币', color: '#4ecdc4' },
            { label: '增长率', value: status.gdpGrowth, color: parseFloat(status.gdpGrowth) > 0 ? '#00ffa3' : '#ff6b35' },
            { label: '通胀率', value: status.inflation, color: parseFloat(status.inflation) > 0.05 ? '#ff6b35' : '#4ecdc4' },
            { label: '稳定指数', value: status.stability, color: parseFloat(status.stability) > 70 ? '#00ffa3' : '#ff6b35' },
            { label: '财政储备', value: window.GAME_STATE.economy.govReserve + ' 星币', color: '#ffd93d' }
        ];

        metrics.forEach((m, i) => {
            this.add.text(35, 75 + i * 20, m.label + ':', { fontSize: '11px', fill: '#888888', fontFamily: 'Microsoft YaHei' });
            this.add.text(170, 75 + i * 20, m.value, { fontSize: '11px', fill: m.color, fontFamily: 'Microsoft YaHei' });
        });
    }

    drawSatisfactionPanel(status) {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e, 0.9);
        g.fillRoundedRect(340, 45, 300, 130, 8);
        g.lineStyle(1, 0x00ffa3, 0.4);
        g.strokeRoundedRect(340, 45, 300, 130, 8);

        this.add.text(355, 52, '三方满意度', { fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' });

        const factions = [
            { name: '🏛️ 商会联盟', value: status.satisfaction.merchant, color: 0xff6b35 },
            { name: '⚒️ 矿工联合会', value: status.satisfaction.miner, color: 0xd4a574 },
            { name: '🛡️ 总督府', value: status.satisfaction.governor, color: 0x4a90d9 }
        ];

        factions.forEach((f, i) => {
            const y = 80 + i * 32;
            this.add.text(355, y, f.name, { fontSize: '11px', fill: '#cccccc', fontFamily: 'Microsoft YaHei' });
            
            // 进度条
            const bar = this.add.graphics();
            bar.fillStyle(0x333333, 1);
            bar.fillRoundedRect(480, y + 2, 140, 12, 3);
            bar.fillStyle(f.color, 1);
            bar.fillRoundedRect(480, y + 2, 140 * (f.value / 100), 12, 3);
            
            this.add.text(625, y, f.value + '', { fontSize: '11px', fill: '#' + f.color.toString(16).padStart(6, '0'), fontFamily: 'Microsoft YaHei' });
        });
    }

    drawPriceTable(econ) {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e, 0.9);
        g.fillRoundedRect(20, 190, 460, 200, 8);
        g.lineStyle(1, 0x00ffa3, 0.4);
        g.strokeRoundedRect(20, 190, 460, 200, 8);

        this.add.text(35, 197, '商品价格与供需', { fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' });

        // 表头
        this.add.text(35, 220, '商品', { fontSize: '10px', fill: '#888888', fontFamily: 'Microsoft YaHei' });
        this.add.text(100, 220, '价格', { fontSize: '10px', fill: '#888888', fontFamily: 'Microsoft YaHei' });
        this.add.text(160, 220, '供给', { fontSize: '10px', fill: '#888888', fontFamily: 'Microsoft YaHei' });
        this.add.text(220, 220, '需求', { fontSize: '10px', fill: '#888888', fontFamily: 'Microsoft YaHei' });
        this.add.text(280, 220, '关税', { fontSize: '10px', fill: '#888888', fontFamily: 'Microsoft YaHei' });
        this.add.text(340, 220, '趋势', { fontSize: '10px', fill: '#888888', fontFamily: 'Microsoft YaHei' });

        for (const [id, c] of Object.entries(econ.commodities)) {
            const price = econ.calculatePrice(id);
            const history = econ.history.prices[id];
            const prevPrice = history?.length > 1 ? history[history.length - 2] : price;
            const trend = price > prevPrice ? '↑' : price < prevPrice ? '↓' : '→';
            const trendColor = price > prevPrice ? '#ff6b35' : price < prevPrice ? '#00ffa3' : '#888888';

            const i = Object.keys(econ.commodities).indexOf(id);
            const y = 240 + i * 25;

            this.add.text(35, y, `${c.icon} ${c.name}`, { fontSize: '11px', fill: '#ffffff', fontFamily: 'Microsoft YaHei' });
            this.add.text(100, y, price.toFixed(1), { fontSize: '11px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei' });
            this.add.text(160, y, Math.round(c.supply), { fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei' });
            this.add.text(220, y, Math.round(c.demand), { fontSize: '11px', fill: '#ff6b9d', fontFamily: 'Microsoft YaHei' });
            this.add.text(280, y, (c.tariff * 100).toFixed(0) + '%', { fontSize: '11px', fill: '#aaaaaa', fontFamily: 'Microsoft YaHei' });
            this.add.text(340, y, trend, { fontSize: '14px', fill: trendColor, fontFamily: 'Microsoft YaHei' });
        }
    }

    drawRelationshipGraph(rel) {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e, 0.9);
        g.fillRoundedRect(500, 190, 440, 200, 8);
        g.lineStyle(1, 0x00ffa3, 0.4);
        g.strokeRoundedRect(500, 190, 440, 200, 8);

        this.add.text(515, 197, '关系网络', { fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' });

        // 简化版关系图：中心是玩家，周围是NPC
        const centerX = 720, centerY = 310, radius = 65;
        const graph = rel.getRelationshipGraph();

        // 玩家节点
        g.fillStyle(0x00ffa3, 0.8);
        g.fillCircle(centerX, centerY, 15);
        this.add.text(centerX, centerY, '你', { fontSize: '9px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5);

        // NPC节点
        const npcs = Object.entries(NPC_DATA).filter(([id]) => id !== 'mysterious');
        npcs.forEach(([npcId, npc], i) => {
            const angle = (i / npcs.length) * Math.PI * 2 - Math.PI / 2;
            const nx = centerX + Math.cos(angle) * radius;
            const ny = centerY + Math.sin(angle) * radius;

            const intimacy = rel.getIntimacy(npcId);
            const nodeSize = 8 + intimacy;

            // 连线
            const lineAlpha = Math.max(0.1, intimacy / 10);
            g.lineStyle(1, npc.color, lineAlpha);
            g.lineBetween(centerX, centerY, nx, ny);

            // 节点
            g.fillStyle(npc.color, 0.8);
            g.fillCircle(nx, ny, nodeSize);

            // 名字
            this.add.text(nx, ny + nodeSize + 4, npc.name, {
                fontSize: '8px', fill: '#' + npc.color.toString(16).padStart(6, '0'), fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);

            // 亲密度
            if (intimacy > 0) {
                this.add.text(nx, ny - nodeSize - 8, '♥' + intimacy, {
                    fontSize: '7px', fill: '#ff6b9d', fontFamily: 'Microsoft YaHei'
                }).setOrigin(0.5);
            }
        });
    }

    drawEventStatus() {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e, 0.9);
        g.fillRoundedRect(20, 405, 920, 80, 8);
        g.lineStyle(1, 0xff6b35, 0.4);
        g.strokeRoundedRect(20, 405, 920, 80, 8);

        this.add.text(35, 412, '⚠️ 事件状态', { fontSize: '13px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' });

        const flags = window.GAME_STATE.flags;
        const events = [
            { name: '航道断裂', active: flags.channelBroken, color: '#ff6b35' },
            { name: '矿工罢工', active: flags.minerStrike, color: '#d4a574' },
            { name: '商会封锁', active: flags.merchantBlockade, color: '#ff6b35' },
            { name: '黑市解锁', active: flags.blackMarketUnlocked, color: '#c77dff' }
        ];

        events.forEach((e, i) => {
            const x = 35 + i * 220;
            this.add.text(x, 438, (e.active ? '🔴' : '🟢') + ' ' + e.name, {
                fontSize: '11px', fill: e.active ? e.color : '#4ecdc4', fontFamily: 'Microsoft YaHei'
            });
        });

        // 回合与章节
        this.add.text(35, 462, `第 ${window.GAME_STATE.economy.turn} 回合 · 第 ${window.GAME_STATE.economy.chapter} 章`, {
            fontSize: '11px', fill: '#888888', fontFamily: 'Microsoft YaHei'
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.tabKey) || Phaser.Input.Keyboard.JustDown(this.escKey)) {
            const prevScene = window.GAME_STATE.currentScene;
            this.scene.switch(prevScene === 'DashboardScene' ? 'HubScene' : prevScene);
        }
    }
}
