// ============================================================
// 交易大厅 - 扩展HubScene的交易功能
// ============================================================

class TradeHallScene extends Phaser.Scene {
    constructor() { super({ key: 'TradeHallScene' }); }

    create() {
        // 交易大厅直接跳转HubScene（中央大厅本身就是交易大厅）
        this.scene.start('HubScene');
    }
}
