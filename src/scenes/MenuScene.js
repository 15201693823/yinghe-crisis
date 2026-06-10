// ============================================================
// MenuScene - 主菜单
// ============================================================

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // 背景 - 星空
        this.cameras.main.setBackgroundColor('#0a0a1a');
        this.createStarfield();

        // 标题
        const title = this.add.text(width / 2, height * 0.25, '星贸纪元', {
            fontSize: '48px',
            fill: '#00ffa3',
            fontFamily: 'Microsoft YaHei',
            fontStyle: 'bold',
            stroke: '#0a0a1a',
            strokeThickness: 4
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, height * 0.35, '荧河危机', {
            fontSize: '28px',
            fill: '#ff6b35',
            fontFamily: 'Microsoft YaHei',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const tagline = this.add.text(width / 2, height * 0.45, 'AI驱动的星际贸易决策RPG', {
            fontSize: '16px',
            fill: '#4ecdc4',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        // 开始按钮
        const startBtn = this.add.text(width / 2, height * 0.62, '[ 进入空间站 ]', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#1a1a2e',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => {
            startBtn.setStyle({ fill: '#00ffa3', backgroundColor: '#2a2a4e' });
        });
        startBtn.on('pointerout', () => {
            startBtn.setStyle({ fill: '#ffffff', backgroundColor: '#1a1a2e' });
        });
        startBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 10, 10, 26);
            this.time.delayedCall(500, () => {
                this.scene.start('HubScene');
            });
        });

        // 底部信息
        const info = this.add.text(width / 2, height * 0.85, '首都经济贸易大学 · 驼灵智能体大赛', {
            fontSize: '12px',
            fill: '#666666',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        const controls = this.add.text(width / 2, height * 0.9, 'WASD/方向键移动 · E交互 · Tab仪表盘', {
            fontSize: '11px',
            fill: '#444444',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        // 标题动画
        this.tweens.add({
            targets: title,
            y: height * 0.24,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
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
