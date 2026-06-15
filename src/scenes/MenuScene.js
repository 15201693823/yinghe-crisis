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
            const bgImage = this.add.image(width / 2, height / 2, 'title_screen')
                .setDisplaySize(width, height).setDepth(0);
            
            // 顶部渐变遮罩（让标题文字更清晰）
            const topOverlay = this.add.graphics().setDepth(1);
            topOverlay.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.75, 0.75, 0, 0);
            topOverlay.fillRect(0, 0, width, height * 0.45);
            
            // 底部渐变遮罩（让按钮更清晰）
            const bottomOverlay = this.add.graphics().setDepth(1);
            bottomOverlay.fillGradientStyle(0, 0, 0x000000, 0x000000, 0, 0, 0.8, 0.8);
            bottomOverlay.fillRect(0, height * 0.55, width, height * 0.45);
            
            // 中间微调遮罩（让中间过渡更自然）
            const midOverlay = this.add.graphics().setDepth(1);
            midOverlay.fillStyle(0x000000, 0.15);
            midOverlay.fillRect(0, height * 0.4, width, height * 0.2);
        } else {
            this.createStarfield();
        }

        // ======== 游戏标题（无论有无背景图都显示） ========
        // 主标题：星贸纪元
        const titleShadow = this.add.text(width / 2 + 3, height * 0.18 + 3, '星贸纪元', {
            fontSize: '58px', fill: '#000000', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(15).setAlpha(0.5);
        
        const title = this.add.text(width / 2, height * 0.18, '星贸纪元', {
            fontSize: '58px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#0a0a1a', strokeThickness: 6
        }).setOrigin(0.5).setDepth(16);

        // 副标题：荧河危机
        const subtitleShadow = this.add.text(width / 2 + 2, height * 0.27 + 2, '荧河危机', {
            fontSize: '32px', fill: '#000000', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(15).setAlpha(0.5);
        
        const subtitle = this.add.text(width / 2, height * 0.27, '荧河危机', {
            fontSize: '32px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#0a0a1a', strokeThickness: 4
        }).setOrigin(0.5).setDepth(16);

        // 标语
        const tagline = this.add.text(width / 2, height * 0.35, 'AI驱动的星际贸易决策RPG', {
            fontSize: '14px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(16);

        // 标题浮动动画
        this.tweens.add({
            targets: [title, titleShadow, subtitle, subtitleShadow],
            y: '+=6',
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ======== 菜单按钮（居中大按钮，适合手机触摸） ========
        const btnCenterX = width / 2;
        const btnStartY = height * 0.48;
        const btnWidth = 220;
        const btnHeight = 50;
        const btnSpacing = 60;
        
        // 按钮样式配置
        const btnBgColor = 0x0a2a1a;
        const btnBgHover = 0x00ffa3;
        const btnBorderColor = 0x00ffa3;
        
        // 创建按钮背景的工厂函数
        const createBtnBg = (y) => {
            const bg = this.add.graphics().setDepth(9);
            bg.fillStyle(btnBgColor, 0.9);
            bg.fillRoundedRect(btnCenterX - btnWidth/2, y - btnHeight/2, btnWidth, btnHeight, 10);
            bg.lineStyle(2, btnBorderColor, 0.8);
            bg.strokeRoundedRect(btnCenterX - btnWidth/2, y - btnHeight/2, btnWidth, btnHeight, 10);
            return bg;
        };
        
        // 按钮文字样式
        const btnTextStyle = {
            fontSize: '22px', 
            fill: '#ffffff', 
            fontFamily: 'Microsoft YaHei', 
            fontStyle: 'bold',
            stroke: '#0a0a1a', 
            strokeThickness: 3
        };
        
        // 开始游戏按钮
        const startBtnY = btnStartY;
        const startBtnBg = createBtnBg(startBtnY);
        const startBtn = this.add.text(btnCenterX, startBtnY, '▶ 开始探索', btnTextStyle)
            .setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
        
        startBtn.on('pointerover', () => {
            startBtnBg.clear();
            startBtnBg.fillStyle(btnBgHover, 0.3);
            startBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, startBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            startBtnBg.lineStyle(3, btnBgHover, 1);
            startBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, startBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            startBtn.setStyle({ fill: '#00ffa3' });
        });
        startBtn.on('pointerout', () => {
            startBtnBg.clear();
            startBtnBg.fillStyle(btnBgColor, 0.9);
            startBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, startBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            startBtnBg.lineStyle(2, btnBorderColor, 0.8);
            startBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, startBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            startBtn.setStyle({ fill: '#ffffff' });
        });
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
            const continueBtnY = btnStartY + btnSpacing;
            const continueBtnBg = createBtnBg(continueBtnY);
            const continueBtn = this.add.text(btnCenterX, continueBtnY, '↻ 继续旅程', {
                ...btnTextStyle, fill: '#4ecdc4'
            }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
            
            continueBtn.on('pointerover', () => {
                continueBtnBg.clear();
                continueBtnBg.fillStyle(0x4ecdc4, 0.3);
                continueBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, continueBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                continueBtnBg.lineStyle(3, 0x4ecdc4, 1);
                continueBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, continueBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                continueBtn.setStyle({ fill: '#00ffa3' });
            });
            continueBtn.on('pointerout', () => {
                continueBtnBg.clear();
                continueBtnBg.fillStyle(btnBgColor, 0.9);
                continueBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, continueBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                continueBtnBg.lineStyle(2, btnBorderColor, 0.8);
                continueBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, continueBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                continueBtn.setStyle({ fill: '#4ecdc4' });
            });
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

        // 操作说明按钮
        const helpBtnY = btnStartY + (window.saveManager?.hasSave() ? btnSpacing * 2 : btnSpacing);
        const helpBtnBg = createBtnBg(helpBtnY);
        const helpBtn = this.add.text(btnCenterX, helpBtnY, '📖 操作说明', btnTextStyle)
            .setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
        
        helpBtn.on('pointerover', () => {
            helpBtnBg.clear();
            helpBtnBg.fillStyle(0xff6b35, 0.3);
            helpBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, helpBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            helpBtnBg.lineStyle(3, 0xff6b35, 1);
            helpBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, helpBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            helpBtn.setStyle({ fill: '#ff6b35' });
        });
        helpBtn.on('pointerout', () => {
            helpBtnBg.clear();
            helpBtnBg.fillStyle(btnBgColor, 0.9);
            helpBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, helpBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            helpBtnBg.lineStyle(2, btnBorderColor, 0.8);
            helpBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, helpBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            helpBtn.setStyle({ fill: '#ffffff' });
        });
        helpBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            this.showHelpPanel();
        });

        // 关于荧河按钮
        const aboutBtnY = helpBtnY + btnSpacing;
        const aboutBtnBg = createBtnBg(aboutBtnY);
        const aboutBtn = this.add.text(btnCenterX, aboutBtnY, '🌐 关于荧河', btnTextStyle)
            .setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
        
        aboutBtn.on('pointerover', () => {
            aboutBtnBg.clear();
            aboutBtnBg.fillStyle(0xffd700, 0.3);
            aboutBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, aboutBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            aboutBtnBg.lineStyle(3, 0xffd700, 1);
            aboutBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, aboutBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            aboutBtn.setStyle({ fill: '#ffd700' });
        });
        aboutBtn.on('pointerout', () => {
            aboutBtnBg.clear();
            aboutBtnBg.fillStyle(btnBgColor, 0.9);
            aboutBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, aboutBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            aboutBtnBg.lineStyle(2, btnBorderColor, 0.8);
            aboutBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, aboutBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            aboutBtn.setStyle({ fill: '#ffffff' });
        });
        aboutBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            this.showAboutPanel();
        });

        // 结局画廊按钮
        const galleryBtnY = aboutBtnY + btnSpacing;
        const galleryBtnBg = createBtnBg(galleryBtnY);
        const galleryBtn = this.add.text(btnCenterX, galleryBtnY, '🏆 结局画廊', btnTextStyle)
            .setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        galleryBtn.on('pointerover', () => {
            galleryBtnBg.clear();
            galleryBtnBg.fillStyle(0xd4a574, 0.3);
            galleryBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, galleryBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            galleryBtnBg.lineStyle(3, 0xd4a574, 1);
            galleryBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, galleryBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            galleryBtn.setStyle({ fill: '#ffd93d' });
        });
        galleryBtn.on('pointerout', () => {
            galleryBtnBg.clear();
            galleryBtnBg.fillStyle(btnBgColor, 0.9);
            galleryBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, galleryBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            galleryBtnBg.lineStyle(2, btnBorderColor, 0.8);
            galleryBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, galleryBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            galleryBtn.setStyle({ fill: '#ffffff' });
        });
        galleryBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            this.showGalleryPanel();
        });

        // 重新观看开场动画按钮
        const introBtnY = galleryBtnY + btnSpacing;
        const introBtnBg = createBtnBg(introBtnY);
        const introBtn = this.add.text(btnCenterX, introBtnY, '🎬 观看开场动画', {
            ...btnTextStyle, fontSize: '16px', fill: '#d4a574'
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        introBtn.on('pointerover', () => {
            introBtnBg.clear();
            introBtnBg.fillStyle(0xd4a574, 0.3);
            introBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, introBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            introBtnBg.lineStyle(3, 0xd4a574, 1);
            introBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, introBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            introBtn.setStyle({ fill: '#ffd93d' });
        });
        introBtn.on('pointerout', () => {
            introBtnBg.clear();
            introBtnBg.fillStyle(btnBgColor, 0.9);
            introBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, introBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            introBtnBg.lineStyle(2, btnBorderColor, 0.8);
            introBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, introBtnY - btnHeight/2, btnWidth, btnHeight, 10);
            introBtn.setStyle({ fill: '#d4a574' });
        });
        introBtn.on('pointerdown', () => {
            window.audioManager?.init();
            window.audioManager?.uiClick();
            // 清除localStorage标记,让开场动画正常播放
            localStorage.removeItem('yinghe_intro_seen');
            this.cameras.main.fadeOut(400, 90, 26, 10);
            this.time.delayedCall(400, () => {
                this.scene.start('IntroScene');
            });
        });

        // 重新开始引导按钮（仅当引导未完成时显示）
        if (window.tutorialSystem?.isActive()) {
            const tutorialBtnY = galleryBtnY + btnSpacing;
            const tutorialBtnBg = createBtnBg(tutorialBtnY);
            const tutorialBtn = this.add.text(btnCenterX, tutorialBtnY, '🔄 重新开始引导', {
                ...btnTextStyle, fontSize: '18px', fill: '#d4a574'
            }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
            
            tutorialBtn.on('pointerover', () => {
                tutorialBtnBg.clear();
                tutorialBtnBg.fillStyle(0xd4a574, 0.3);
                tutorialBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, tutorialBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                tutorialBtnBg.lineStyle(3, 0xd4a574, 1);
                tutorialBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, tutorialBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                tutorialBtn.setStyle({ fill: '#ffd93d' });
            });
            tutorialBtn.on('pointerout', () => {
                tutorialBtnBg.clear();
                tutorialBtnBg.fillStyle(btnBgColor, 0.9);
                tutorialBtnBg.fillRoundedRect(btnCenterX - btnWidth/2, tutorialBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                tutorialBtnBg.lineStyle(2, btnBorderColor, 0.8);
                tutorialBtnBg.strokeRoundedRect(btnCenterX - btnWidth/2, tutorialBtnY - btnHeight/2, btnWidth, btnHeight, 10);
                tutorialBtn.setStyle({ fill: '#d4a574' });
            });
            tutorialBtn.on('pointerdown', () => {
                window.audioManager?.init();
                window.audioManager?.uiClick();
                if (confirm('确定要重新开始新手引导吗？\n（当前引导进度将清空）')) {
                    window.tutorialSystem?.reset();
                    alert('✅ 引导已重置！下次进入游戏时将重新开始。');
                }
            });
        }

        // ======== 引导进度显示 ========
        if (window.tutorialSystem?.isActive()) {
            const ts = window.tutorialSystem;
            this.add.text(width / 2, height - 50, 
                `📜 引导进度: ${ts.step + 1}/${ts.STEPS.length} - ${ts.getCurrentStep()?.title || ''}`, {
                fontSize: '10px', fill: '#d4a57488', fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setDepth(10);
        }

        // ======== 底部版权信息（字号增大） ========
        this.add.text(width / 2, height - 18, '首都经济贸易大学 · 驼灵智能体大赛 · Phaser.js + Coze AI', {
            fontSize: '12px', fill: '#667788', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(10);

        // ======== 渐入动画 ========
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

    // ======== 结局画廊面板 ========
    showGalleryPanel() {
        if (this.galleryPanel) { this.galleryPanel.setVisible(!this.galleryPanel.visible); return; }
        if (typeof ENDING_METADATA === 'undefined') {
            console.warn('[Menu] ENDING_METADATA 未定义，画廊不可用');
            return;
        }

        const { width, height } = this.cameras.main;
        this.galleryPanel = this.add.container(0, 0).setDepth(100);

        // 遮罩
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.78);
        overlay.fillRect(0, 0, width, height);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.galleryPanel.add(overlay);

        // 面板
        const pw = 820, ph = 460;
        const px = (width - pw) / 2, py = (height - ph) / 2;
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1e, 0.97);
        bg.fillRoundedRect(px, py, pw, ph, 12);
        bg.lineStyle(2, 0xd4a574, 0.9);
        bg.strokeRoundedRect(px, py, pw, ph, 12);
        this.galleryPanel.add(bg);

        // 标题
        this.galleryPanel.add(this.add.text(width / 2, py + 26, '🏆 结局画廊 · 8种命运', {
            fontSize: '20px', fill: '#d4a574', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5));
        this.galleryPanel.add(this.add.text(width / 2, py + 50, '点击任意结局即可预览其画面', {
            fontSize: '11px', fill: '#888899', fontFamily: 'Microsoft YaHei', fontStyle: 'italic'
        }).setOrigin(0.5));

        // 8种结局卡片（2列4行）
        const endingIds = ['balance', 'secret', 'governor', 'merchant', 'miner', 'gray', 'collapse', 'unfinished'];
        const cardW = 360, cardH = 80, gap = 10;
        const cols = 2;
        const gridStartX = px + (pw - (cardW * cols + gap * (cols - 1))) / 2;
        const gridStartY = py + 70;

        endingIds.forEach((id, idx) => {
            const meta = ENDING_METADATA[id];
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cx = gridStartX + col * (cardW + gap);
            const cy = gridStartY + row * (cardH + gap);
            this._createGalleryCard(cx, cy, cardW, cardH, meta);
        });

        // 关闭按钮
        const closeBtn = this.add.text(px + pw - 30, py + 8, '✕', {
            fontSize: '20px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.galleryPanel.setVisible(false));
        this.galleryPanel.add(closeBtn);
    }

    _createGalleryCard(x, y, w, h, meta) {
        const palette = meta.palette;
        const cardBg = this.add.graphics();
        cardBg.fillStyle(palette.bgTop, 0.85);
        cardBg.fillRoundedRect(x, y, w, h, 8);
        cardBg.lineStyle(2, palette.primary, 0.85);
        cardBg.strokeRoundedRect(x, y, w, h, 8);
        cardBg.lineStyle(1, palette.glow, 0.3);
        cardBg.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 9);
        this.galleryPanel.add(cardBg);

        // 左侧色块（图标背景）
        const iconBg = this.add.graphics();
        iconBg.fillStyle(palette.primary, 0.6);
        iconBg.fillRoundedRect(x + 8, y + 8, 64, h - 16, 6);
        iconBg.lineStyle(2, palette.glow, 0.6);
        iconBg.strokeRoundedRect(x + 8, y + 8, 64, h - 16, 6);
        this.galleryPanel.add(iconBg);

        // 图标
        this.galleryPanel.add(this.add.text(x + 40, y + h / 2, meta.icon, {
            fontSize: '36px', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5));

        // 标题
        this.galleryPanel.add(this.add.text(x + 84, y + 16, meta.title, {
            fontSize: '15px', fill: '#' + palette.secondary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }));
        // 副标题
        this.galleryPanel.add(this.add.text(x + 84, y + 36, meta.subtitle, {
            fontSize: '9px', fill: '#' + palette.primary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'italic'
        }));
        // 短描述
        this.galleryPanel.add(this.add.text(x + 84, y + 50, meta.shortDesc, {
            fontSize: '10px', fill: '#ccccdd',
            fontFamily: 'Microsoft YaHei', wordWrap: { width: w - 100 }
        }));

        // 整张卡片可点击
        const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.galleryPanel.add(hit);

        hit.on('pointerover', () => {
            cardBg.clear();
            cardBg.fillStyle(palette.primary, 0.4);
            cardBg.fillRoundedRect(x, y, w, h, 8);
            cardBg.lineStyle(2, palette.glow, 1);
            cardBg.strokeRoundedRect(x, y, w, h, 8);
            cardBg.lineStyle(1, palette.glow, 0.6);
            cardBg.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 9);
        });
        hit.on('pointerout', () => {
            cardBg.clear();
            cardBg.fillStyle(palette.bgTop, 0.85);
            cardBg.fillRoundedRect(x, y, w, h, 8);
            cardBg.lineStyle(2, palette.primary, 0.85);
            cardBg.strokeRoundedRect(x, y, w, h, 8);
            cardBg.lineStyle(1, palette.glow, 0.3);
            cardBg.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 9);
        });
        hit.on('pointerdown', () => {
            window.audioManager?.uiClick();
            this.cameras.main.fadeOut(500, 10, 10, 26);
            this.time.delayedCall(500, () => {
                // 通过 EndingScene 直接展示该结局（fromGallery 标记）
                this.scene.start('EndingScene', {
                    ending: {
                        id: meta.id,
                        title: meta.title,
                        description: meta.description
                    },
                    gameStats: {
                        merchant: 50, miner: 50, governor: 50, moral: 50,
                        decisions: 0, dialogues: 0, timeStr: '00:00',
                        isSample: true
                    },
                    fromGallery: true
                });
            });
        });
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
