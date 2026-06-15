// ============================================================
// BootScene - 加载与初始化（含背景图+标题画面+存档恢复）
// ============================================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // 加载进度条
        const barW = 400, barH = 20;
        const barX = (width - barW) / 2, barY = height / 2 + 30;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1a1a2e, 1);
        barBg.fillRoundedRect(barX, barY, barW, barH, 4);
        const barFill = this.add.graphics();

        const title = this.add.text(width / 2, height / 2 - 40, '星贸纪元：荧河危机', {
            fontSize: '24px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, height / 2 - 10, 'YINGHE FREE PORT · 联星历217年', {
            fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        const tipText = this.add.text(width / 2, height / 2 + 70, '正在加载资源...', {
            fontSize: '12px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        // 加载提示轮播
        const tips = [
            '💡 多与NPC对话可以提升亲密度',
            '💡 亲密度越高，NPC透露的信息越多',
            '💡 暗市街区需要取得信任后才能进入',
            '💡 你的每个选择都会影响三方势力的满意度',
            '💡 荧河有7种不同的结局等你发现'
        ];
        let tipIdx = 0;
        const tipTimer = this.time.addEvent({
            delay: 3000, loop: true,
            callback: () => {
                tipIdx = (tipIdx + 1) % tips.length;
                tipText.setText(tips[tipIdx]);
            }
        });

        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0x00ffa3, 1);
            barFill.fillRoundedRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4, 3);
        });

        this.load.on('complete', () => {
            tipTimer.remove();
            tipText.setText('加载完成！');
        });

        // ---- 标题画面 ----
        this.load.image('title_screen', 'assets/backgrounds/title_screen.jpg');

        // ---- 场景背景图 ----
        this.load.image('bg_hub', 'assets/backgrounds/bg_hub.png');
        this.load.image('bg_governor', 'assets/backgrounds/bg_governor.png');
        this.load.image('bg_mining', 'assets/backgrounds/bg_mining.png');
        this.load.image('bg_port', 'assets/backgrounds/bg_port.png');
        this.load.image('bg_blackmarket', 'assets/backgrounds/bg_blackmarket.png');

        // ---- 角色精灵图 ----
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('portal', 'assets/sprites/portal.png');
        this.load.image('npc_chen_boss', 'assets/sprites/npc_chen_boss.png');
        this.load.image('npc_ajie', 'assets/sprites/npc_ajie.png');
        this.load.image('npc_governor_lin', 'assets/sprites/npc_governor_lin.png');
        this.load.image('npc_lao_zhao', 'assets/sprites/npc_lao_zhao.png');
        this.load.image('npc_xiao_mei', 'assets/sprites/npc_xiao_mei.png');
        this.load.image('npc_captain_su', 'assets/sprites/npc_captain_su.png');
        this.load.image('npc_jiu_jie', 'assets/sprites/npc_jiu_jie.png');
        this.load.image('npc_mysterious', 'assets/sprites/npc_mysterious.png');

        // ---- 对话头像 ----
        this.load.image('portrait_player', 'assets/sprites/portraits/player.png');
        this.load.image('portrait_npc_chen_boss', 'assets/sprites/portraits/npc_chen_boss.png');
        this.load.image('portrait_npc_ajie', 'assets/sprites/portraits/npc_ajie.png');
        this.load.image('portrait_npc_governor_lin', 'assets/sprites/portraits/npc_governor_lin.png');
        this.load.image('portrait_npc_lao_zhao', 'assets/sprites/portraits/npc_lao_zhao.png');
        this.load.image('portrait_npc_xiao_mei', 'assets/sprites/portraits/npc_xiao_mei.png');
        this.load.image('portrait_npc_captain_su', 'assets/sprites/portraits/npc_captain_su.png');
        this.load.image('portrait_npc_jiu_jie', 'assets/sprites/portraits/npc_jiu_jie.png');
        this.load.image('portrait_npc_mysterious', 'assets/sprites/portraits/npc_mysterious.png');
    }

    create() {
        // 初始化系统
        window.GAME_STATE.relationships = new RelationshipSystem();
        window.GAME_STATE.dialogue = new DialogueSystem();
        window.GAME_STATE.story = new StorySystem();

        // 恢复存档
        if (window.GAME_STATE._pendingRestore) {
            window.saveManager.restore(window.GAME_STATE._pendingRestore);
            delete window.GAME_STATE._pendingRestore;
        }

        // Coze连接配置（从URL参数读取,bot_id有默认值只需token）
        const urlParams = new URLSearchParams(window.location.search);
        const apiToken = urlParams.get('token') || '';
        if (apiToken) {
            // CozeBridge构造函数中已读取bot_id/token,这里只需确保配置正确
            if (window.cozeBridge) {
                window.cozeBridge.apiToken = apiToken;
                window.cozeBridge.isConnected = true;
            }
            console.log('[Boot] Coze Bridge 已配置,token长度:', apiToken.length);
        } else {
            console.log('[Boot] Coze Bridge 未配置token,使用本地回退模式');
        }

        this.time.delayedCall(400, () => {
            // 检查是否需要播放开场动画
            const skipIntro = localStorage.getItem('yinghe_intro_seen') === '1';
            if (skipIntro) {
                console.log('[Boot] 已跳过开场，直接进入菜单');
                this.scene.start('MenuScene');
            } else {
                console.log('[Boot] 启动开场动画');
                this.scene.start('IntroScene');
            }
        });
    }
}

