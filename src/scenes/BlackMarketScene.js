// ============================================================
// BlackMarketScene - 暗市街区 — 增强版
// ============================================================

class BlackMarketScene extends Phaser.Scene {
    constructor() { super({ key: 'BlackMarketScene' }); }

    create() {
        window.GAME_STATE.currentScene = 'BlackMarketScene';
        window.GAME_STATE.scene = this;
        this.isInDialogue = false;

        const { width, height } = this.cameras.main;

        this.add.image(width / 2, height / 2, 'bg_blackmarket').setDisplaySize(width, height).setDepth(0);
        const vig = this.add.graphics();
        vig.fillStyle(0x000000, 0.25); vig.fillRect(0, 0, width, 38);

        this.neonTitle = this.add.text(width / 2, 48, 'E层 · 暗市街区', {
            fontSize: '16px', fill: '#c77dff', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            backgroundColor: '#0a0a1eCC', padding: { x: 16, y: 6 }
        }).setOrigin(0.5).setDepth(5);
        this.tweens.add({ targets: this.neonTitle, alpha: { from: 0.6, to: 1 }, duration: 800, yoyo: true, repeat: -1 });

        this.add.text(width / 2, 70, '危险 · 秘密 · 代价', {
            fontSize: '9px', fill: '#d9a0ff', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eAA', padding: { x: 10, y: 3 }
        }).setOrigin(0.5).setDepth(5);

        // 烟雾粒子
        for (let i = 0; i < 10; i++) {
            const smoke = this.add.circle(
                Phaser.Math.Between(50, 910), Phaser.Math.Between(100, 500),
                Phaser.Math.Between(5, 15), 0xc77dff, Math.random() * 0.06
            ).setDepth(7);
            this.tweens.add({
                targets: smoke, x: smoke.x + Phaser.Math.Between(-30, 30),
                y: smoke.y - Phaser.Math.Between(20, 50), alpha: 0,
                duration: Phaser.Math.Between(4000, 8000), repeat: -1, delay: Phaser.Math.Between(0, 3000)
            });
        }

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
            const faction = getFactionInfo(d.faction);
            const displayName = id === 'mysterious' ? '???' : d.name;
            const s = this.physics.add.sprite(pos.x, pos.y, `npc_${id}`).setImmovable(true).setDepth(8);
            this.add.text(pos.x, pos.y - 26, `${faction.icon} ${displayName}`, {
                fontSize: '10px', fill: '#' + d.color.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0a1eCC', padding: { x: 5, y: 2 }
            }).setOrigin(0.5).setDepth(12);
            if (id !== 'mysterious') {
                const intimacy = window.GAME_STATE.relationships?.getIntimacy(id) || 0;
                this.add.text(pos.x, pos.y - 38, getIntimacyHearts(intimacy).substring(0, 5), {
                    fontSize: '7px', fill: '#ff6b9d', fontFamily: 'Microsoft YaHei'
                }).setOrigin(0.5).setDepth(12);
            }
            this.tweens.add({ targets: s, y: pos.y - 3, duration: 2400 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.npcs[id] = { sprite: s, data: d };
        }

        this.returnPortal = this.add.sprite(480, 450, 'portal').setDepth(6);
        this.add.text(480, 476, '⬆ 返回B层·中央大厅', {
            fontSize: '9px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eCC', padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(12);
        this.tweens.add({ targets: this.returnPortal, alpha: { from: 0.5, to: 0.9 }, duration: 1500, yoyo: true, repeat: -1 });
        createPortalParticles(this, 480, 450, 0x00ffa3);

        this.areaPanel = createAreaInfoPanel(this, '暗市街区', '危险·秘密·代价', [
            { name: '九姐', faction: 'gray' },
            { name: '???', faction: 'unknown' }
        ], 0xc77dff);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.iKey = this.input.keyboard.addKey('I');
        this.interactHint = this.add.text(width / 2, height - 22, '', {
            fontSize: '12px', fill: '#c77dff', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eDD', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);
        this.nearestTarget = null;

        this.add.text(12, 10, `💰 ${window.GAME_STATE.player.credits} SC`, {
            fontSize: '12px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei'
        }).setDepth(50);

        this.dialogueContainer = createEnhancedDialogue(this, 'bm-chat', 0xc77dff);
        this.handleSendDialogue = async () => {
            const el = document.getElementById('bm-chat');
            if (!el?.value.trim()) return;
            const msg = el.value.trim(); el.value = '';
            this.dlgText.setText(''); this.dlgTyping.setVisible(true);
            window.audioManager?.dialogueType();
            await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
            const resp = await window.GAME_STATE.dialogue.sendMessage(this.currentDialogueNpc, msg);
            this.dlgTyping.setVisible(false);
            this.dlgText.setText(resp);
            const old = window.GAME_STATE.relationships.getIntimacy(this.currentDialogueNpc);
            window.GAME_STATE.relationships.onDialogue(this.currentDialogueNpc);
            if (window.GAME_STATE.relationships.getIntimacy(this.currentDialogueNpc) > old) {
                window.audioManager?.intimacyUp();
            }
            this.updateDialogueInfo(this.currentDialogueNpc);
            window.saveManager?.save();
        };

        this.joystick = new VirtualJoystick(this);
        window.audioManager?.startAmbient('BlackMarketScene');
        this.cameras.main.fadeIn(400, 10, 10, 26);
    }

    updateDialogueInfo(npcId) {
        const intimacy = window.GAME_STATE.relationships.getIntimacy(npcId);
        this.dlgHearts.setText(getIntimacyHearts(intimacy));
    }

    update() {
        if (this.isInDialogue) { this.player.setVelocity(0); return; }
        const speed = this.player.speed; let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
        if (this.joystick?.active) {
            const dir = this.joystick.getDirection();
            vx = dir.x * speed; vy = dir.y * speed;
        }
        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.player.setVelocity(vx, vy);

        let nearest = null, nearDist = Infinity;
        for (const [id, npc] of Object.entries(this.npcs)) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
            if (d < 65 && d < nearDist) { nearDist = d; nearest = id; }
        }
        const portalDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 480, 450);

        if (nearest) {
            const npc = NPC_DATA[nearest];
            const displayName = nearest === 'mysterious' ? '???' : npc.name;
            const mood = getNpcMood(nearest);
            this.interactHint.setText(`${mood} 按 E 与 ${displayName} 对话`).setVisible(true);
            this.nearestTarget = { type: 'npc', id: nearest };
        } else if (portalDist < 55) {
            this.interactHint.setText('按 E 返回中央大厅').setVisible(true);
            this.nearestTarget = { type: 'portal' };
        } else { this.interactHint.setVisible(false); this.nearestTarget = null; }

        if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearestTarget) {
            if (this.nearestTarget.type === 'npc') {
                this.isInDialogue = true; this.currentDialogueNpc = this.nearestTarget.id;
                const npc = NPC_DATA[this.nearestTarget.id];
                const faction = getFactionInfo(npc.faction);
                const displayName = this.nearestTarget.id === 'mysterious' ? '???' : npc.name;
                window.audioManager?.dialogueOpen();
                this.dlgName.setText(displayName);
                this.dlgName.setColor('#' + npc.color.toString(16).padStart(6, '0'));
                this.dlgTitle.setText(npc.title); this.dlgFaction.setText(`${faction.icon} ${faction.name}`);
                const pKey = `portrait_npc_${this.nearestTarget.id}`;
                if (this.textures.exists(pKey)) this.dlgPortrait.setTexture(pKey);
                this.dlgPortrait.setDisplaySize(90, 90);
                this.updateDialogueInfo(this.nearestTarget.id);
                this.dlgTyping.setVisible(true); this.dlgText.setText('');
                const g = window.GAME_STATE.dialogue.sendMessage(this.nearestTarget.id, '你好');
                this.dlgTyping.setVisible(false);
                this.dlgText.setText(g);
                this.dialogueContainer.setVisible(true);
                window.GAME_STATE.relationships.onDialogue(this.nearestTarget.id);
            } else {
                window.audioManager?.portalActivate();
                window.audioManager?.stopAmbient();
                window.saveManager?.save();
                this.cameras.main.fadeOut(400, 10, 10, 26);
                this.time.delayedCall(400, () => {
                    window.audioManager?.sceneTransition();
                    this.scene.start('HubScene');
                });
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (this.isInDialogue) { this.dialogueContainer.setVisible(false); this.isInDialogue = false; }
            if (this.areaPanel?.visible) this.areaPanel.setVisible(false);
        }
        if (Phaser.Input.Keyboard.JustDown(this.iKey)) this.areaPanel.setVisible(!this.areaPanel.visible);
    }
}
