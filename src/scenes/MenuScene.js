// ============================================================
// MenuScene - 主菜单（标题画面 + 操作说明 + 关于荧河）
// ============================================================

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // ======== 标题背景图 ========
        if (this.textures.exists('title_screen')) {
            this.add.image(width / 2, height / 2, 'title_screen')
                .setDisplaySize(width, height).setDepth(0);
            // 暗化叠层（让按钮更清晰）
            const darkOverlay = this.add.graphics().setDepth(1);
            darkOverlay.fillStyle(0x000000, 0.25);
            darkOverlay.fillRect(0, 0, width, height);
            // 底部渐变（按钮区域更清晰）
            darkOverlay.fillGradientStyle(0, 0, 0x000000, 0x000000, 0, 0, 0.7, 0.7);
            darkOverlay.fillRect(0, height * 0.55, width, height * 0.45);
        } else {
            this.createStarfield();
        }

        // ======== 标题文字（叠加在图片上） ========
        // 仅当无标题图时显示
        if (!this.textures.exists('title_screen')) {
            const title = this.add.text(width / 2, height * 0.22, '星贸纪元', {
                fontSize: '52px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
                stroke: '#0a0a1a', strokeThickness: 6
            }).setOrigin(0.5).setDepth(10);

            const subtitle = this.add.text(width / 2, height * 0.33, '荧河危机', {
                fontSize: '30px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
                stroke: '#0a0a1a', strokeThickness: 4
            }).setOrigin(0.5).setDepth(10);

            const tagline = this.add.text(width / 2, height * 0.42, 'AI驱动的星际贸易决策RPG', {
                fontSize: '14px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setDepth(10);

            this.tweens.add({
                targets: title, y: height * 0.21, duration: 2500,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }

        // ======== 菜单按钮 ========
        const btnY = height * 0.68;
        const btnStyle = {
            fontSize: '20px', fill: '#ffffff', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#0a0a1a', strokeThickness: 3
        };
        const btnStyleHover = { fill: '#00ffa3' };
        const btnStyleOut = { fill: '#ffffff' };

        // 开始游戏
        const startBtn = this.add.text(width / 2 - 100, btnY, '▶ 开始探索', btnStyle)
            .setOrigin(0, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
        startBtn.on('pointerover', () => startBtn.setStyle(btnStyleHover));
        startBtn.on('pointerout', () => startBtn.setStyle(btnStyleOut));
        startBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            this.cameras.main.fadeOut(600, 10, 10, 26);
            this.time.delayedCall(600, () => {
                this.scene.start('HubScene');
            });
        });

        // 继续旅程（有存档时）
        this.continueBtn = null;
        if (window.saveManager?.hasSave()) {
            const continueBtn = this.add.text(width / 2 - 100, btnY + 42, '↻ 继续旅程', {
                ...btnStyle, fill: '#4ecdc4'
            }).setOrigin(0, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
            continueBtn.on('pointerover', () => continueBtn.setStyle({ fill: '#00ffa3' }));
            continueBtn.on('pointerout', () => continueBtn.setStyle({ fill: '#4ecdc4' }));
            continueBtn.on('pointerdown', () => {
                window.audioManager?.init();
                window.audioManager?.uiClick();
                const save = window.saveManager.load();
                if (save) {
                    window.GAME_STATE._pendingRestore = save;
                    this.cameras.main.fadeOut(600, 10, 10, 26);
                    this.time.delayedCall(600, () => {
                        this.scene.start(save.currentScene || 'HubScene');
                    });
                }
            });
            this.continueBtn = continueBtn;
        }

        // 操作说明
        const helpBtn = this.add.text(width / 2 - 100, btnY + 84, '📖 操作说明', btnStyle)
            .setOrigin(0, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
        helpBtn.on('pointerover', () => helpBtn.setStyle(btnStyleHover));
        helpBtn.on('pointerout', () => helpBtn.setStyle(btnStyleOut));
        helpBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            this.showHelpPanel();
        });

        // 关于荧河
        const aboutBtn = this.add.text(width / 2 - 100, btnY + 126, '🌐 关于荧河', btnStyle)
            .setOrigin(0, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
        aboutBtn.on('pointerover', () => aboutBtn.setStyle(btnStyleHover));
        aboutBtn.on('pointerout', () => aboutBtn.setStyle(btnStyleOut));
        aboutBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            this.showAboutPanel();
        });

        // ======== 底部信息 ========
        this.add.text(width / 2, height - 20, '首都经济贸易大学 · 驼灵智能体大赛 · Phaser.js + Coze AI', {
            fontSize: '10px', fill: '#555566', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(10);

        // ======== 渐入 ========
        this.cameras.main.fadeIn(800, 10, 10, 26);

        // 键盘快捷键
        this.input.keyboard.on('keydown-ENTER', () => {
            window.audioManager?.init();
            this.cameras.main.fadeOut(600, 10, 10, 26);
            this.time.delayedCall(600, () => this.scene.start('HubScene'));
        });
        this.input.keyboard.on('keydown-H', () => this.showHelpPanel());
    }

    // ======== 操作说明面板 ========
    showHelpPanel() {
        if (this.helpPanel) { this.helpPanel.setVisible(!this.helpPanel.visible); return; }

        const { width, height } = this.cameras.main;
        this.helpPanel = this.add.container(0, 0).setDepth(100);

        // 遮罩
        const overlay = this.add.graphics().setDepth(99);
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        this.helpPanel.add(overlay);

        // 面板背景
        const pw = 700, ph = 440;
        const px = (width - pw) / 2, py = (height - ph) / 2;
        const bg = this.add.graphics().setDepth(100);
        bg.fillStyle(0x0a0a1e, 0.97);
        bg.fillRoundedRect(px, py, pw, ph, 12);
        bg.lineStyle(2, 0x00ffa3, 0.8);
        bg.strokeRoundedRect(px, py, pw, ph, 12);
        this.helpPanel.add(bg);

        // 标题
        this.helpPanel.add(this.add.text(width / 2, py + 24, '📖 操作说明', {
            fontSize: '20px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101));

        // 内容
        const helpContent = [
            { key: '🎮 基础操作', desc: '' },
            { key: 'WASD / 方向键', desc: '移动角色' },
            { key: 'E', desc: '与NPC对话 / 进入传送门' },
            { key: 'Q', desc: '打开故事日志' },
            { key: 'I', desc: '显示区域信息' },
            { key: 'Esc', desc: '关闭面板/对话' },
            { key: 'H', desc: '显示此帮助面板' },
            { key: '', desc: '' },
            { key: '🌟 游戏目标', desc: '' },
            { key: '', desc: '你是联盟派来的谈判官，需要与荧河空间站的各方势力对话，' },
            { key: '', desc: '了解矛盾、建立信任，最终决定荧河的命运。' },
            { key: '', desc: '' },
            { key: '💡 提示', desc: '' },
            { key: '', desc: '• 多和NPC聊天提升亲密度，解锁更多信息' },
            { key: '', desc: '• 亲密度够高时，暗市街区会解锁' },
            { key: '', desc: '• 你的每个选择都会影响三方势力的满意度' },
            { key: '', desc: '• 游戏有7种不同结局，取决于你的决策' },
            { key: '', desc: '' },
            { key: '📱 手机端', desc: '触摸屏幕移动，使用虚拟按钮交互' },
        ];

        let yPos = py + 56;
        for (const line of helpContent) {
            if (line.key && line.desc) {
                this.helpPanel.add(this.add.text(px + 30, yPos, line.key, {
                    fontSize: '12px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
                }).setDepth(101));
                this.helpPanel.add(this.add.text(px + 200, yPos, line.desc, {
                    fontSize: '12px', fill: '#e0e0e0', fontFamily: 'Microsoft YaHei'
                }).setDepth(101));
            } else if (line.key) {
                this.helpPanel.add(this.add.text(px + 30, yPos, line.key, {
                    fontSize: '13px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
                }).setDepth(101));
            } else if (line.desc) {
                this.helpPanel.add(this.add.text(px + 40, yPos, line.desc, {
                    fontSize: '11px', fill: '#ccccdd', fontFamily: 'Microsoft YaHei'
                }).setDepth(101));
            }
            yPos += 19;
        }

        // 关闭按钮
        const closeBtn = this.add.text(px + pw - 30, py + 8, '✕', {
            fontSize: '18px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setInteractive({ useHandCursor: true }).setDepth(102);
        closeBtn.on('pointerdown', () => this.helpPanel.setVisible(false));
        this.helpPanel.add(closeBtn);
    }

    // ======== 关于荧河面板 ========
    showAboutPanel() {
        if (this.aboutPanel) { this.aboutPanel.setVisible(!this.aboutPanel.visible); return; }

        const { width, height } = this.cameras.main;
        this.aboutPanel = this.add.container(0, 0).setDepth(100);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);
        this.aboutPanel.add(overlay);

        const pw = 650, ph = 400;
        const px = (width - pw) / 2, py = (height - ph) / 2;
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1e, 0.97);
        bg.fillRoundedRect(px, py, pw, ph, 12);
        bg.lineStyle(2, 0xff6b35, 0.8);
        bg.strokeRoundedRect(px, py, pw, ph, 12);
        this.aboutPanel.add(bg);

        this.aboutPanel.add(this.add.text(width / 2, py + 24, '🌐 荧河自由港', {
            fontSize: '20px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5));

        const aboutLines = [
            '联星历217年，荧河自由港。',
            '',
            '这座128年前建站的空间站坐落于三叉航道节点，',
            '是巽风圈最重要的贸易枢纽，常住人口5,200人。',
            '',
            '三方势力在此博弈：',
            '🏛️ 商会联盟 — 流通产生价值，关税越低利润越高',
            '⚒️ 矿工联合会 — 劳动创造价值，矿石养活全站但矿工最苦',
            '🛡️ 总督府 — 秩序稳定，联盟考核的唯一标准',
            '🌑 暗市 — 三方博弈的副产品，灰色交易的温床',
            '',
            '你，是联盟新派来的谈判官。',
            '荧河的命运，由你决定。',
            '',
            '但联盟的真正意图，不只是调解……',
        ];

        let yPos = py + 54;
        for (const line of aboutLines) {
            this.aboutPanel.add(this.add.text(px + 30, yPos, line, {
                fontSize: '12px', fill: line.startsWith('🏛️') || line.startsWith('⚒️') ||
                    line.startsWith('🛡️') || line.startsWith('🌑') ? '#e0e0e0' : '#ccccdd',
                fontFamily: 'Microsoft YaHei',
                fontStyle: line.startsWith('🏛️') || line.startsWith('⚒️') ||
                    line.startsWith('🛡️') || line.startsWith('🌑') ? 'bold' : 'normal'
            }));
            yPos += 20;
        }

        const closeBtn = this.add.text(px + pw - 30, py + 8, '✕', {
            fontSize: '18px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.aboutPanel.setVisible(false));
        this.aboutPanel.add(closeBtn);
    }

    createStarfield() {
        const { width, height } = this.cameras.main;
        const stars = this.add.graphics();
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const alpha = Math.random() * 0.8 + 0.2;
            const size = Math.random() > 0.9 ? 2 : 1;
            stars.fillStyle(0xffffff, alpha);
            stars.fillCircle(x, y, size);
        }
    }
}
