// ============================================================
// 星贸纪元：荧河危机 - 主入口（增强版）
// ============================================================

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    backgroundColor: '#0a0a1a',
    pixelArt: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        MenuScene,
        HubScene,
        GovernorScene,
        MiningScene,
        PortScene,
        BlackMarketScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

// ---- 全局状态（简单RPG, 无回合/无复杂经济） ----
window.GAME_STATE = {
    player: {
        name: '谈判官',
        credits: 500,
        moral: 50
    },
    relationships: null,  // RelationshipSystem实例
    dialogue: null,       // DialogueSystem实例
    story: null,          // StorySystem实例
    currentScene: 'HubScene',

    // 三个势力的满意度（0-100, 叙事驱动）
    factionSatisfaction: {
        merchant: 50,
        miner: 50,
        governor: 50
    },

    // 剧情flag
    flags: {
        blackMarketUnlocked: false,
        metGovernor: false,
        talkedToMiner: false,
        talkedToMerchant: false,
        channelBroken: false,
        channelFixed: false,
        minerStrike: false,
        merchantBlockade: false,
        metJiuJie: false,
        secretActivated: false
    },

    // 经济概况（背景文字，不跑模型）
    economyStatus: {
        gdp: 1000,
        inflation: '2.0%',
        tradeBalance: '+120',
        stability: '稳定'
    },

    // 存档恢复数据（从MenuScene传入）
    _pendingRestore: null
};

// ---- 启动自动存档（游戏开始后） ----
game.events.on('ready', () => {
    // 延迟启动，等第一个场景加载完成
    setTimeout(() => {
        window.saveManager?.startAutoSave();
    }, 5000);
    
    // Coze AI连接测试（延迟确保cozeBridge已初始化）
    setTimeout(() => {
        if (window.cozeBridge) {
            window.cozeBridge.testAndConnect().then(connected => {
                if (connected) {
                    console.log('✅ AI NPC对话已启用');
                } else {
                    console.log('ℹ️ 使用本地对话（AI未连接）');
                }
            });
        }
    }, 1000);
});

// ---- 页面关闭前存档 ----
window.addEventListener('beforeunload', () => {
    window.saveManager?.save();
});
