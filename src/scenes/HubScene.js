// ============================================================
// HubScene - 中央大厅（核心枢纽场景）
// 精简版：自由探索 + 故事驱动
// ============================================================

class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        window.GAME_STATE.currentScene = 'HubScene';
        window.GAME_STATE.scene = this;

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0d0d24');

        this.drawScene();
        this.createPlayer();
        this.createNPCs();
        this.createPortals();
        this.setupInput();
        this.createHUD();
        this.createDialogueUI();
        this.createStoryEventUI();

        this.interactHint = this.add.text(width / 2, height - 40, '', {
            fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#1a1a2eCC', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        this.cameras.main.fadeIn(500, 10, 10, 26);
    }

    // ======== 场景绘制 ========
    drawScene() {
        const { width, height } = this.cameras.main;

        // 星空
        const stars = this.add.graphics();
        for (let i = 0; i < 150; i++) {
            stars.fillStyle(0xffffff, Math.random() * 0.6 + 0.1);
            stars.fillCircle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Math.random() > 0.9 ? 2 : 1);
        }

        // 中央平台
        const pf = this.add.graphics();
        pf.fillStyle(0x2a2a4e, 1);
        pf.fillRoundedRect(80, 200, 800, 240, 12);
        pf.lineStyle(2, 0x00ffa3, 0.6);
        pf.strokeRoundedRect(80, 200, 800, 240, 12);

        // 全息屏底座
        pf.fillStyle(0x1a1a2e, 1);
        pf.fillRoundedRect(380, 210, 200, 80, 6);
        pf.lineStyle(1, 0x00ffa3, 0.8);
        pf.strokeRoundedRect(380, 210, 200, 80, 6);

        // 全息屏显示经济概况
        const econ = window.GAME_STATE.economyStatus;
        this.add.text(480, 230, `GDP: ${econ.gdp}`, { fontSize: '11px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5).setDepth(5);
        this.add.text(480, 248, `通胀: ${econ.inflation}`, { fontSize: '10px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5).setDepth(5);
        this.add.text(480, 266, `贸易: ${econ.tradeBalance}`, { fontSize: '10px', fill: '#ffffff', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5).setDepth(5);

        // 标题
        this.add.text(width / 2, 30, '荧河空间站 · 中央大厅', {
            fontSize: '18px', fill: '#ffffff', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#1a1a2eCC', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(5);
    }

    // ======== 玩家 ========
    createPlayer() {
        const { width, height } = this.cameras.main;
        this.player = this.physics.add.sprite(width / 2, height * 0.6, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.speed = 160;
    }

    // ======== NPC ========
    createNPCs() {
        this.npcs = {};
        const pos = {
            chen_boss: { x: 200, y: 320 },
            ajie: { x: 300, y: 360 }
        };

        for (const [id, p] of Object.entries(pos)) {
            const d = NPC_DATA[id];
            const s = this.physics.add.sprite(p.x, p.y, `npc_${id}`).setImmovable(true).setDepth(8);
            s.npcId = id;

            this.add.text(p.x, p.y - 24, d.name, {
                fontSize: '10px', fill: '#' + d.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0a1aAA', padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(12);

            this.npcs[id] = { sprite: s, data: d };
        }
    }

    // ======== 传送门 ========
    createPortals() {
        const { width, height } = this.cameras.main;
        this.portals = {};

        const data = [
            { id: 'to_governor', label: '总督办公室', x: 880, y: 300, scene: 'GovernorScene', color: 0x4a90d9 },
            { id: 'to_mining', label: '矿业营地', x: 80, y: 300, scene: 'MiningScene', color: 0xd4a574 },
            { id: 'to_port', label: '星际港口', x: 480, y: 440, scene: 'PortScene', color: 0x7b8ea0 },
            { id: 'to_blackmarket', label: '暗市街区', x: 480, y: 210, scene: 'BlackMarketScene', color: 0xc77dff }
        ];

        for (const pd of data) {
            const isLocked = (pd.id === 'to_blackmarket' && !window.GAME_STATE.flags.blackMarketUnlocked);
            const portal = this.add.sprite(pd.x, pd.y, 'portal').setDepth(6).setInteractive();

            const label = this.add.text(pd.x, pd.y + 26, isLocked ? '???' : pd.label, {
                fontSize: '10px',
                fill: isLocked ? '#555555' : '#' + pd.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setDepth(12);

            if (isLocked) {
                this.add.text(pd.x, pd.y, '🔒', { fontSize: '16px' }).setOrigin(0.5).setDepth(12);
                portal.setAlpha(0.3);
            }

            this.tweens.add({
                targets: portal,
                alpha: isLocked ? 0.3 : 0.8,
                duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            this.portals[pd.id] = { sprite: portal, label, data: pd };
        }
    }

    // ======== 输入 ========
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.qKey = this.input.keyboard.addKey('Q');  // 打开故事日志
    }

    // ======== HUD ========
    createHUD() {
        const { width } = this.cameras.main;
        this.hud = {};

        const hudBg = this.add.graphics();
        hudBg.fillStyle(0x1a1a2e, 0.85);
        hudBg.fillRect(0, 0, width, 36);
        hudBg.lineStyle(1, 0x00ffa3, 0.5);
        hudBg.lineBetween(0, 36, width, 36);

        this.hud.creditsText = this.add.text(10, 8, `星币: ${window.GAME_STATE.player.credits}`, {
            fontSize: '12px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei'
        }).setDepth(50);

        this.hud.moralText = this.add.text(150, 8, `道德: ${window.GAME_STATE.player.moral}`, {
            fontSize: '12px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setDepth(50);

        // 满意度条
        const sat = window.GAME_STATE.factionSatisfaction;
        this.drawSatBar(width - 300, 10, '商', sat.merchant, 0xff6b35);
        this.drawSatBar(width - 200, 10, '矿', sat.miner, 0xd4a574);
        this.drawSatBar(width - 100, 10, '督', sat.governor, 0x4a90d9);

        // 底线操作提示
        this.add.text(width / 2, 528, 'WASD移动 · E对话/交互 · Q故事日志 · Esc关闭', {
            fontSize: '10px', fill: '#444466', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(50);
    }

    drawSatBar(x, y, label, value, color) {
        this.add.graphics().setDepth(50).fillStyle(0x333333, 1).fillRoundedRect(x, y, 60, 8, 2);
        this.add.graphics().setDepth(50).fillStyle(color, 1).fillRoundedRect(x, y, 60 * (value / 100), 8, 2);
        this.add.text(x - 16, y - 2, label, {
            fontSize: '10px', fill: '#' + color.toString(16).padStart(6, '0'), fontFamily: 'Microsoft YaHei'
        }).setDepth(50);
    }

    updateHUD() {
        this.hud.creditsText?.setText(`星币: ${window.GAME_STATE.player.credits}`);
        this.hud.moralText?.setText(`道德: ${window.GAME_STATE.player.moral}`);
    }

    // ======== 对话UI（带NPC头像） ========
    createDialogueUI() {
        const { width, height } = this.cameras.main;

        this.dialogueContainer = this.add.container(0, 0).setDepth(200).setVisible(false);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.5);
        overlay.fillRect(0, 0, width, height);
        this.dialogueContainer.add(overlay);

        const dBg = this.add.graphics();
        dBg.fillStyle(0x1a1a2e, 0.95);
        dBg.fillRoundedRect(80, height - 220, width - 160, 195, 10);
        dBg.lineStyle(2, 0x00ffa3, 0.8);
        dBg.strokeRoundedRect(80, height - 220, width - 160, 195, 10);
        this.dialogueContainer.add(dBg);

        // NPC头像（左侧）
        this.dialoguePortrait = this.add.image(140, height - 125, 'portrait_player').setDisplaySize(80, 80).setDepth(201);
        this.dialogueContainer.add(this.dialoguePortrait);

        // 头像框装饰
        const portraitFrame = this.add.graphics();
        portraitFrame.lineStyle(2, 0x00ffa3, 0.8);
        portraitFrame.strokeRoundedRect(98, height - 168, 84, 84, 6);
        this.dialogueContainer.add(portraitFrame);

        this.dialogueName = this.add.text(195, height - 210, '', {
            fontSize: '15px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setDepth(201);
        this.dialogueContainer.add(this.dialogueName);

        // 亲密度小标签
        this.dialogueIntimacy = this.add.text(350, height - 208, '', {
            fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setDepth(201);
        this.dialogueContainer.add(this.dialogueIntimacy);

        this.dialogueText = this.add.text(195, height - 185, '', {
            fontSize: '13px', fill: '#ffffff', fontFamily: 'Microsoft YaHei',
            wordWrap: { width: width - 330 }
        }).setDepth(201);
        this.dialogueContainer.add(this.dialogueText);

        // 输入框
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0x0d0d24, 0.9);
        inputBg.fillRoundedRect(100, height - 80, width - 340, 36, 6);
        inputBg.lineStyle(1, 0x4ecdc4, 0.6);
        inputBg.strokeRoundedRect(100, height - 80, width - 340, 36, 6);
        this.dialogueContainer.add(inputBg);

        this.dialogueInput = this.add.dom(110, height - 68).createFromHTML(
            '<input type="text" id="chat-input" placeholder="输入消息与NPC对话..." style="width:470px;height:30px;background:transparent;border:none;color:#ffffff;font-size:13px;font-family:Microsoft YaHei;outline:none;">'
        ).setDepth(202);
        this.dialogueContainer.add(this.dialogueInput);

        const sendBtn = this.add.text(width - 220, height - 72, '发送', {
            fontSize: '13px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#00ffa3', padding: { x: 16, y: 6 }
        }).setInteractive({ useHandCursor: true }).setDepth(202);
        sendBtn.on('pointerdown', () => this.sendDialogueMessage());
        this.dialogueContainer.add(sendBtn);

        // 故事选项按钮
        this.storyChoiceBtn = this.add.text(width - 140, height - 72, '', {
            fontSize: '12px', fill: '#fff', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#2a2a4e', padding: { x: 10, y: 5 }
        }).setInteractive({ useHandCursor: true }).setDepth(202).setVisible(false);
        this.storyChoiceBtn.on('pointerdown', () => this.handleStoryChoice());

        const closeBtn = this.add.text(width - 110, height - 215, '✕', {
            fontSize: '16px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setInteractive({ useHandCursor: true }).setDepth(201);
        closeBtn.on('pointerdown', () => this.closeDialogue());
        this.dialogueContainer.add(closeBtn);
        this.dialogueContainer.add(this.storyChoiceBtn);
    }

    openDialogue(npcId) {
        this.isInDialogue = true;
        this.currentDialogueNpc = npcId;
        const npc = NPC_DATA[npcId];

        this.dialogueName.setText(npc.name);
        this.dialogueName.setColor('#' + npc.color.toString(16).padStart(6, '0'));

        // 显示NPC头像
        const portraitKey = `portrait_npc_${npcId}`;
        if (this.textures.exists(portraitKey)) {
            this.dialoguePortrait.setTexture(portraitKey);
        }
        this.dialoguePortrait.setDisplaySize(80, 80);

        // 显示亲密度
        const intimacy = window.GAME_STATE.relationships.getIntimacy(npcId);
        this.dialogueIntimacy.setText(`♥ 亲密度: ${intimacy}`);

        // 首次对话触发剧情推进
        const response = window.GAME_STATE.dialogue.sendMessage(npcId, '你好');
        this.dialogueText.setText(response);
        this.dialogueContainer.setVisible(true);

        window.GAME_STATE.relationships.onDialogue(npcId);
        window.GAME_STATE.story.onImportantDialogue(npcId);
        this.updateHUD();

        // 显示剧情事件通知
        this.showStoryNotification();
    }

    async sendDialogueMessage() {
        const inputEl = document.getElementById('chat-input');
        if (!inputEl || !inputEl.value.trim()) return;

        const message = inputEl.value.trim();
        inputEl.value = '';
        this.dialogueText.setText('...');

        const response = await window.GAME_STATE.dialogue.sendMessage(this.currentDialogueNpc, message);
        this.dialogueText.setText(response);

        window.GAME_STATE.relationships.onDialogue(this.currentDialogueNpc);
        // 刷新亲密度显示
        const intimacy = window.GAME_STATE.relationships.getIntimacy(this.currentDialogueNpc);
        this.dialogueIntimacy.setText(`♥ 亲密度: ${intimacy}`);
        this.updateHUD();

        // 检查黑市解锁
        if (window.GAME_STATE.story.checkBlackMarketUnlock()) {
            this.showStoryNotification();
            this.scene.restart();
        }
    }

    closeDialogue() {
        this.isInDialogue = false;
        this.dialogueContainer.setVisible(false);
        this.currentDialogueNpc = null;
    }

    handleStoryChoice() {
        // 叙事决策：由对话系统触发
        // 简化为：对话中的关键决策直接通过对话文本触发
        this.closeDialogue();
    }

    // ======== 剧情事件通知 ========
    createStoryEventUI() {
        const { width, height } = this.cameras.main;

        this.storyNotify = this.add.container(0, 0).setDepth(150).setVisible(false);

        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1a, 0.85);
        bg.fillRoundedRect(width / 2 - 250, 60, 500, 100, 8);
        bg.lineStyle(2, 0xffd93d, 0.8);
        bg.strokeRoundedRect(width / 2 - 250, 60, 500, 100, 8);
        this.storyNotify.add(bg);

        this.notifyTitle = this.add.text(width / 2, 75, '', {
            fontSize: '14px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.storyNotify.add(this.notifyTitle);

        this.notifyText = this.add.text(width / 2, 105, '', {
            fontSize: '11px', fill: '#ffffff', fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 460 }, align: 'center'
        }).setOrigin(0.5);
        this.storyNotify.add(this.notifyText);

        const closeN = this.add.text(width / 2, 145, '点此关闭', {
            fontSize: '10px', fill: '#666666', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeN.on('pointerdown', () => this.storyNotify.setVisible(false));
        this.storyNotify.add(closeN);
    }

    showStoryNotification() {
        const story = window.GAME_STATE.story;
        const events = story.events;
        if (events.length === 0) return;

        const last = events[events.length - 1];
        if (last._notified) return;
        last._notified = true;

        const typeLabels = {
            main_quest: '📋 主线推进',
            crisis: '🚨 危机爆发',
            recovery: '🔧 事件解决',
            secret: '🔮 隐藏发现',
            unlock: '🔓 区域解锁',
            hint: '💡 线索提示'
        };

        this.notifyTitle.setText(typeLabels[last.type] || '📌 剧情更新');
        this.notifyText.setText(last.description);
        this.storyNotify.setVisible(true);
    }

    // ======== 故事日志 ========
    showStoryLog() {
        const { width, height } = this.cameras.main;
        if (this.logContainer) {
            this.logContainer.setVisible(!this.logContainer.visible);
            return;
        }

        this.logContainer = this.add.container(0, 0).setDepth(300);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.6);
        overlay.fillRect(0, 0, width, height);
        this.logContainer.add(overlay);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.95);
        bg.fillRoundedRect(130, 40, 700, 460, 10);
        bg.lineStyle(2, 0x00ffa3, 0.8);
        bg.strokeRoundedRect(130, 40, 700, 460, 10);
        this.logContainer.add(bg);

        this.add.text(480, 55, '📖 故事日志', {
            fontSize: '18px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(301);

        const story = window.GAME_STATE.story;
        const summary = story.getSummary();

        let content = `当前目标: ${summary.mainQuest}\n\n`;
        content += `主线进度: ${'■'.repeat(Math.floor(summary.progress / 10))}${'□'.repeat(10 - Math.floor(summary.progress / 10))} ${summary.progress}%\n\n`;

        content += `三方满意度:\n`;
        const sat = window.GAME_STATE.factionSatisfaction;
        content += `🏛️ 商会: ${sat.merchant}  |  ⚒️ 矿工: ${sat.miner}  |  🛡️ 总督: ${sat.governor}\n\n`;

        content += `道德值: ${window.GAME_STATE.player.moral}\n\n`;

        if (story.events.length > 0) {
            content += `——剧情记录——\n`;
            const recent = story.events.slice(-5);
            for (const e of recent) {
                const typeMap = { main_quest: '📋', crisis: '🚨', recovery: '🔧', secret: '🔮', unlock: '🔓', hint: '💡' };
                content += `${typeMap[e.type] || '📌'} ${e.description.substring(0, 40)}...\n`;
            }
        }

        if (window.GAME_STATE.flags.blackMarketUnlocked) {
            content += '\n🔓 暗市街区已解锁 - 前往中央大厅下方传送门';
        }

        const logText = this.add.text(160, 80, content, {
            fontSize: '12px', fill: '#ffffff', fontFamily: 'Microsoft YaHei',
            lineSpacing: 6
        }).setDepth(301);
        this.logContainer.add(logText);

        const closeBtn = this.add.text(800, 50, '✕', {
            fontSize: '16px', fill: '#ff6b35'
        }).setInteractive({ useHandCursor: true }).setDepth(301);
        closeBtn.on('pointerdown', () => this.logContainer.setVisible(false));
        this.logContainer.add(closeBtn);
    }

    // ======== 主循环 ========
    update() {
        if (this.isInDialogue) {
            this.player.setVelocity(0);
            return;
        }

        // 移动
        const speed = this.player.speed;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
        this.player.setVelocity(vx, vy);

        // 交互检测
        this.checkInteraction();

        // 快捷键
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.handleInteract();
        if (Phaser.Input.Keyboard.JustDown(this.qKey)) this.showStoryLog();
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (this.isInDialogue) this.closeDialogue();
            if (this.logContainer?.visible) this.logContainer.setVisible(false);
        }
    }

    checkInteraction() {
        let nearNpc = null, nearDist = Infinity;
        let nearPortal = null, nearPDist = Infinity;

        for (const [id, npc] of Object.entries(this.npcs)) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
            if (d < 60 && d < nearDist) { nearDist = d; nearNpc = id; }
        }
        for (const [id, p] of Object.entries(this.portals)) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.sprite.x, p.sprite.y);
            if (d < 50 && d < nearPDist) { nearPDist = d; nearPortal = id; }
        }

        if (nearNpc) {
            this.interactHint.setText(`按E与 ${NPC_DATA[nearNpc].name} 对话`).setVisible(true);
            this.nearestTarget = { type: 'npc', id: nearNpc };
        } else if (nearPortal) {
            const pd = this.portals[nearPortal].data;
            const locked = (pd.id === 'to_blackmarket' && !window.GAME_STATE.flags.blackMarketUnlocked);
            this.interactHint.setText(locked ? '暗市街区 - 需要取得三方信任才能解锁' : `按E前往 ${pd.label}`).setVisible(true);
            this.nearestTarget = locked ? null : { type: 'portal', id: nearPortal };
        } else {
            this.interactHint.setVisible(false);
            this.nearestTarget = null;
        }
    }

    handleInteract() {
        if (!this.nearestTarget) return;

        if (this.nearestTarget.type === 'npc') {
            this.openDialogue(this.nearestTarget.id);
        } else if (this.nearestTarget.type === 'portal') {
            const pd = this.portals[this.nearestTarget.id].data;
            if (pd.scene) {
                this.cameras.main.fadeOut(400, 10, 10, 26);
                this.time.delayedCall(400, () => this.scene.start(pd.scene));
            }
        }
    }
}