// ============================================================
// 增强版对话UI工厂（所有场景共用）- 增强版
// ============================================================
window.createEnhancedDialogue = function(scene, inputId, accentColor) {
    const { width, height } = scene.cameras.main;
    const container = scene.add.container(0, 0).setDepth(200).setVisible(false);

    // 半透明遮罩
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, width, height);
    container.add(overlay);

    // 对话面板底板
    const panelX = 40, panelY = height - 260, panelW = width - 80, panelH = 240;
    const panelBg = scene.add.graphics();
    panelBg.fillStyle(0x0a0a1e, 0.95);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panelBg.lineStyle(2, accentColor, 0.9);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    panelBg.fillStyle(accentColor, 0.3);
    panelBg.fillRect(panelX + 12, panelY + 2, panelW - 24, 3);
    container.add(panelBg);

    // ---- 左侧：NPC角色卡 ----
    const cardX = panelX + 16, cardY = panelY + 16;
    const cardBg = scene.add.graphics();
    cardBg.fillStyle(0x1a1a3e, 0.8);
    cardBg.fillRoundedRect(cardX, cardY, 120, 200, 8);
    cardBg.lineStyle(1, accentColor, 0.5);
    cardBg.strokeRoundedRect(cardX, cardY, 120, 200, 8);
    container.add(cardBg);

    scene.dlgPortrait = scene.add.image(cardX + 60, cardY + 60, 'portrait_player').setDisplaySize(90, 90).setDepth(201);
    container.add(scene.dlgPortrait);

    scene.dlgFactionBar = scene.add.graphics();
    scene.dlgFactionBar.fillStyle(accentColor, 0.6);
    scene.dlgFactionBar.fillRect(cardX + 10, cardY + 112, 100, 3);
    container.add(scene.dlgFactionBar);

    scene.dlgName = scene.add.text(cardX + 60, cardY + 122, '', {
        fontSize: '14px', fill: '#ffffff', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(201);
    container.add(scene.dlgName);

    scene.dlgTitle = scene.add.text(cardX + 60, cardY + 142, '', {
        fontSize: '9px', fill: '#aaaacc', fontFamily: 'Microsoft YaHei'
    }).setOrigin(0.5).setDepth(201);
    container.add(scene.dlgTitle);

    scene.dlgFaction = scene.add.text(cardX + 60, cardY + 160, '', {
        fontSize: '9px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
    }).setOrigin(0.5).setDepth(201);
    container.add(scene.dlgFaction);

    scene.dlgHearts = scene.add.text(cardX + 60, cardY + 180, '', {
        fontSize: '11px', fill: '#ff6b9d', fontFamily: 'Microsoft YaHei'
    }).setOrigin(0.5).setDepth(201);
    container.add(scene.dlgHearts);

    // ---- 右侧：对话内容区 ----
    const chatX = cardX + 136, chatY = cardY + 4;
    const chatW = panelW - 160;

    scene.dlgText = scene.add.text(chatX, chatY + 10, '', {
        fontSize: '13px', fill: '#e0e0e0', fontFamily: 'Microsoft YaHei',
        lineSpacing: 4, wordWrap: { width: chatW - 20 }
    }).setDepth(201);
    container.add(scene.dlgText);

    scene.dlgTyping = scene.add.text(chatX, chatY + 10, '● ● ●', {
        fontSize: '14px', fill: '#' + accentColor.toString(16).padStart(6, '0'), fontFamily: 'Microsoft YaHei'
    }).setDepth(201).setVisible(false);
    container.add(scene.dlgTyping);

    // ---- 输入区域 ----
    const inputY = panelY + panelH - 50;
    const inputBg = scene.add.graphics();
    inputBg.fillStyle(0x0d0d24, 0.9);
    inputBg.fillRoundedRect(chatX - 4, inputY, chatW + 4, 36, 6);
    inputBg.lineStyle(1, accentColor, 0.4);
    inputBg.strokeRoundedRect(chatX - 4, inputY, chatW + 4, 36, 6);
    container.add(inputBg);

    // 创建输入框
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.id = inputId;
    inputEl.placeholder = '输入消息与NPC对话…';
    inputEl.style.cssText = `width:${chatW - 90}px;height:28px;background:transparent;border:none;color:#ffffff;font-size:13px;font-family:Microsoft YaHei;outline:none;`;

    scene.dlgInput = scene.add.dom(chatX + 4, inputY + 8).createFromHTML(inputEl.outerHTML);
    container.add(scene.dlgInput);

    // 发送按钮 - 鼠标点击
    const sendBtn = scene.add.text(chatX + chatW - 72, inputY + 4, '发 送', {
        fontSize: '12px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
        backgroundColor: '#' + accentColor.toString(16).padStart(6, '0'), padding: { x: 14, y: 6 }
    }).setInteractive({ useHandCursor: true }).setDepth(202);
    container.add(sendBtn);
    
    // 添加 touchstart 支持到发送按钮
    sendBtn.on('touchstart', (pointer) => {
        pointer.event.preventDefault();
        scene.handleSendDialogue?.();
    });

    // 关闭按钮
    const closeBtn = scene.add.text(panelX + panelW - 30, panelY + 8, '✕', {
        fontSize: '16px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
    }).setInteractive({ useHandCursor: true }).setDepth(201);
    container.add(closeBtn);

    // ---- 快捷操作按钮 ----
    scene.dlgQuickBtns = [];
    const quickActions = ['询问情况', '打听消息', '闲聊'];
    quickActions.forEach((action, i) => {
        const btn = scene.add.text(chatX + i * 90, panelY + panelH - 50 - 36, action, {
            fontSize: '10px', fill: '#aaaacc', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#1a1a3e', padding: { x: 8, y: 4 }
        }).setInteractive({ useHandCursor: true }).setDepth(201);
        btn.on('pointerdown', () => {
            const inputEl = document.getElementById(inputId);
            if (inputEl) { inputEl.value = action; }
            scene.handleSendDialogue?.();
        });
        // 添加 touchstart 支持
        btn.on('touchstart', (pointer) => {
            pointer.event.preventDefault();
            const inputEl = document.getElementById(inputId);
            if (inputEl) { inputEl.value = action; }
            scene.handleSendDialogue?.();
        });
        container.add(btn);
        scene.dlgQuickBtns.push(btn);
    });

    // ---- 事件绑定 ----
    sendBtn.on('pointerdown', () => scene.handleSendDialogue?.());
    closeBtn.on('pointerdown', () => {
        container.setVisible(false);
        scene.isInDialogue = false;
    });
    closeBtn.on('touchstart', (pointer) => {
        pointer.event.preventDefault();
        container.setVisible(false);
        scene.isInDialogue = false;
    });

    scene.input.keyboard.on('keydown-ENTER', () => {
        if (scene.isInDialogue) scene.handleSendDialogue?.();
    });

    return container;
};

// ---- 辅助函数 ----
window.getIntimacyHearts = function(level) {
    const max = 10;
    const filled = Math.min(level, max);
    const empty = max - filled;
    return '♥'.repeat(filled) + '♡'.repeat(empty);
};

window.getNpcMood = function(npcId) {
    const intimacy = window.GAME_STATE.relationships?.getIntimacy(npcId) || 0;
    if (intimacy >= 8) return '😊';
    if (intimacy >= 5) return '🙂';
    if (intimacy >= 3) return '😐';
    return '😶';
};

window.getFactionInfo = function(faction) {
    const map = {
        merchant: { icon: '🏛️', name: '商会联盟', color: 0xff6b35 },
        governor: { icon: '🛡️', name: '总督府', color: 0x4a90d9 },
        miner:    { icon: '⚒️', name: '矿工联合会', color: 0xd4a574 },
        neutral:  { icon: '⚖️', name: '中立', color: 0x4ecdc4 },
        gray:     { icon: '🌑', name: '灰色地带', color: 0xc77dff },
        unknown:  { icon: '❓', name: '???', color: 0x888888 }
    };
    return map[faction] || map.neutral;
};

window.createAreaInfoPanel = function(scene, title, subtitle, npcList, accentColor) {
    const { width } = scene.cameras.main;
    const panel = scene.add.container(0, 0).setDepth(150).setVisible(false);

    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0a1e, 0.9);
    bg.fillRoundedRect(width - 220, 45, 210, 60 + npcList.length * 22 + 30, 8);
    bg.lineStyle(1, accentColor, 0.5);
    bg.strokeRoundedRect(width - 220, 45, 210, 60 + npcList.length * 22 + 30, 8);
    panel.add(bg);

    panel.add(scene.add.text(width - 210, 52, title, {
        fontSize: '13px', fill: '#' + accentColor.toString(16).padStart(6, '0'),
        fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
    }).setDepth(151));

    panel.add(scene.add.text(width - 210, 70, subtitle, {
        fontSize: '9px', fill: '#8888aa', fontFamily: 'Microsoft YaHei'
    }).setDepth(151));

    const sep = scene.add.graphics();
    sep.lineStyle(1, accentColor, 0.3);
    sep.lineBetween(width - 215, 86, width - 20, 86);
    panel.add(sep);

    npcList.forEach((npc, i) => {
        const faction = getFactionInfo(npc.faction);
        panel.add(scene.add.text(width - 210, 92 + i * 22, `${faction.icon} ${npc.name}`, {
            fontSize: '11px', fill: '#ccccdd', fontFamily: 'Microsoft YaHei'
        }).setDepth(151));
        panel.add(scene.add.text(width - 30, 92 + i * 22, `${faction.name}`, {
            fontSize: '8px', fill: '#' + faction.color.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(1, 0).setDepth(151));
    });

    panel.add(scene.add.text(width - 210, 96 + npcList.length * 22, '按 I 切换面板', {
        fontSize: '8px', fill: '#555566', fontFamily: 'Microsoft YaHei'
    }).setDepth(151));

    return panel;
};

// ---- 传送门粒子效果 ----
window.createPortalParticles = function(scene, x, y, color) {
    const particles = [];
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const p = scene.add.circle(
            x + Math.cos(angle) * 18,
            y + Math.sin(angle) * 18,
            2, color, 0.7
        ).setDepth(7);
        scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            alpha: 0,
            scale: 0.3,
            duration: 1200 + Math.random() * 600,
            repeat: -1,
            delay: i * 150,
            ease: 'Sine.easeInOut',
            onRepeat: () => {
                p.setPosition(
                    x + Math.cos(angle) * 12,
                    y + Math.sin(angle) * 12
                );
                p.setAlpha(0.7).setScale(1);
            }
        });
        particles.push(p);
    }
    return particles;
};
