// ============================================================
// HubScene - 中央大厅（核心枢纽）— 增强版
// ============================================================

class HubScene extends Phaser.Scene {
    constructor() { super({ key: 'HubScene' }); }

    create() {
        window.GAME_STATE.currentScene = 'HubScene';
        window.GAME_STATE.scene = this;
        this.isInDialogue = false;

        const { width, height } = this.cameras.main;

        // ======== 精细背景图 ========
        this.add.image(width / 2, height / 2, 'bg_hub').setDisplaySize(width, height).setDepth(0);

        // 半透明暗角
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 0.3);
        vignette.fillRect(0, 0, width, 36);
        vignette.fillGradientStyle(0, 0, 0, 0, 0x000000, 0x000000, 0x000000, 0x000000, 0.3, 0.3, 0, 0);
        vignette.fillRect(0, height - 40, width, 40);

        // ======== 场景标题 ========
        this.add.text(width / 2, 48, 'B层 · 中央贸易大厅', {
            fontSize: '16px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            backgroundColor: '#0a0a1eCC', padding: { x: 16, y: 6 }
        }).setOrigin(0.5).setDepth(5);

        this.add.text(width / 2, 70, '贸易 · 信息 · 社交核心', {
            fontSize: '9px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eAA', padding: { x: 10, y: 3 }
        }).setOrigin(0.5).setDepth(5);

        // ======== 经济数据面板 ========
        const econ = window.GAME_STATE.economyStatus;
        const econBg = this.add.graphics().setDepth(4);
        econBg.fillStyle(0x0a0a1e, 0.85);
        econBg.fillRoundedRect(10, 85, 160, 65, 6);
        econBg.lineStyle(1, 0x00ffa3, 0.4);
        econBg.strokeRoundedRect(10, 85, 160, 65, 6);

