// ============================================================
// TutorialSystem - 新手指引系统
// 1. 跟踪玩家进度（localStorage tutorial_step）
// 2. 在屏幕上显示指向性箭头
// 3. 显示任务提示气泡
// 暗红 + 暖金 + 米白风格，禁止黑底
// ============================================================

class TutorialSystem {
    constructor() {
        this.STEP_KEY = 'tutorial_step';
        this.STEPS = [
            {
                id: 'meet_governor',
                title: '前往A层·会见林远总督',
                targetScene: 'GovernorScene',
                targetNpc: 'governor_lin',
                hint: '去和【林远总督】对话',
                subHint: 'A层·行政塔楼',
                tipText: '你是新到任的商会联络官，按礼节应先拜会总督府的最高长官。'
            },
            {
                id: 'meet_ajie',
                title: '前往B层·中央大厅会见阿杰',
                targetScene: 'HubScene',
                targetNpc: 'ajie',
                hint: '去和【阿杰】聊天获取情报',
                subHint: 'B层·中央贸易大厅',
                tipText: '阿杰是中央大厅的"消息中转站"，跟他聊聊能快速了解空间站的现状。'
            },
            {
                id: 'meet_captain_su',
                title: '前往C层·星际港口会见苏雷船长',
                targetScene: 'PortScene',
                targetNpc: 'captain_su',
                hint: '去和【苏雷船长】对话',
                subHint: 'C层·星际港口',
                tipText: '苏雷是跑荧河航道20年的老船长，了解航道的第一手情况。'
            },
            {
                id: 'do_first_trade',
                title: '返回B层·进行第一次贸易',
                targetScene: 'HubScene',
                targetNpc: 'chen_boss',
                hint: '去找【陈老板】做一笔贸易',
                subHint: 'B层·中央贸易大厅',
                tipText: '与陈老板谈一笔生意，了解荧河的贸易运作方式。'
            },
            {
                id: 'first_decision',
                title: '面对第一次关键决策',
                targetScene: 'HubScene',
                targetNpc: null,
                hint: '阅读决策卡并做出你的选择',
                subHint: '在中央大厅会触发',
                tipText: '决策卡会根据你收集到的信息自动生成，权衡各方利益做出选择。'
            },
            {
                id: 'meet_lao_zhao',
                title: '前往D层·矿业营地问老赵',
                targetScene: 'MiningScene',
                targetNpc: 'lao_zhao',
                hint: '去和【老赵】对话',
                subHint: 'D层·矿业营地',
                tipText: '老赵是矿工联合会的头子，想了解矿工现状必须先跟他谈谈。'
            },
            {
                id: 'blackmarket_unlocked',
                title: '返回B层·前往暗市街区',
                targetScene: 'HubScene',
                targetNpc: null,
                hint: '剧情已推进 — 暗市街区已解锁',
                subHint: 'B层·中央贸易大厅 → 暗市传送门',
                tipText: '恭喜完成新手引导！前往B层中央大厅顶部的暗市传送门，开始你的真正旅程。'
            }
        ];

        // 从localStorage读取进度
        const stored = parseInt(localStorage.getItem(this.STEP_KEY) || '0', 10);
        this.step = isNaN(stored) ? 0 : Math.max(0, Math.min(stored, this.STEPS.length));
        this.completed = localStorage.getItem('tutorial_completed') === '1';

        console.log(`[TutorialSystem] 初始化: step=${this.step}, completed=${this.completed}`);
    }

    // ---- 工具方法 ----
    getCurrentStep() {
        if (this.completed || this.step >= this.STEPS.length) return null;
        return this.STEPS[this.step];
    }

    isActive() {
        return !this.completed && this.step < this.STEPS.length;
    }

    save() {
        localStorage.setItem(this.STEP_KEY, this.step.toString());
        if (this.completed) localStorage.setItem('tutorial_completed', '1');
    }

