// ============================================================
// IntroScene - 开场动画（4幕世界观介绍）
// 暗红 + 暖金 + 米白，琥珀色调，禁止黑底
// ============================================================

class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // ===== 背景：暗红 + 暖金渐变（绝不黑底） =====
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x3a0a0a, 0x3a0a0a, 0x5a1a0a, 0x2a0808, 1);
        bg.fillRect(0, 0, width, height);

        // 装饰：暖金色光晕（顶部+底部）
        const topGlow = this.add.graphics();
        topGlow.fillGradientStyle(0xd4a574, 0xd4a574, 0x000000, 0x000000, 0.25, 0.25, 0, 0);
        topGlow.fillRect(0, 0, width, 80);
        const bottomGlow = this.add.graphics();
        bottomGlow.fillGradientStyle(0x000000, 0x000000, 0xd4a574, 0xd4a574, 0, 0, 0.2, 0.2);
        bottomGlow.fillRect(0, height - 60, width, 60);

        // ===== 星点装饰（暖金/米白） =====
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Math.random() > 0.85 ? 2 : 1;
            const star = this.add.circle(x, y, size, 0xf5e6d3, Math.random() * 0.5 + 0.2);
            this.stars.push(star);
            this.tweens.add({
                targets: star,
                alpha: { from: star.alpha, to: 0.1 },
                duration: 1500 + Math.random() * 2500,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                delay: Math.random() * 2000
            });
        }

        // ===== 顶部小标：游戏标识 =====
        this.add.text(width / 2, 22, '✦ 联星历217年 ✦ 荧河空间站 ✦', {
            fontSize: '12px', fill: '#d4a574', fontFamily: 'Microsoft YaHei',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0.7).setDepth(50);

        // ===== 4幕文字内容 =====
        this.acts = [
            {
                tag: '【第1幕：星贸纪元】',
                lines: [
                    '联星历217年，荧河空间站。',
                    '这是巽风圈最繁忙的贸易中转站——',
                    '来自十七个星区的商船穿梭于此，',
                    '每年过境贸易额高达340亿星币。'
                ],
                color: 0xf5e6d3
            },
            {
                tag: '【第2幕：繁荣下的裂痕】',
                lines: [
                    '三方势力在此角力：',
                    '商会联盟要求自由贸易，矿工联合会抗议15%出口税，',
                    '总督府夹在中间维持秩序。',
                    '你，是新到任的商会联络官。'
                ],
                color: 0xff9966
            },
            {
                tag: '【第3幕：异象初现】',
                lines: [
                    '最近，航道出现异常信号。',
                    '暗市街区流传着关于"光之河"的古老预言。',
                    '荧河的名字，来自建站时发现的一块石板——',
                    '"光之河的渡口，渡人，亦渡己。"'
                ],
                color: 0xd4a574
            },
            {
                tag: '【第4幕：你的使命】',
                lines: [
                    '平衡各方势力，揭开航道异象的真相。',
                    '你将做出影响百万人的抉择。'
                ],
                color: 0xffd93d
            }
        ];

        this.actIndex = 0;
        this.actContainer = null;

        // ===== 底部操作提示 =====
        this.hintText = this.add.text(width / 2, height - 26, '— 按 空格键 / 点击屏幕 跳过 —', {
            fontSize: '11px', fill: '#d4a574', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setAlpha(0.6).setDepth(50);
        this.tweens.add({
            targets: this.hintText,
            alpha: { from: 0.6, to: 0.25 },
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // ===== 进度小点 =====
        this.progressDots = [];
        for (let i = 0; i < this.acts.length; i++) {
            const dot = this.add.circle(
                width / 2 + (i - (this.acts.length - 1) / 2) * 22,
                height - 50,
                4, 0xd4a574, 0.3
            ).setDepth(50);
            this.progressDots.push(dot);
        }

        // ===== 输入控制 =====
        this.skipKey = this.input.keyboard.addKey('SPACE');
        this.input.keyboard.addKey('ENTER');
        this.input.on('pointerdown', () => this.skipOrNext());

        this.skipKey.on('down', () => this.skipOrNext());

        // ===== 启动第一幕 =====
        this.time.delayedCall(400, () => this.showAct(0));
    }

    showAct(idx) {
        if (idx >= this.acts.length) {
            this.skipToMenu();
            return;
        }

        // 清除上一幕
        if (this.actContainer) this.actContainer.destroy();
        if (this.charTimer) { this.charTimer.remove(); this.charTimer = null; }

        const act = this.acts[idx];
        this.actContainer = this.add.container(0, 0).setDepth(40);

        const { width, height } = this.cameras.main;

        // 半透明装饰底板（暗红+暖金）
        const panelG = this.add.graphics();
        panelG.fillStyle(0x2a0a0a, 0.55);
        panelG.fillRoundedRect(60, height / 2 - 110, width - 120, 220, 12);
        panelG.lineStyle(2, 0xd4a574, 0.6);
        panelG.strokeRoundedRect(60, height / 2 - 110, width - 120, 220, 12);
        // 顶部装饰条
        panelG.fillStyle(0xd4a574, 0.35);
        panelG.fillRect(72, height / 2 - 108, width - 144, 3);
        this.actContainer.add(panelG);

        // 标签（如 "【第1幕：星贸纪元】"）
        const tagText = this.add.text(width / 2, height / 2 - 80, act.tag, {
            fontSize: '18px', fill: '#' + act.color.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);
        this.actContainer.add(tagText);

        this.tweens.add({
            targets: tagText, alpha: 1, duration: 600, ease: 'Sine.easeOut'
        });

        // 内容文本
        const contentY = height / 2 - 40;
        const lineGap = 26;
        const contentText = this.add.text(width / 2, contentY, '', {
            fontSize: '15px', fill: '#f5e6d3', fontFamily: 'Microsoft YaHei',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5, 0).setAlpha(0);
        this.actContainer.add(contentText);

        // 逐字显示
        const fullText = act.lines.join('\n');
        this.charIndex = 0;
        this.fullText = fullText;
        this.contentText = contentText;
        this.actIndex = idx;

        // 进度点更新
        this.progressDots.forEach((d, i) => {
            d.setFillStyle(0xd4a574, i === idx ? 1 : 0.3);
            d.setRadius(i === idx ? 5 : 4);
        });

        contentText.setAlpha(1);

        this.charTimer = this.time.addEvent({
            delay: 45, loop: true,
            callback: () => {
                this.charIndex++;
                contentText.setText(this.fullText.substring(0, this.charIndex));
                if (this.charIndex >= this.fullText.length) {
                    this.charTimer.remove();
                    this.charTimer = null;
                    // 3秒后自动下一幕
                    this.autoNextTimer = this.time.delayedCall(3000, () => this.showAct(idx + 1));
                }
            }
        });
    }

    skipOrNext() {
        // 还在打字中 → 立即显示完整文本
        if (this.charTimer) {
            this.charTimer.remove();
            this.charTimer = null;
            this.contentText.setText(this.fullText);
            // 缩短停留：1秒后跳下一幕
            if (this.autoNextTimer) this.autoNextTimer.remove();
            this.autoNextTimer = this.time.delayedCall(1000, () => this.showAct(this.actIndex + 1));
            return;
        }
        // 文本已显示完：跳到下一幕
        if (this.autoNextTimer) this.autoNextTimer.remove();
        this.showAct(this.actIndex + 1);
    }

    skipToMenu() {
        // 销毁所有内容
        if (this.actContainer) this.actContainer.destroy();
        if (this.charTimer) this.charTimer.remove();
        if (this.autoNextTimer) this.autoNextTimer.remove();
        this.hintText.setVisible(false);
        this.progressDots.forEach(d => d.setVisible(false));

        // 标记已观看开场
        localStorage.setItem('yinghe_intro_seen', '1');

        // 暖金淡出 → 决定去向：从菜单的"开始游戏"进来播完直接进HubScene；从"🎬观看"进来则回MenuScene
        const nextScene = (this.init && this.init.data && this.init.data.next) || 'MenuScene';
        this.cameras.main.fadeOut(600, 90, 26, 10);
        this.time.delayedCall(600, () => {
            this.scene.start(nextScene);
        });
    }
}
