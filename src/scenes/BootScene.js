// ============================================================
// BootScene - 加载与初始化
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

        const title = this.add.text(width / 2, height / 2 - 30, '星贸纪元：荧河危机', {
            fontSize: '22px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);

        const tipText = this.add.text(width / 2, height / 2 + 70, '正在加载资源...', {
            fontSize: '12px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0x00ffa3, 1);
            barFill.fillRoundedRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4, 3);
        });

        this.load.on('complete', () => {
            tipText.setText('加载完成！');
        });

        // ---- 加载角色精灵图 ----
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

        // ---- 加载对话头像 ----
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

        // Coze连接配置（从URL参数读取）
        const urlParams = new URLSearchParams(window.location.search);
        const botId = urlParams.get('bot_id') || '';
        const apiToken = urlParams.get('token') || '';
        if (botId && apiToken) {
            window.cozeBridge.configure({ botId, apiToken });
            console.log('[Boot] Coze Bridge 已连接');
        } else {
            console.log('[Boot] Coze Bridge 未配置，使用本地回退模式');
        }

        this.time.delayedCall(400, () => {
            this.scene.start('MenuScene');
        });
    }
}
