// ============================================================
// 星际港口 - 船长苏雷
// ============================================================

class PortScene extends Phaser.Scene {
    constructor() { super({ key: 'PortScene' }); }

    create() {
        window.GAME_STATE.currentScene = 'PortScene';
        window.GAME_STATE.scene = this;
        this.isInDialogue = false;

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0d1a');

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRoundedRect(60, 160, 840, 300, 12);
        bg.lineStyle(2, 0x7b8ea0, 0.6);
        bg.strokeRoundedRect(60, 160, 840, 300, 12);

        // 货船轮廓
        bg.fillStyle(0x3a3a5e, 0.8);
        bg.fillRoundedRect(150, 250, 120, 60, 6);
        bg.fillRoundedRect(600, 260, 120, 50, 6);
        // 集装箱
        bg.fillStyle(0xff6b35, 0.4); bg.fillRoundedRect(160, 255, 25, 20, 2);
        bg.fillStyle(0x4ecdc4, 0.4); bg.fillRoundedRect(190, 255, 25, 20, 2);
        bg.fillStyle(0xffd93d, 0.4); bg.fillRoundedRect(220, 255, 25, 20, 2);
        bg.fillStyle(0xff6b35, 0.4); bg.fillRoundedRect(610, 265, 25, 20, 2);
        bg.fillStyle(0x4ecdc4, 0.4); bg.fillRoundedRect(640, 265, 25, 20, 2);

        // 导航台
        bg.fillStyle(0x0d0d24, 0.9);
        bg.fillRoundedRect(400, 200, 160, 60, 4);
        bg.lineStyle(1, 0x7b8ea0, 0.6);
        bg.strokeRoundedRect(400, 200, 160, 60, 4);
        // 导航屏幕闪烁
        bg.fillStyle(0x7b8ea0, 0.3);
        bg.fillRect(410, 210, 140, 35);

        // 装卸机器人
        bg.fillStyle(0x7b8ea0, 0.6);
        bg.fillRect(340, 320, 8, 30);
        bg.fillCircle(344, 315, 6);
        bg.fillRect(500, 330, 8, 25);
        bg.fillCircle(504, 325, 5);

        // 远处星球
        bg.fillStyle(0x4a90d9, 0.15);
        bg.fillCircle(800, 100, 50);

        this.add.text(width / 2, 30, '荧河空间站 · 星际港口', {
            fontSize: '18px', fill: '#7b8ea0', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0d1aCC', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(5);

        this.player = this.physics.add.sprite(width / 2, height * 0.6, 'player');
        this.player.setCollideWorldBounds(true).setDepth(10);
        this.player.speed = 160;

        this.npcs = {};
        const cap = this.physics.add.sprite(300, 310, 'npc_captain_su').setImmovable(true).setDepth(8);
        this.add.text(300, 286, '苏雷', { fontSize: '10px', fill: '#7b8ea0', fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0d1aAA', padding: { x: 4, y: 2 } }).setOrigin(0.5).setDepth(12);
        this.npcs.captain_su = { sprite: cap, data: NPC_DATA.captain_su };

        this.returnPortal = this.add.sprite(480, 440, 'portal').setDepth(6);
        this.add.text(480, 466, '返回中央大厅', { fontSize: '10px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5).setDepth(12);
        this.tweens.add({ targets: this.returnPortal, alpha: 0.8, duration: 1500, yoyo: true, repeat: -1 });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.interactHint = this.add.text(width / 2, height - 30, '', { fontSize: '12px', fill: '#7b8ea0', fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0d1aCC', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(100).setVisible(false);
        this.nearestTarget = null;
        this.add.text(10, 8, `星币: ${window.GAME_STATE.player.credits}`, { fontSize: '12px', fill: '#7b8ea0', fontFamily: 'Microsoft YaHei' }).setDepth(50);

        this.createSimpleDialogue();
        this.cameras.main.fadeIn(400, 10, 10, 26);
    }

    createSimpleDialogue() {
        const { width, height } = this.cameras.main;
        this.dialogueOverlay = this.add.container(0, 0).setDepth(200).setVisible(false);
        const bg = this.add.graphics(); bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, width, height); this.dialogueOverlay.add(bg);
        const dBg = this.add.graphics(); dBg.fillStyle(0x0a0d1a, 0.95); dBg.fillRoundedRect(80, height - 200, width - 160, 175, 10); dBg.lineStyle(2, 0x7b8ea0, 0.8); dBg.strokeRoundedRect(80, height - 200, width - 160, 175, 10); this.dialogueOverlay.add(dBg);
        this.dlgPortrait = this.add.image(140, height - 115, 'portrait_npc_captain_su').setDisplaySize(80, 80).setDepth(201); this.dialogueOverlay.add(this.dlgPortrait);
        const pf = this.add.graphics(); pf.lineStyle(2, 0x7b8ea0, 0.8); pf.strokeRoundedRect(98, height - 158, 84, 84, 6); this.dialogueOverlay.add(pf);
        this.dlgName = this.add.text(195, height - 190, '', { fontSize: '14px', fill: '#7b8ea0', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' }).setDepth(201); this.dialogueOverlay.add(this.dlgName);
        this.dlgIntimacy = this.add.text(330, height - 188, '', { fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei' }).setDepth(201); this.dialogueOverlay.add(this.dlgIntimacy);
        this.dlgText = this.add.text(195, height - 165, '', { fontSize: '13px', fill: '#ffffff', fontFamily: 'Microsoft YaHei', wordWrap: { width: width - 330 } }).setDepth(201); this.dialogueOverlay.add(this.dlgText);
        const closeBtn = this.add.text(width - 110, height - 195, '✕', { fontSize: '16px', fill: '#ff6b35' }).setInteractive({ useHandCursor: true }).setDepth(201);
        closeBtn.on('pointerdown', () => { this.dialogueOverlay.setVisible(false); this.isInDialogue = false; }); this.dialogueOverlay.add(closeBtn);
        this.dlgInput = this.add.dom(110, height - 55).createFromHTML('<input type="text" id="port-chat" placeholder="输入消息..." style="width:580px;height:28px;background:transparent;border:none;color:#fff;font-size:13px;font-family:Microsoft YaHei;outline:none;">').setDepth(202); this.dialogueOverlay.add(this.dlgInput);
        const sendBtn = this.add.text(width - 140, height - 60, '发送', { fontSize: '12px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei', backgroundColor: '#7b8ea0', padding: { x: 14, y: 5 } }).setInteractive({ useHandCursor: true }).setDepth(202);
        sendBtn.on('pointerdown', async () => { const el = document.getElementById('port-chat'); if (!el?.value.trim()) return; const msg = el.value.trim(); el.value = ''; this.dlgText.setText('...'); const r = await window.GAME_STATE.dialogue.sendMessage(this.currentNpc, msg); this.dlgText.setText(r); const intimacy = window.GAME_STATE.relationships.getIntimacy(this.currentNpc); this.dlgIntimacy.setText(`♥ 亲密度: ${intimacy}`); });
        this.dialogueOverlay.add(sendBtn);
    }

    update() {
        if (this.isInDialogue) { this.player.setVelocity(0); return; }
        const speed = this.player.speed; let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed; else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed; else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
        this.player.setVelocity(vx, vy);
        let nearest = null, nearDist = Infinity;
        for (const [id, npc] of Object.entries(this.npcs)) { const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y); if (d < 60 && d < nearDist) { nearDist = d; nearest = id; } }
        const portalDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 480, 440);
        if (nearest) { this.interactHint.setText(`按E与 ${NPC_DATA[nearest].name} 对话`).setVisible(true); this.nearestTarget = { type: 'npc', id: nearest }; }
        else if (portalDist < 50) { this.interactHint.setText('按E返回中央大厅').setVisible(true); this.nearestTarget = { type: 'portal' }; }
        else { this.interactHint.setVisible(false); this.nearestTarget = null; }
        if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearestTarget) {
            if (this.nearestTarget.type === 'npc') { this.isInDialogue = true; this.currentNpc = this.nearestTarget.id; const npc = NPC_DATA[this.nearestTarget.id]; this.dlgName.setText(npc.name); const pKey = `portrait_npc_${this.nearestTarget.id}`; if (this.textures.exists(pKey)) this.dlgPortrait.setTexture(pKey); this.dlgPortrait.setDisplaySize(80, 80); const intimacy = window.GAME_STATE.relationships.getIntimacy(this.nearestTarget.id); this.dlgIntimacy.setText(`♥ 亲密度: ${intimacy}`); this.dlgText.setText(window.GAME_STATE.dialogue.sendMessage(this.nearestTarget.id, '你好')); this.dialogueOverlay.setVisible(true); window.GAME_STATE.relationships.onDialogue(this.nearestTarget.id); }
            else { this.cameras.main.fadeOut(400, 10, 10, 26); this.time.delayedCall(400, () => this.scene.start('HubScene')); }
        }
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) { this.dialogueOverlay.setVisible(false); this.isInDialogue = false; }
    }
}