    reset() {
        this.step = 0;
        this.completed = false;
        localStorage.removeItem(this.STEP_KEY);
        localStorage.removeItem('tutorial_completed');
        console.log('[TutorialSystem] 引导已重置');
    }

    advance() {
        this.step++;
        if (this.step >= this.STEPS.length) {
            this.completed = true;
            console.log('[TutorialSystem] 引导完成！');
        }
        this.save();
    }

    // ---- 进度检测 ----
    // 由各场景的 openDialogue 调用
    checkProgress(sceneKey, npcId) {
        if (!this.isActive()) return false;
        const step = this.getCurrentStep();
        if (!step) return false;

        // 步骤匹配判定
        if (step.targetScene && step.targetScene !== sceneKey) return false;
        if (step.targetNpc && step.targetNpc !== npcId) return false;

        // 推进
        console.log(`[TutorialSystem] 步骤 ${this.step} 完成: ${step.id}`);
        this.advance();
        return true;
    }

    // ---- 决策完成后调用 ----
    checkDecisionProgress() {
        if (!this.isActive()) return false;
        const step = this.getCurrentStep();
        if (!step) return false;
        if (step.id === 'first_decision') {
            console.log(`[TutorialSystem] 决策步骤完成`);
            this.advance();
            return true;
        }
        return false;
    }

    // ---- 暗市解锁时调用 ----
    checkBlackMarketProgress() {
        if (!this.isActive()) return false;
        const step = this.getCurrentStep();
        if (!step) return false;
        if (step.id === 'blackmarket_unlocked') {
            console.log(`[TutorialSystem] 暗市解锁步骤完成`);
            this.advance();
            return true;
        }
        return false;
    }

    // ============================================================
    // 场景箭头渲染（由各场景调用）
    // ============================================================
    attachToScene(scene) {
        if (!this.isActive()) return;
        const step = this.getCurrentStep();
        if (!step) return;

        // 场景不匹配 → 不显示
        if (step.targetScene && step.targetScene !== scene.scene.key) return;

        // 找目标位置
        let targetX, targetY;
        if (step.targetNpc && scene.npcs && scene.npcs[step.targetNpc]) {
            const npcSprite = scene.npcs[step.targetNpc].sprite;
            targetX = npcSprite.x;
            targetY = npcSprite.y - 60;
        } else if (step.targetScene === 'HubScene') {
            // 第一步决策：等决策卡；其他Hub场景无目标NPC → 用中央上方
            if (step.id === 'first_decision') {
                return; // 不画箭头，让决策卡自己出现
            }
            if (step.id === 'blackmarket_unlocked') {
                // 指向暗市传送门
                const portal = scene.portals?.['to_blackmarket'];
                if (portal) { targetX = portal.sprite.x; targetY = portal.sprite.y - 50; }
                else return;
            } else return;
        } else {
            return;
        }

        scene._tutorialArrow = this.createArrow(scene, targetX, targetY);
        scene._tutorialBubble = this.createBubble(scene, step);
    }