        this.add.text(18, 90, '📊 贸易资讯', {
            fontSize: '10px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setDepth(5);
        this.econText1 = this.add.text(18, 106, `⛏ 矿石价格 ↑12%`, {
            fontSize: '9px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setDepth(5);
        this.econText2 = this.add.text(18, 119, `⛽ 燃料价格 ↓5%`, {
            fontSize: '9px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setDepth(5);
        this.econText3 = this.add.text(18, 132, `🌾 食品需求 ↑8%`, {
            fontSize: '9px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei'
        }).setDepth(5);

        // ======== 玩家 ========
        this.player = this.physics.add.sprite(width / 2, height * 0.55, 'player');
        this.player.setCollideWorldBounds(true).setDepth(10);
        this.player.speed = 160;

        // ======== NPC ========
        this.npcs = {};
        const npcPositions = {
            chen_boss: { x: 220, y: 320 },
            ajie: { x: 340, y: 360 }
        };

        for (const [id, pos] of Object.entries(npcPositions)) {
            const d = NPC_DATA[id];
            const faction = getFactionInfo(d.faction);
            const s = this.physics.add.sprite(pos.x, pos.y, `npc_${id}`).setImmovable(true).setDepth(8);

            this.add.text(pos.x, pos.y - 26, `${faction.icon} ${d.name}`, {
                fontSize: '10px', fill: '#' + d.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0a1eCC', padding: { x: 5, y: 2 }
            }).setOrigin(0.5).setDepth(12);

            const intimacy = window.GAME_STATE.relationships?.getIntimacy(id) || 0;
            this.add.text(pos.x, pos.y - 38, getIntimacyHearts(intimacy).substring(0, 5), {
                fontSize: '7px', fill: '#ff6b9d', fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setDepth(12);

            // NPC呼吸动画
            this.tweens.add({
                targets: s, y: pos.y - 3, duration: 2000 + Math.random() * 1000,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            this.npcs[id] = { sprite: s, data: d };
        }

        // ======== 传送门（带粒子效果） ========
        this.portals = {};
        const portalData = [
            { id: 'to_governor', label: '🏛️ A层·行政塔楼', x: 870, y: 280, scene: 'GovernorScene', color: 0x4a90d9 },
            { id: 'to_mining', label: '⚒️ D层·矿业营地', x: 90, y: 320, scene: 'MiningScene', color: 0xd4a574 },
            { id: 'to_port', label: '🚀 C层·星际港口', x: 480, y: 450, scene: 'PortScene', color: 0x7b8ea0 },
            { id: 'to_blackmarket', label: '🌑 E层·暗市街区', x: 480, y: 180, scene: 'BlackMarketScene', color: 0xc77dff }
        ];

        for (const pd of portalData) {
            const isLocked = (pd.id === 'to_blackmarket' && !window.GAME_STATE.flags.blackMarketUnlocked);
            const portal = this.add.sprite(pd.x, pd.y, 'portal').setDepth(6);

            this.add.text(pd.x, pd.y + 28, isLocked ? '🔒 ???' : pd.label, {
                fontSize: '9px',
                fill: isLocked ? '#555555' : '#' + pd.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0a1eCC', padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(12);

            if (isLocked) {
                portal.setAlpha(0.25);
            } else {
                this.tweens.add({
                    targets: portal, alpha: { from: 0.5, to: 0.9 },
                    duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
                // 传送门粒子
                createPortalParticles(this, pd.x, pd.y, pd.color);
            }

            this.portals[pd.id] = { sprite: portal, data: pd };
        }

        // ======== 区域信息面板 ========
        this.areaPanel = createAreaInfoPanel(this, '中央贸易大厅', '贸易·信息·社交核心', [
            { name: '陈老板', faction: 'merchant' },
            { name: '阿杰', faction: 'neutral' }
        ], 0x00ffa3);

        // ======== 输入 ========
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.qKey = this.input.keyboard.addKey('Q');
        this.iKey = this.input.keyboard.addKey('I');
        this.hKey = this.input.keyboard.addKey('H');

        // ======== HUD ========
        this.createHUD();

        // ======== 决策指示器 ========
        this.decisionIndicator = this.add.text(width - 50, 10, '⚖️', {
            fontSize: '18px', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eCC', padding: { x: 8, y: 4 }
        }).setDepth(50).setInteractive({ useHandCursor: true });
        this.decisionIndicator.setVisible(false);
        this.decisionIndicator.on('pointerdown', () => this.checkAndShowDecision());
        this.decisionBlinking = false;

        // P键打开决策
        this.pKey = this.input.keyboard.addKey('P');

        // ======== 交互提示 ========
        this.interactHint = this.add.text(width / 2, height - 22, '', {
            fontSize: '12px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eDD', padding: { x: 12, y: 5 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // ======== 增强版对话UI ========
        this.dialogueContainer = createEnhancedDialogue(this, 'hub-chat', 0x00ffa3);

        this.handleSendDialogue = async () => {
            const inputEl = document.getElementById('hub-chat');
            if (!inputEl?.value.trim()) return;
            const msg = inputEl.value.trim();
            inputEl.value = '';
            this.dlgText.setText('');
            this.dlgTyping.setVisible(true);

            // 打字音效
            window.audioManager?.dialogueType();

            await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
            const resp = await window.GAME_STATE.dialogue.sendMessage(this.currentDialogueNpc, msg);
            this.dlgTyping.setVisible(false);
            this.dlgText.setText(resp);

            const oldIntimacy = window.GAME_STATE.relationships.getIntimacy(this.currentDialogueNpc);
            window.GAME_STATE.relationships.onDialogue(this.currentDialogueNpc);
            const newIntimacy = window.GAME_STATE.relationships.getIntimacy(this.currentDialogueNpc);
            if (newIntimacy > oldIntimacy) {
                window.audioManager?.intimacyUp();
            }
            this.updateDialogueInfo(this.currentDialogueNpc);
            this.updateHUD();

            if (window.GAME_STATE.story.checkBlackMarketUnlock()) {
                this.showStoryNotification();
                this.scene.restart();
            }

            // 检查决策事件
            this.checkAndShowDecision();

            // 自动存档
            window.saveManager?.save();
        };

        // ======== 剧情事件通知 ========
        this.createStoryEventUI();

        // ======== 虚拟摇杆（移动端） ========
        this.joystick = new VirtualJoystick(this);

        // ======== 音频 ========
        window.audioManager?.startAmbient('HubScene');

        // ======== 新手引导 ========
        this.showTutorial();

        // ======== 场景切换音效+渐入 ========
        this.cameras.main.fadeIn(500, 10, 10, 26);
    }

    // ======== HUD ========
    createHUD() {
        const { width } = this.cameras.main;
        const hudBg = this.add.graphics().setDepth(49);
        hudBg.fillStyle(0x0a0a1e, 0.9);
        hudBg.fillRect(0, 0, width, 38);
        hudBg.lineStyle(1, 0x00ffa3, 0.4);
        hudBg.lineBetween(0, 38, width, 38);

        this.hudCredits = this.add.text(12, 10, `💰 ${window.GAME_STATE.player.credits} SC`, {
            fontSize: '12px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei'
        }).setDepth(50);

        this.hudMoral = this.add.text(130, 10, `⚖️ 道德 ${window.GAME_STATE.player.moral}`, {
            fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setDepth(50);

        const sat = window.GAME_STATE.factionSatisfaction;
        this.drawSatBar(width - 300, 12, '🏛️商', sat.merchant, 0xff6b35);
        this.drawSatBar(width - 200, 12, '⚒️矿', sat.miner, 0xd4a574);
        this.drawSatBar(width - 100, 12, '🛡️督', sat.governor, 0x4a90d9);

        this.add.text(width / 2, 530, 'WASD移动 · E对话 · Q日志 · I区域信息 · H帮助 · Esc关闭', {
            fontSize: '9px', fill: '#444466', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(50);
    }

    drawSatBar(x, y, label, value, color) {
        this.add.graphics().setDepth(50).fillStyle(0x333333, 1).fillRoundedRect(x, y, 60, 8, 2);
        this.add.graphics().setDepth(50).fillStyle(color, 1).fillRoundedRect(x, y, 60 * (value / 100), 8, 2);
        this.add.text(x - 2, y - 2, label, {
            fontSize: '8px', fill: '#' + color.toString(16).padStart(6, '0'), fontFamily: 'Microsoft YaHei'
        }).setOrigin(1, 0).setDepth(50);
    }

    updateHUD() {
        this.hudCredits?.setText(`💰 ${window.GAME_STATE.player.credits} SC`);
        this.hudMoral?.setText(`⚖️ 道德 ${window.GAME_STATE.player.moral}`);
    }

    // ======== 新手引导 ========
    showTutorial() {
        const hasSeenTutorial = localStorage.getItem('yinghe_tutorial_seen');
        if (hasSeenTutorial) return;

        const { width, height } = this.cameras.main;
        this.tutorialContainer = this.add.container(0, 0).setDepth(500);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        this.tutorialContainer.add(overlay);

        const pw = 600, ph = 380;
        const px = (width - pw) / 2, py = (height - ph) / 2;
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1e, 0.98);
        bg.fillRoundedRect(px, py, pw, ph, 12);
        bg.lineStyle(2, 0x00ffa3, 0.9);
        bg.strokeRoundedRect(px, py, pw, ph, 12);
        // 顶部装饰
        bg.fillStyle(0x00ffa3, 0.15);
        bg.fillRect(px + 12, py + 2, pw - 24, 3);
        this.tutorialContainer.add(bg);

        this.tutorialContainer.add(this.add.text(width / 2, py + 28, '👋 欢迎来到荧河空间站', {
            fontSize: '20px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5));

        const lines = [
            { text: '', y: 0 },
            { text: '你是联盟新派来的谈判官。荧河的各方势力矛盾重重，', y: 0 },
            { text: '你需要通过对话了解局势、建立信任、做出决策。', y: 0 },
            { text: '', y: 0 },
            { text: '🎮 操作方式', y: 0, style: { fill: '#ff6b35', fontStyle: 'bold', fontSize: '13px' } },
            { text: '  WASD / 方向键 — 移动角色', y: 0 },
            { text: '  E — 与NPC对话 / 进入传送门', y: 0 },
            { text: '  Q — 打开故事日志（查看进度）', y: 0 },
            { text: '  I — 显示区域信息面板', y: 0 },
            { text: '  H — 显示帮助  ·  Esc — 关闭面板', y: 0 },
            { text: '', y: 0 },
            { text: '💡 小贴士', y: 0, style: { fill: '#ffd93d', fontStyle: 'bold', fontSize: '13px' } },
            { text: '  多聊天 → 提升亲密度 → 解锁更多信息和区域', y: 0 },
            { text: '  传送门连接空间站的各个区域，按E即可穿越', y: 0 },
            { text: '  游戏自动存档，刷新页面可继续', y: 0 },
            { text: '', y: 0 },
            { text: '祝你好运，谈判官。荧河需要你。', y: 0, style: { fill: '#4ecdc4', fontStyle: 'bold' } },
        ];

        let lineY = py + 58;
        for (const line of lines) {
            const style = line.style || { fill: '#ccccdd', fontSize: '12px' };
            this.tutorialContainer.add(this.add.text(px + 30, lineY, line.text, {
                fontFamily: 'Microsoft YaHei', ...style
            }));
            lineY += 18;
        }

        const startBtn = this.add.text(width / 2, py + ph - 36, '[ 开始探索 ]', {
            fontSize: '16px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            backgroundColor: '#1a1a3e', padding: { x: 24, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        startBtn.on('pointerdown', () => {
            this.tutorialContainer.setVisible(false);
            localStorage.setItem('yinghe_tutorial_seen', '1');
            window.audioManager?.uiClick();
        });
        startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#ffffff' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#00ffa3' }));
        this.tutorialContainer.add(startBtn);
    }

    // ======== 打开对话（async方法）=======
    async openDialogue(npcId) {
        this.isInDialogue = true;
        this.currentDialogueNpc = npcId;
        const npc = NPC_DATA[npcId];
        const faction = getFactionInfo(npc.faction);

        window.audioManager?.dialogueOpen();

        this.dlgName.setText(npc.name);
        this.dlgName.setColor('#' + npc.color.toString(16).padStart(6, '0'));
        this.dlgTitle.setText(npc.title || '');
        this.dlgFaction.setText(`${faction.icon} ${faction.name}`);

        const portraitKey = `portrait_npc_${npcId}`;
        if (this.textures.exists(portraitKey)) {
            this.dlgPortrait.setTexture(portraitKey);
        }
        this.dlgPortrait.setDisplaySize(90, 90);

        this.updateDialogueInfo(npcId);

        this.dlgTyping.setVisible(true);
        this.dlgText.setText('');
        // 使用 await 获取对话响应
        const response = await window.GAME_STATE.dialogue.sendMessage(npcId, '你好');
        this.dlgTyping.setVisible(false);
        this.dlgText.setText(response);

        this.dialogueContainer.setVisible(true);
        window.GAME_STATE.relationships.onDialogue(npcId);
        window.GAME_STATE.story.onImportantDialogue(npcId);
        this.updateHUD();
        this.showStoryNotification();
        
        // 对话打开后，检查是否有决策事件可触发
        this.checkAndShowDecision();
    }
    
    // ======== 检查并显示决策面板 ========
    checkAndShowDecision() {
        const decision = window.GAME_STATE.story.getAvailableDecision();
        if (decision && !this.decisionPanelVisible) {
            this.showDecisionPanel(decision);
        }
    }
    
    // ======== 显示决策面板 ========
    showDecisionPanel(decision) {
        this.decisionPanelVisible = true;
        const { width, height } = this.cameras.main;
        
        // 创建决策面板容器
        this.decisionContainer = this.add.container(0, 0).setDepth(250);
        
        // 半透明遮罩
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        this.decisionContainer.add(overlay);
        
        // 面板背景
        const panelW = 500, panelH = 280;
        const panelX = (width - panelW) / 2, panelY = (height - panelH) / 2;
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x0a0a1e, 0.98);
        panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
        panelBg.lineStyle(2, 0xffd93d, 0.9);
        panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
        panelBg.fillStyle(0xffd93d, 0.2);
        panelBg.fillRect(panelX + 12, panelY + 2, panelW - 24, 3);
        this.decisionContainer.add(panelBg);
        
        // 标题
        const titleText = this.add.text(width / 2, panelY + 28, decision.title, {
            fontSize: '18px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.decisionContainer.add(titleText);
        
        // 描述
        const descText = this.add.text(width / 2, panelY + 60, decision.description, {
            fontSize: '12px', fill: '#e0e0e0', fontFamily: 'Microsoft YaHei',
            wordWrap: { width: panelW - 60 }, align: 'center'
        }).setOrigin(0.5);
        this.decisionContainer.add(descText);
        
        // 选项按钮
        decision.choices.forEach((choice, i) => {
            const btnY = panelY + 120 + i * 50;
            const btn = this.add.container(panelX + 30, btnY).setDepth(251);
            
            const btnBg = this.add.graphics();
            btnBg.fillStyle(0x1a1a3e, 0.9);
            btnBg.fillRoundedRect(0, 0, panelW - 60, 42, 6);
            btnBg.lineStyle(1, 0x4ecdc4, 0.5);
            btnBg.strokeRoundedRect(0, 0, panelW - 60, 42, 6);
            btn.add(btnBg);
            
            const btnText = this.add.text(12, 8, choice.text, {
                fontSize: '13px', fill: '#ffffff', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
            });
            btn.add(btnText);
            
            const hintText = this.add.text(12, 24, choice.hint, {
                fontSize: '9px', fill: '#888888', fontFamily: 'Microsoft YaHei'
            });
            btn.add(hintText);
            
            btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, panelW - 60, 42), Phaser.Geom.Rectangle.Contains);
            btn.on('pointerdown', () => {
                window.audioManager?.uiClick();
                this.makeDecision(decision.id, choice.id);
            });
            btn.on('pointerover', () => {
                btnBg.clear();
                btnBg.fillStyle(0x2a2a4e, 0.9);
                btnBg.fillRoundedRect(0, 0, panelW - 60, 42, 6);
                btnBg.lineStyle(1, 0x00ffa3, 0.8);
                btnBg.strokeRoundedRect(0, 0, panelW - 60, 42, 6);
            });
            btn.on('pointerout', () => {
                btnBg.clear();
                btnBg.fillStyle(0x1a1a3e, 0.9);
                btnBg.fillRoundedRect(0, 0, panelW - 60, 42, 6);
                btnBg.lineStyle(1, 0x4ecdc4, 0.5);
                btnBg.strokeRoundedRect(0, 0, panelW - 60, 42, 6);
            });
            
            this.decisionContainer.add(btn);
        });
    }
    
    // ======== 做出决策 ========
    makeDecision(decisionId, choiceId) {
        const result = window.GAME_STATE.story.makeDecision(decisionId, choiceId);
        if (result.success) {
            window.audioManager?.storyEvent();
            
            // 关闭决策面板
            if (this.decisionContainer) {
                this.decisionContainer.destroy();
                this.decisionContainer = null;
            }
            this.decisionPanelVisible = false;
            
            // 显示决策结果
            this.showDecisionResult(result.message);
            this.updateHUD();
            window.saveManager?.save();
        }
    }
    
    // ======== 显示决策结果 ========
    showDecisionResult(message) {
        const { width } = this.cameras.main;
        const resultText = this.add.text(width / 2, 180, message, {
            fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eDD', padding: { x: 16, y: 10 },
            wordWrap: { width: 500 }, align: 'center'
        }).setOrigin(0.5).setDepth(300);
        
        this.tweens.add({
            targets: resultText,
            alpha: 0,
            y: 160,
            delay: 3000,
            duration: 500,
            onComplete: () => resultText.destroy()
        });
    }

    updateDialogueInfo(npcId) {
        const intimacy = window.GAME_STATE.relationships.getIntimacy(npcId);
        this.dlgHearts.setText(getIntimacyHearts(intimacy));
        this.dlgFactionBar.clear();
        this.dlgFactionBar.fillStyle(NPC_DATA[npcId].color, 0.6);
        this.dlgFactionBar.fillRect(56, 128, 100, 3);
    }

    closeDialogue() {
        this.isInDialogue = false;
        this.dialogueContainer.setVisible(false);
        this.currentDialogueNpc = null;
    }

    // ======== 剧情事件通知 ========
    createStoryEventUI() {
        const { width, height } = this.cameras.main;
        this.storyNotify = this.add.container(0, 0).setDepth(300).setVisible(false);
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1e, 0.92);
        bg.fillRoundedRect(width / 2 - 260, 55, 520, 90, 8);
        bg.lineStyle(2, 0xffd93d, 0.9);
        bg.strokeRoundedRect(width / 2 - 260, 55, 520, 90, 8);
        this.storyNotify.add(bg);
        this.notifyTitle = this.add.text(width / 2, 68, '', {
            fontSize: '14px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.storyNotify.add(this.notifyTitle);
        this.notifyText = this.add.text(width / 2, 95, '', {
            fontSize: '11px', fill: '#e0e0e0', fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 480 }, align: 'center'
        }).setOrigin(0.5);
        this.storyNotify.add(this.notifyText);
        const closeN = this.add.text(width / 2, 130, '[ 点击关闭 ]', {
            fontSize: '9px', fill: '#666666', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeN.on('pointerdown', () => this.storyNotify.setVisible(false));
        this.storyNotify.add(closeN);
    }

    showStoryNotification() {
        const events = window.GAME_STATE.story.events;
        if (events.length === 0) return;
        const last = events[events.length - 1];
        if (last._notified) return;
        last._notified = true;

        window.audioManager?.storyEvent();

        const typeLabels = {
            main_quest: '📋 主线推进', crisis: '🚨 危机爆发', recovery: '🔧 事件解决',
            secret: '🔮 隐藏发现', unlock: '🔓 区域解锁', hint: '💡 线索提示',
            decision: '⚖️ 关键决策'
        };
        this.notifyTitle.setText(typeLabels[last.type] || '📌 剧情更新');
        this.notifyText.setText(last.description);
        this.storyNotify.setVisible(true);
    }

    // ======== 故事日志 ========
    showStoryLog() {
        const { width, height } = this.cameras.main;
        if (this.logContainer) { this.logContainer.setVisible(!this.logContainer.visible); return; }

        window.audioManager?.uiClick();

        this.logContainer = this.add.container(0, 0).setDepth(400);
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.6); overlay.fillRect(0, 0, width, height);
        this.logContainer.add(overlay);
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1e, 0.95);
        bg.fillRoundedRect(130, 30, 700, 480, 10);
        bg.lineStyle(2, 0x00ffa3, 0.8);
        bg.strokeRoundedRect(130, 30, 700, 480, 10);
        this.logContainer.add(bg);

        this.add.text(480, 48, '📖 故事日志', {
            fontSize: '18px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(401);

        const story = window.GAME_STATE.story;
        const summary = story.getSummary();
        let content = `当前目标: ${summary.mainQuest}\n\n`;
        content += `主线进度: ${'■'.repeat(Math.floor(summary.progress / 10))}${'□'.repeat(10 - Math.floor(summary.progress / 10))} ${summary.progress}%\n\n`;
        const sat = window.GAME_STATE.factionSatisfaction;
        content += `🏛️ 商会: ${sat.merchant}  ⚒️ 矿工: ${sat.miner}  🛡️ 总督: ${sat.governor}\n\n`;
        content += `⚖️ 道德值: ${window.GAME_STATE.player.moral}\n\n`;
        content += `📊 已做决策: ${summary.decisionCount}次\n\n`;

        if (story.events.length > 0) {
            content += '—— 剧情记录 ——\n';
            story.events.slice(-6).forEach(e => {
                const typeMap = { main_quest: '📋', crisis: '🚨', recovery: '🔧', secret: '🔮', unlock: '🔓', hint: '💡', decision: '⚖️' };
                content += `${typeMap[e.type] || '📌'} ${e.description.substring(0, 45)}...\n`;
            });
        }
        if (window.GAME_STATE.flags.blackMarketUnlocked) content += '\n🔓 暗市街区已解锁';

        // ======== 结局预览 ========
        const ending = story.checkEnding();
        if (ending) {
            content += `\n\n—— 当前结局走向 ——\n`;
            content += `🎭 ${ending.title}\n`;
            content += `${ending.description.substring(0, 60)}...\n`;
        } else {
            content += `\n\n🎭 结局尚未触发（继续探索和对话）\n`;
        }

        const logText = this.add.text(155, 75, content, {
            fontSize: '12px', fill: '#e0e0e0', fontFamily: 'Microsoft YaHei', lineSpacing: 6
        }).setDepth(401);
        this.logContainer.add(logText);

        const closeBtn = this.add.text(810, 40, '✕', { fontSize: '16px', fill: '#ff6b35' })
            .setInteractive({ useHandCursor: true }).setDepth(401);
        closeBtn.on('pointerdown', () => this.logContainer.setVisible(false));
        this.logContainer.add(closeBtn);
    }

    // ======== 主循环 ========
    update() {
        if (this.isInDialogue) { this.player.setVelocity(0); return; }

        const speed = this.player.speed;
        let vx = 0, vy = 0;

        // 键盘输入
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        // 虚拟摇杆输入
        if (this.joystick?.active) {
            const dir = this.joystick.getDirection();
            vx = dir.x * speed;
            vy = dir.y * speed;
        }

        // 对角线速度归一化
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }
        this.player.setVelocity(vx, vy);

        this.checkInteraction();

        // ======== 更新决策指示器 ========
        if (!this.decisionBlinking && window.GAME_STATE.story?.getAvailableDecision()) {
            this.decisionBlinking = true;
            this.decisionIndicator.setVisible(true);
            this.tweens.add({
                targets: this.decisionIndicator,
                alpha: { from: 1, to: 0.3 },
                duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            this.decisionIndicator.setStyle({ backgroundColor: '#ffd93d88' });
        } else if (this.decisionBlinking && !window.GAME_STATE.story?.getAvailableDecision()) {
            this.decisionBlinking = false;
            this.tweens.killTweensOf(this.decisionIndicator);
            this.decisionIndicator.setAlpha(1);
            this.decisionIndicator.setVisible(false);
            this.decisionIndicator.setStyle({ backgroundColor: '#0a0a1eCC' });
        }

        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.handleInteract();
        if (Phaser.Input.Keyboard.JustDown(this.qKey)) this.showStoryLog();
        if (Phaser.Input.Keyboard.JustDown(this.iKey)) this.areaPanel.setVisible(!this.areaPanel.visible);
        if (Phaser.Input.Keyboard.JustDown(this.hKey)) this.showTutorial();
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) this.checkAndShowDecision();
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (this.isInDialogue) this.closeDialogue();
            if (this.logContainer?.visible) this.logContainer.setVisible(false);
            if (this.areaPanel?.visible) this.areaPanel.setVisible(false);
            if (this.tutorialContainer?.visible) this.tutorialContainer.setVisible(false);
        }
    }

    checkInteraction() {
        let nearNpc = null, nearDist = Infinity;
        let nearPortal = null, nearPDist = Infinity;

        for (const [id, npc] of Object.entries(this.npcs)) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
            if (d < 65 && d < nearDist) { nearDist = d; nearNpc = id; }
        }
        for (const [id, p] of Object.entries(this.portals)) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.sprite.x, p.sprite.y);
            if (d < 55 && d < nearPDist) { nearPDist = d; nearPortal = id; }
        }

        if (nearNpc) {
            const npc = NPC_DATA[nearNpc];
            const mood = getNpcMood(nearNpc);
            this.interactHint.setText(`${mood} 按 E 与 ${npc.name} 对话`).setVisible(true);
            this.nearestTarget = { type: 'npc', id: nearNpc };
        } else if (nearPortal) {
            const pd = this.portals[nearPortal].data;
            const locked = (pd.id === 'to_blackmarket' && !window.GAME_STATE.flags.blackMarketUnlocked);
            this.interactHint.setText(locked ? '🔒 需要取得信任才能进入暗市' : `按 E 前往 ${pd.label}`).setVisible(true);
            this.nearestTarget = locked ? null : { type: 'portal', id: nearPortal };
        } else {
            this.interactHint.setVisible(false);
            this.nearestTarget = null;
        }
    }

    handleInteract() {
        if (!this.nearestTarget) return;
        if (this.nearestTarget.type === 'npc') {
            this.openDialogue(this.nearestTarget.id);  // fire-and-forget
        } else if (this.nearestTarget.type === 'portal') {
            const pd = this.portals[this.nearestTarget.id].data;
            window.audioManager?.portalActivate();
            window.audioManager?.stopAmbient();
            window.saveManager?.save();
            this.cameras.main.fadeOut(400, 10, 10, 26);
            this.time.delayedCall(400, () => {
                window.audioManager?.sceneTransition();
                this.scene.start(pd.scene);
            });
        }
    }
}
