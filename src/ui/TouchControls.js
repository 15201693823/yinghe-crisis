// ============================================================
// VirtualJoystick - 移动端虚拟摇杆（增强版）
// ============================================================
class VirtualJoystick {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.isMobile = this.detectMobile();
        this.active = false;
        this.dx = 0;
        this.dy = 0;
        this.interactBtn = null;

        if (this.isMobile) {
            this.create();
        }
    }

    detectMobile() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
               (window.innerWidth < 768);
    }

    create() {
        const scene = this.scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0).setDepth(500).setScrollFactor(0);

        // ---- 左侧摇杆（增大触摸区域）----
        const joyX = 80, joyY = height - 80;
        // 底座 - 增大半径从45到55
        const base = scene.add.circle(joyX, joyY, 55, 0x000000, 0.25).setStrokeStyle(2, 0x00ffa3, 0.4);
        this.container.add(base);
        // 摇杆头 - 增大半径从20到24
        this.knob = scene.add.circle(joyX, joyY, 24, 0x00ffa3, 0.5).setStrokeStyle(1, 0xffffff, 0.3);
        this.container.add(this.knob);
        this.joyBase = { x: joyX, y: joyY };

        // 触摸事件 - 增大最大拖动距离从35到42
        base.setInteractive({ draggable: true });
        base.on('drag', (pointer) => {
            const maxDist = 42;
            let dx = pointer.x - joyX;
            let dy = pointer.y - joyY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDist) {
                dx = dx / dist * maxDist;
                dy = dy / dist * maxDist;
            }
            this.knob.setPosition(joyX + dx, joyY + dy);
            this.dx = dx / maxDist;
            this.dy = dy / maxDist;
            this.active = true;
        });
        base.on('dragend', () => {
            this.knob.setPosition(joyX, joyY);
            this.dx = 0;
            this.dy = 0;
            this.active = false;
        });

        // ---- 右侧交互按钮 ----
        const btnX = width - 70, btnY = height - 80;

        // E键 - 交互
        const eBtn = scene.add.circle(btnX, btnY - 50, 28, 0x0a0a1e, 0.6).setStrokeStyle(2, 0x00ffa3, 0.6);
        const eLabel = scene.add.text(btnX, btnY - 50, 'E', {
            fontSize: '18px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        eBtn.setInteractive({ useHandCursor: true });
        eBtn.on('pointerdown', () => {
            scene.interactKey?.emit?.('down');
            if (scene.handleInteract) scene.handleInteract();
            window.audioManager?.uiClick();
        });
        // 添加 touchstart 支持
        eBtn.on('touchstart', (pointer) => {
            pointer.event.preventDefault();
            scene.interactKey?.emit?.('down');
            if (scene.handleInteract) scene.handleInteract();
            window.audioManager?.uiClick();
        });
        this.container.add(eBtn);
        this.container.add(eLabel);

        // Q键 - 日志
        const qBtn = scene.add.circle(btnX - 55, btnY, 22, 0x0a0a1e, 0.6).setStrokeStyle(2, 0xffd93d, 0.5);
        const qLabel = scene.add.text(btnX - 55, btnY, 'Q', {
            fontSize: '14px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        qBtn.setInteractive({ useHandCursor: true });
        qBtn.on('pointerdown', () => {
            if (scene.showStoryLog) scene.showStoryLog();
            window.audioManager?.uiClick();
        });
        qBtn.on('touchstart', (pointer) => {
            pointer.event.preventDefault();
            if (scene.showStoryLog) scene.showStoryLog();
            window.audioManager?.uiClick();
        });
        this.container.add(qBtn);
        this.container.add(qLabel);

        // I键 - 区域信息
        const iBtn = scene.add.circle(btnX + 55, btnY, 22, 0x0a0a1e, 0.6).setStrokeStyle(2, 0x4ecdc4, 0.5);
        const iLabel = scene.add.text(btnX + 55, btnY, 'I', {
            fontSize: '14px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5);
        iBtn.setInteractive({ useHandCursor: true });
        iBtn.on('pointerdown', () => {
            if (scene.areaPanel) scene.areaPanel.setVisible(!scene.areaPanel.visible);
            window.audioManager?.uiClick();
        });
        iBtn.on('touchstart', (pointer) => {
            pointer.event.preventDefault();
            if (scene.areaPanel) scene.areaPanel.setVisible(!scene.areaPanel.visible);
            window.audioManager?.uiClick();
        });
        this.container.add(iBtn);
        this.container.add(iLabel);

        // ESC键 - 关闭
        const escBtn = scene.add.circle(btnX, btnY + 50, 18, 0x0a0a1e, 0.6).setStrokeStyle(2, 0xff6b35, 0.4);
        const escLabel = scene.add.text(btnX, btnY + 50, '✕', {
            fontSize: '14px', fill: '#ff6b35', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        escBtn.setInteractive({ useHandCursor: true });
        escBtn.on('pointerdown', () => {
            if (scene.isInDialogue) {
                scene.dialogueContainer?.setVisible(false);
                scene.isInDialogue = false;
            }
            if (scene.areaPanel?.visible) scene.areaPanel.setVisible(false);
            if (scene.logContainer?.visible) scene.logContainer.setVisible(false);
        });
        escBtn.on('touchstart', (pointer) => {
            pointer.event.preventDefault();
            if (scene.isInDialogue) {
                scene.dialogueContainer?.setVisible(false);
                scene.isInDialogue = false;
            }
            if (scene.areaPanel?.visible) scene.areaPanel.setVisible(false);
            if (scene.logContainer?.visible) scene.logContainer.setVisible(false);
        });
        this.container.add(escBtn);
        this.container.add(escLabel);
    }

    // ---- 获取移动方向 ----
    getDirection() {
        if (!this.active) return { x: 0, y: 0 };
        return { x: this.dx, y: this.dy };
    }

    // ---- 显示/隐藏 ----
    setVisible(v) {
        if (this.container) this.container.setVisible(v);
    }
}

window.VirtualJoystick = VirtualJoystick;