    createArrow(scene, x, y) {
        // 三角形金色箭头 + 阴影
        const arrowG = scene.add.graphics().setDepth(150);

        // 暖金外光
        arrowG.fillStyle(0xd4a574, 0.3);
        arrowG.fillCircle(x, y, 18);
        arrowG.fillStyle(0xff6b35, 0.85);
        arrowG.fillCircle(x, y, 11);
        arrowG.fillStyle(0xffd93d, 1);
        arrowG.fillTriangle(x - 6, y - 4, x + 6, y - 4, x, y + 6);

        arrowG.setAlpha(0);
        scene.tweens.add({ targets: arrowG, alpha: 1, duration: 400 });

        // 上下浮动 + 缩放
        scene.tweens.add({
            targets: arrowG, y: '-=14',
            duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        scene.tweens.add({
            targets: arrowG, scaleX: 1.1, scaleY: 1.1,
            duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        return arrowG;
    }

    createBubble(scene, step) {
        const { width } = scene.cameras.main;
        const container = scene.add.container(width / 2, 90).setDepth(160);

        // 气泡背景（暗红 + 暖金描边）
        const bg = scene.add.graphics();
        const pw = 360, ph = 60;
        bg.fillStyle(0x2a0a0a, 0.95);
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 10);
        bg.lineStyle(2, 0xd4a574, 0.9);
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 10);
        // 顶部装饰条
        bg.fillStyle(0xd4a574, 0.5);
        bg.fillRect(-pw / 2 + 8, -ph / 2 + 2, pw - 16, 2);
        // 向下小三角
        bg.fillStyle(0x2a0a0a, 0.95);
        bg.fillTriangle(-6, ph / 2, 6, ph / 2, 0, ph / 2 + 8);
        bg.lineStyle(2, 0xd4a574, 0.9);
        bg.strokeTriangle(-6, ph / 2, 6, ph / 2, 0, ph / 2 + 8);
        container.add(bg);

        // 标题
        const title = scene.add.text(0, -14, '📜 任务：' + step.hint, {
            fontSize: '13px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(title);

        // 副提示
        const sub = scene.add.text(0, 6, '📍 ' + step.subHint, {
            fontSize: '10px', fill: '#f5e6d3', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        container.add(sub);

        // 引导小贴士
        const tip = scene.add.text(0, 20, '💡 ' + step.tipText, {
            fontSize: '9px', fill: '#d4a574', fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 340 }, align: 'center'
        }).setOrigin(0.5);
        container.add(tip);

        // 步骤进度
        const progressText = scene.add.text(0, ph / 2 + 14,
            `步骤 ${this.step + 1}/${this.STEPS.length}`, {
            fontSize: '8px', fill: '#888888', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        container.add(progressText);

        container.setAlpha(0);
        scene.tweens.add({ targets: container, alpha: 1, duration: 500, delay: 200 });

        // 步骤推进时由场景移除（不需要自动消失）

        return container;
    }

    // ---- 清理场景上的箭头（推进时调用） ----
    clearFromScene(scene) {
        if (scene._tutorialArrow) {
            scene.tweens.add({
                targets: scene._tutorialArrow,
                alpha: 0, duration: 300,
                onComplete: () => scene._tutorialArrow?.destroy()
            });
            scene._tutorialArrow = null;
        }
        if (scene._tutorialBubble) {
            scene.tweens.add({
                targets: scene._tutorialBubble,
                alpha: 0, y: scene._tutorialBubble.y - 20, duration: 300,
                onComplete: () => scene._tutorialBubble?.destroy()
            });
            scene._tutorialBubble = null;
        }
    }

    // ---- 步骤推进通知（屏幕中央提示） ----
    showStepNotification(scene, stepIndex) {
        const { width, height } = scene.cameras.main;
        const container = scene.add.container(width / 2, height - 130).setDepth(300);

        const bg = scene.add.graphics();
        bg.fillStyle(0x1a3a2a, 0.95);
        bg.fillRoundedRect(-180, -22, 360, 44, 8);
        bg.lineStyle(2, 0x4ecdc4, 0.9);
        bg.strokeRoundedRect(-180, -22, 360, 44, 8);
        container.add(bg);

        const txt = scene.add.text(0, 0,
            `✨ 引导进度: ${stepIndex}/${this.STEPS.length} 已完成！`, {
            fontSize: '13px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(txt);

        container.setAlpha(0);
        scene.tweens.add({ targets: container, alpha: 1, duration: 400 });
        scene.tweens.add({
            targets: container, alpha: 0, y: container.y - 30,
            delay: 2200, duration: 600,
            onComplete: () => container.destroy()
        });
    }
}

// 全局实例
window.tutorialSystem = new TutorialSystem();

// ============================================================
// 全局辅助函数：AI连接状态指示器
// ============================================================
window.createAIStatusIndicator = function (scene) {
    const status = window.cozeBridge?.isConnected ? '🟢 AI已连接' : '🟡 本地对话';
    const detail = window.cozeBridge?.isConnected
        ? 'Coze AI对话已就绪，NPC回复由AI生成'
        : 'AI代理暂不可用，使用本地预设对话';

    const { width } = scene.cameras.main;

    // 标签背景
    const bg = scene.add.graphics().setDepth(48);
    bg.fillStyle(0x2a0a0a, 0.9);
    bg.fillRoundedRect(8, 42, 130, 24, 6);
    bg.lineStyle(1, 0xd4a574, 0.6);
    bg.strokeRoundedRect(8, 42, 130, 24, 6);

    // 标签文字
    const label = scene.add.text(12, 46, status, {
        fontSize: '10px', fill: '#f5e6d3', fontFamily: 'Microsoft YaHei'
    }).setDepth(49).setInteractive({ useHandCursor: true });

    // 详情弹层
    let detailContainer = null;
    const showDetail = () => {
        if (detailContainer) {
            detailContainer.destroy();
            detailContainer = null;
            return;
        }
        detailContainer = scene.add.container(0, 0).setDepth(400);
        const overlay = scene.add.graphics();
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, width, scene.cameras.main.height);
        detailContainer.add(overlay);

        const pw = 380, ph = 200;
        const px = (width - pw) / 2, py = (scene.cameras.main.height - ph) / 2;
        const dlg = scene.add.graphics();
        dlg.fillStyle(0x2a0a0a, 0.97);
        dlg.fillRoundedRect(px, py, pw, ph, 12);
        dlg.lineStyle(2, 0xd4a574, 0.9);
        dlg.strokeRoundedRect(px, py, pw, ph, 12);
        dlg.fillStyle(0xd4a574, 0.3);
        dlg.fillRect(px + 10, py + 2, pw - 20, 3);
        detailContainer.add(dlg);

        const title = scene.add.text(width / 2, py + 30, '🤖 AI对话服务状态', {
            fontSize: '16px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        detailContainer.add(title);

        const connected = window.cozeBridge?.isConnected;
        const statusLine = scene.add.text(width / 2, py + 65, connected ? '✅ 状态: 已连接' : '⚠️ 状态: 本地模式', {
            fontSize: '13px', fill: connected ? '#4ecdc4' : '#ff9966', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        detailContainer.add(statusLine);

        const detailText = scene.add.text(px + 20, py + 95, detail, {
            fontSize: '11px', fill: '#f5e6d3', fontFamily: 'Microsoft YaHei',
            wordWrap: { width: pw - 40 }, align: 'center', lineSpacing: 4
        });
        detailContainer.add(detailText);

        if (window.cozeBridge) {
            const info = scene.add.text(px + 20, py + 145,
                `代理: ${(window.cozeBridge.proxyUrl || '').replace(/^https?:\/\//, '').substring(0, 40)}\n` +
                `Bot ID: ${(window.cozeBridge.botId || '未配置').substring(0, 20)}`, {
                fontSize: '9px', fill: '#888888', fontFamily: 'Microsoft YaHei',
                wordWrap: { width: pw - 40 }, lineSpacing: 3
            });
            detailContainer.add(info);
        }

        const closeBtn = scene.add.text(px + pw - 30, py + 8, '✕', {
            fontSize: '16px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => { detailContainer.destroy(); detailContainer = null; });
        detailContainer.add(closeBtn);
    };

    label.on('pointerdown', showDetail);

    // 异步状态更新：连接测试是延迟进行的，标签需要稍后刷新
    const updateStatus = () => {
        const newStatus = window.cozeBridge?.isConnected ? '🟢 AI已连接' : '🟡 本地对话';
        if (label.text !== newStatus) {
            label.setText(newStatus);
        }
    };
    if (scene.time) {
        scene.time.delayedCall(1500, updateStatus);
        scene.time.delayedCall(3500, updateStatus);
        scene.time.delayedCall(6000, updateStatus);
    }

    return { bg, label };
};
