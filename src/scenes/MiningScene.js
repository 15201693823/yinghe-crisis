// ============================================================
// 矿业营地 - 老赵 + 小梅
// ============================================================

class MiningScene extends Phaser.Scene {
    constructor() { super({ key: 'MiningScene' }); }

    create() {
        window.GAME_STATE.currentScene = 'MiningScene';
        window.GAME_STATE.scene = this;
        this.isInDialogue = false;

        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#140d0a');

        // 暖色矿区背景
        const bg = this.add.graphics();
        // 地面
        bg.fillStyle(0x2a1a0e, 1);
        bg.fillRoundedRect(60, 160, 840, 300, 12);
        bg.lineStyle(2, 0xd4a574, 0.6);
        bg.strokeRoundedRect(60, 160, 840, 300, 12);

        // 矿石堆
        bg.fillStyle(0x8b6914, 0.8);
        bg.fillCircle(150, 350, 30);
        bg.fillCircle(170, 360, 20);
        bg.fillStyle(0xd4a574, 0.6);
        bg.fillCircle(155, 345, 8);
        bg.fillStyle(0x6b4c14, 0.7);
        bg.fillCircle(800, 370, 25);
        bg.fillCircle(820, 360, 18);

        // 篝火
        bg.fillStyle(0xff6b35, 0.6);
        bg.fillCircle(480, 380, 15);
        bg.fillStyle(0xffd93d, 0.8);
        bg.fillCircle(480, 375, 8);
        // 火焰动画
        this.tweens.add({
            targets: bg, alpha: 0.95, duration: 300, yoyo: true, repeat: -1
        });

        // 帐篷
        bg.fillStyle(0x4a3520, 0.9);
        bg.fillTriangle(700, 300, 760, 300, 730, 250);
        bg.fillStyle(0x5a4530, 0.7);
        bg.fillTriangle(720, 300, 760, 300, 740, 270);

        // 工具架
        bg.lineStyle(2, 0x8b6914, 0.8);
        bg.lineBetween(120, 220, 120, 280);
        bg.lineBetween(140, 220, 140, 280);
        bg.lineBetween(110, 240, 150, 240);

        // 灰尘粒子效果
        this.dustParticles = [];
        for (let i = 0; i < 20; i++) {
            const dust = this.add.circle(
                Phaser.Math.Between(100, 860),
                Phaser.Math.Between(170, 440),
                Phaser.Math.Between(1, 3),
                0xd4a574,
                Math.random() * 0.3 + 0.1
            ).setDepth(7);
            this.dustParticles.push(dust);
            this.tweens.add({
                targets: dust,
                y: dust.y - Phaser.Math.Between(20, 60),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 5000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        // 标题
        this.add.text(width / 2, 30, '矿业营地 · 赤铁星', {
            fontSize: '18px', fill: '#d4a574', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#140d0aCC', padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setDepth(5);

        // 玩家
        this.player = this.physics.add.sprite(width / 2, height * 0.5, 'player');
        this.player.setCollideWorldBounds(true).setDepth(10);
        this.player.speed = 160;

        // NPC
        this.npcs = {};
        const npcPositions = {
            lao_zhao: { x: 250, y: 320 },
            xiao_mei: { x: 400, y: 340 }
        };
        for (const [id, pos] of Object.entries(npcPositions)) {
            const d = NPC_DATA[id];
            const s = this.physics.add.sprite(pos.x, pos.y, `npc_${id}`).setImmovable(true).setDepth(8);
            this.add.text(pos.x, pos.y - 24, d.name, {
                fontSize: '10px', fill: '#' + d.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', backgroundColor: '#140d0aAA', padding: { x: 4, y: 2 }
            }).setOrigin(0.5).setDepth(12);
            this.npcs[id] = { sprite: s, data: d };
        }

        // 返回传送门
        this.returnPortal = this.add.sprite(480, 440, 'portal').setDepth(6);
        this.add.text(480, 466, '返回中央大厅', { fontSize: '10px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei' }).setOrigin(0.5).setDepth(12);
        this.tweens.add({ targets: this.returnPortal, alpha: 0.8, duration: 1500, yoyo: true, repeat: -1 });

        // 输入
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.interactHint = this.add.text(width / 2, height - 30, '', { fontSize: '12px', fill: '#d4a574', fontFamily: 'Microsoft YaHei', backgroundColor: '#140d0aCC', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(100).setVisible(false);
        this.nearestTarget = null;

        
        this.add.text(10, 8, `星币: ${window.GAME_STATE.player.credits}`, { fontSize: '12px', fill: '#d4a574', fontFamily: 'Microsoft YaHei' }).setDepth(50);

        this.createSimpleDialogue();
        this.cameras.main.fadeIn(400, 10, 10, 26);
    }

    createSimpleDialogue() {
        const { width, height } = this.cameras.main;
        this.dialogueOverlay = this.add.container(0, 0).setDepth(200).setVisible(false);
        const bg = this.add.graphics(); bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, width, height); this.dialogueOverlay.add(bg);
        const dBg = this.add.graphics(); dBg.fillStyle(0x140d0a, 0.95); dBg.fillRoundedRect(80, height - 200, width - 160, 175, 10); dBg.lineStyle(2, 0xd4a574, 0.8); dBg.strokeRoundedRect(80, height - 200, width - 160, 175, 10); this.dialogueOverlay.add(dBg);
        this.dlgPortrait = this.add.image(140, height - 115, 'portrait_npc_lao_zhao').setDisplaySize(80, 80).setDepth(201); this.dialogueOverlay.add(this.dlgPortrait);
        const pf = this.add.graphics(); pf.lineStyle(2, 0xd4a574, 0.8); pf.strokeRoundedRect(98, height - 158, 84, 84, 6); this.dialogueOverlay.add(pf);
        this.dlgName = this.add.text(195, height - 190, '', { fontSize: '14px', fill: '#d4a574', fontFamily: 'Microsoft YaHei', fontStyle: 'bold' }).setDepth(201); this.dialogueOverlay.add(this.dlgName);
        this.dlgIntimacy = this.add.text(330, height - 188, '', { fontSize: '11px', fill: '#4ecdc4', fontFamily: 'Microsoft YaHei' }).setDepth(201); this.dialogueOverlay.add(this.dlgIntimacy);
        this.dlgText = this.add.text(195, height - 165, '', { fontSize: '13px', fill: '#ffffff', fontFamily: 'Microsoft YaHei', wordWrap: { width: width - 330 } }).setDepth(201); this.dialogueOverlay.add(this.dlgText);
        const closeBtn = this.add.text(width - 110, height - 195, '✕', { fontSize: '16px', fill: '#ff6b35' }).setInteractive({ useHandCursor: true }).setDepth(201);
        closeBtn.on('pointerdown', () => { this.dialogueOverlay.setVisible(false); this.isInDialogue = false; }); this.dialogueOverlay.add(closeBtn);
        this.dlgInput = this.add.dom(110, height - 55).createFromHTML('<input type="text" id="mine-chat" placeholder="输入消息..." style="width:580px;height:28px;background:transparent;border:none;color:#fff;font-size:13px;font-family:Microsoft YaHei;outline:none;">').setDepth(202); this.dialogueOverlay.add(this.dlgInput);
        const sendBtn = this.add.text(width - 140, height - 60, '发送', { fontSize: '12px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei', backgroundColor: '#d4a574', padding: { x: 14, y: 5 } }).setInteractive({ useHandCursor: true }).setDepth(202);
        sendBtn.on('pointerdown', async () => { const el = document.getElementById('mine-chat'); if (!el?.value.trim()) return; const msg = el.value.trim(); el.value = ''; this.dlgText.setText('...'); const r = await window.GAME_STATE.dialogue.sendMessage(this.currentNpc, msg); this.dlgText.setText(r); const intimacy = window.GAME_STATE.relationships.getIntimacy(this.currentNpc); this.dlgIntimacy.setText(`♥ 亲密度: ${intimacy}`); });
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
