// ============================================================
// 暗市街区 - 九姐 + 神秘客
// ============================================================

class BlackMarketScene extends Phaser.Scene {
    constructor() { super({ key: 'BlackMarketScene' }); }

    create() {
        window.GAME_STATE.currentScene = 'BlackMarketScene';
        window.GAME_STATE.scene = this;
        this.isInDialogue = false;

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0d0518');

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0d28, 1);
        bg.fillRoundedRect(60, 160, 840, 300, 12);
        bg.lineStyle(2, 0xc77dff, 0.6);
        bg.strokeRoundedRect(60, 160, 840, 300, 12);

        // 霓虹招牌
        bg.fillStyle(0xc77dff, 0.4);
        bg.fillRoundedRect(350, 180, 260, 30, 4);
        this.neonText = this.add.text(480, 195, 'LAST PORT', {
            fontSize: '16px', fill: '#c77dff', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(5);
        // 霓虹闪烁
        this.tweens.add({ targets: this.neonText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

        // 吧台
        bg.fillStyle(0x2a1a3e, 0.9);
        bg.fillRoundedRect(150, 300, 250, 40, 4);
        bg.lineStyle(1, 0xc77dff, 0.3);
        bg.strokeRoundedRect(150, 300, 250, 40, 4);
        // 酒瓶
        bg.fillStyle(0xff6b9d, 0.6); bg.fillRect(180, 285, 8, 15);
        bg.fillStyle(0x4ecdc4, 0.6); bg.fillRect(200, 288, 8, 12);
        bg.fillStyle(0xffd93d, 0.6); bg.fillRect(220, 286, 8, 14);

        // 卡座
        bg.fillStyle(0x2a1a3e, 0.7);
        bg.fillRoundedRect(600, 280, 150, 80, 6);

        // 暗门
        bg.fillStyle(0x0d0518, 0.8);
        bg.fillRoundedRect(820, 250, 50, 80, 3);
        bg.lineStyle(1, 0xc77dff, 0.2);
        bg.strokeRoundedRect(820, 250, 50, 80, 3);

        // 烟雾效果
        for (let i = 0; i < 15; i++) {
            const smoke = this.add.circle(
                Phaser.Math.Between(100, 860),
                Phaser.Math.Between(200, 400),
                Phaser.Math.Between(5, 15),
                0xc77dff,
                Math.random() * 0.08
            ).setDepth(7);
            this.tweens.add({
                targets: smoke,
                x: smoke.x + Phaser.Math.Between(-30, 30),
                y: smoke.y - Phaser.Math.Between(20, 50),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 8000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        this.add.text(width / 2, 30, '暗市街区 · 幽灵巷', {
            fontSize: '18px', fill: '#c77dff', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0d0518CC', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(5);

        this.player = this.physics.add.sprite(width / 2, height * 0.6, 'player');
        this.player.setCollideWorldBounds(true).setDepth(10);
        this.player.speed = 160;

        this.npcs = {};
        const npcPositions = {
            jiu_jie: { x: 280, y: 330 },
            mysterious: { x: 670, y: 320 }
        };
        for (const [id, pos] of Object.entries(npcPositions)) {
            const d = NPC_DATA[id];
            const s = this.physics.add.sprite(pos.x, pos.y, `npc_${id}`).setImmovable(true).setDepth(8);
            this.add.text(pos.x, pos.y - 24, id === 'mysterious' ? '???' : d.name, {
                fontSize: '10px', fill: '#' + d.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', backgroundColor: '#0d0518AA', padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(12);
            this.npcs[id] = { sprite: s, data: d };
        }

        this.returnPortal = this.add.sprite(480, 440, 'portal').setDepth(6);
        this.add.text(480, 466, '返回中央大厅', { fontSize: '10px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5).setDepth(12);
        this.tweens.add({ targets: this.returnPortal, alpha: 0.8, duration: 1500, yoyo: true, repeat: -1 });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.interactHint = this.add.text(width / 2, height - 30, '', { fontSize: '12px', fill: '#c77dff', fontFamily: 'Microsoft YaHei', backgroundColor: '#0d0518CC', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(100).setVisible(false);
        this.nearestTarget = null;
        this.add.text(10, 8, `星币: ${window.GAME_STATE.player.credits}`, { fontSize: '12px', fill: '#c77dff', fontFamily: 'Microsoft YaHei' }).setDepth(50);

        this.createSimpleDialogue();
        this.cameras.main.fadeIn(400, 10, 10, 26);
    }

    createSimpleDialogue() {
        const { width, height } = this.cameras.main;
        this.dialogueOverlay = this.add.container(0, 0).setDepth(200).setVisible(false);
        const bg = this.add.graphics(); bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, width, height); this.dialogueOverlay.add(bg);
        const dBg = this.add.graphics(); dBg.fillStyle(0x0d0518, 0.95); dBg.fillRoundedRect(80, height - 200, width - 160, 175, 10); dBg.lineStyle(2, 0xc77dff, 0.8); dBg.strokeRoundedRect(80, height - 200, width - 160, 175, 10); this.dialogueOverlay.add(dBg);
        this.dlgPortrait = this.add.image(140, height - 115, 'portrait_npc_jiu_jie').setDisplaySize(80, 80).setDepth(201); this.dialogueOverlay.add(this.dlgPortrait);
        const pf = this.add.graphics(); pf.lineStyle(2, 0xc77dff, 0.8); pf.strokeRoundedRect(98, height - 158, 84, 84, 6); this.dialogueOverlay.add(pf);
        this.dlgName = this.add.text(195, height - 190, '', { fontSize: '14px', fill: '#c77dff', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' }).setDepth(201); this.dialogueOverlay.add(this.dlgName);
        this.dlgIntimacy = this.add.text(330, height - 188, '', { fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei' }).setDepth(201); this.dialogueOverlay.add(this.dlgIntimacy);
        this.dlgText = this.add.text(195, height - 165, '', { fontSize: '13px', fill: '#ffffff', fontFamily: 'Microsoft YaHei', wordWrap: { width: width - 330 } }).setDepth(201); this.dialogueOverlay.add(this.dlgText);
        const closeBtn = this.add.text(width - 110, height - 195, '✕', { fontSize: '16px', fill: '#ff6b35' }).setInteractive({ useHandCursor: true }).setDepth(201);
        closeBtn.on('pointerdown', () => { this.dialogueOverlay.setVisible(false); this.isInDialogue = false; }); this.dialogueOverlay.add(closeBtn);
        this.dlgInput = this.add.dom(110, height - 55).createFromHTML('<input type="text" id="bm-chat" placeholder="输入消息..." style="width:580px;height:28px;background:transparent;border:none;color:#fff;font-size:13px;font-family:Microsoft YaHei;outline:none;">').setDepth(202); this.dialogueOverlay.add(this.dlgInput);
        const sendBtn = this.add.text(width - 140, height - 60, '发送', { fontSize: '12px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei', backgroundColor: '#c77dff', padding: { x: 14, y: 5 } }).setInteractive({ useHandCursor: true }).setDepth(202);
        sendBtn.on('pointerdown', async () => { const el = document.getElementById('bm-chat'); if (!el?.value.trim()) return; const msg = el.value.trim(); el.value = ''; this.dlgText.setText('...'); const r = await window.GAME_STATE.dialogue.sendMessage(this.currentNpc, msg); this.dlgText.setText(r); const intimacy = window.GAME_STATE.relationships.getIntimacy(this.currentNpc); this.dlgIntimacy.setText(`♥ 亲密度: ${intimacy}`); });
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
