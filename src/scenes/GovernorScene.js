// ============================================================
// GovernorScene - 总督办公室 — 增强版
// ============================================================

class GovernorScene extends Phaser.Scene {
    constructor() { super({ key: 'GovernorScene' }); }

    create() {
        window.GAME_STATE.currentScene = 'GovernorScene';
        window.GAME_STATE.scene = this;
        this.isInDialogue = false;

        const { width, height } = this.cameras.main;

        this.add.image(width / 2, height / 2, 'bg_governor').setDisplaySize(width, height).setDepth(0);
        const vig = this.add.graphics();
        vig.fillStyle(0x000000, 0.2);
        vig.fillRect(0, 0, width, 38);

        this.add.text(width / 2, 48, 'A层 · 行政塔楼', {
            fontSize: '16px', fill: '#4a90d9', fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            backgroundColor: '#0a0a1eCC', padding: { x: 16, y: 6 }
        }).setOrigin(0.5).setDepth(5);
        this.add.text(width / 2, 70, '行政中枢 · 秩序与平衡', {
            fontSize: '9px', fill: '#7baae0', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eAA', padding: { x: 10, y: 3 }
        }).setOrigin(0.5).setDepth(5);

        this.player = this.physics.add.sprite(width / 2, height * 0.6, 'player');
        this.player.setCollideWorldBounds(true).setDepth(10);
        this.player.speed = 160;

        // NPC: 林远
        this.npcs = {};
        const gov = this.physics.add.sprite(480, 240, 'npc_governor_lin').setImmovable(true).setDepth(8);
        this.add.text(480, 214, '🛡️ 林远', {
            fontSize: '10px', fill: '#4a90d9', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eCC', padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setDepth(12);
        const govIntimacy = window.GAME_STATE.relationships?.getIntimacy('governor_lin') || 0;
        this.add.text(480, 202, getIntimacyHearts(govIntimacy).substring(0, 5), {
            fontSize: '7px', fill: '#ff6b9d', fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(12);
        // 呼吸动画
        this.tweens.add({ targets: gov, y: 237, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.npcs.governor_lin = { sprite: gov, data: NPC_DATA.governor_lin };

        // 返回传送门（带粒子）
        this.returnPortal = this.add.sprite(480, 450, 'portal').setDepth(6);
        this.add.text(480, 476, '⬇ 返回B层·中央大厅', {
            fontSize: '9px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eCC', padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(12);
        this.tweens.add({ targets: this.returnPortal, alpha: { from: 0.5, to: 0.9 }, duration: 1500, yoyo: true, repeat: -1 });
        createPortalParticles(this, 480, 450, 0x00ffa3);

        this.areaPanel = createAreaInfoPanel(this, '行政塔楼', '行政中枢·秩序与平衡', [
            { name: '林远', faction: 'governor' }
        ], 0x4a90d9);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');
        this.iKey = this.input.keyboard.addKey('I');

        this.interactHint = this.add.text(width / 2, height - 22, '', {
            fontSize: '12px', fill: '#4a90d9', fontFamily: 'Microsoft YaHei',
            backgroundColor: '#0a0a1eDD', padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100).setVisible(false);
        this.nearestTarget = null;

        this.add.text(12, 10, `💰 ${window.GAME_STATE.player.credits} SC`, {
            fontSize: '12px', fill: '#ffd93d', fontFamily: 'Microsoft YaHei'
        }).setDepth(50);

        this.dialogueContainer = createEnhancedDialogue(this, 'gov-chat', 0x4a90d9);
        this.handleSendDialogue = async () => {
            const el = document.getElementById('gov-chat');
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
        window.audioManager?.startAmbient('GovernorScene');
        this.cameras.main.fadeIn(400, 10, 10, 26);
    }

    updateDialogueInfo(npcId) {
        const intimacy = window.GAME_STATE.relationships.getIntimacy(npcId);
        this.dlgHearts.setText(getIntimacyHearts(intimacy));
    }

    update() {
        if (this.isInDialogue) { this.player.setVelocity(0); return; }
        const speed = this.player.speed;
        let vx = 0, vy = 0;
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
            const mood = getNpcMood(nearest);
            this.interactHint.setText(`${mood} 按 E 与 ${NPC_DATA[nearest].name} 对话`).setVisible(true);
            this.nearestTarget = { type: 'npc', id: nearest };
        } else if (portalDist < 55) {
            this.interactHint.setText('按 E 返回中央大厅').setVisible(true);
            this.nearestTarget = { type: 'portal' };
        } else { this.interactHint.setVisible(false); this.nearestTarget = null; }

        if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearestTarget) {
            if (this.nearestTarget.type === 'npc') {
                this.isInDialogue = true;
                this.currentDialogueNpc = this.nearestTarget.id;
                const npc = NPC_DATA[this.nearestTarget.id];
                const faction = getFactionInfo(npc.faction);
                window.audioManager?.dialogueOpen();
                this.dlgName.setText(npc.name);
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
                window.GAME_STATE.story.onImportantDialogue(this.nearestTarget.id);
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
