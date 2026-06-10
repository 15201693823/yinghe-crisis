// ============================================================
// 通用场景模板 - 各区域场景基于此扩展
// ============================================================

function createBaseScene(sceneKey, sceneName, bgColor, accentColor, npcList, features) {
    return class extends Phaser.Scene {
        constructor() {
            super({ key: sceneKey });
        }

        create() {
            window.GAME_STATE.currentScene = sceneKey;
            window.GAME_STATE.scene = this;
            this.isInDialogue = false;
            this.isTrading = false;

            const { width, height } = this.cameras.main;
            this.cameras.main.setBackgroundColor(bgColor);

            // 背景星空
            const stars = this.add.graphics();
            for (let i = 0; i < 100; i++) {
                stars.fillStyle(0xffffff, Math.random() * 0.5 + 0.1);
                stars.fillCircle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Math.random() > 0.9 ? 2 : 1);
            }

            // 平台
            const platform = this.add.graphics();
            platform.fillStyle(0x2a2a4e, 1);
            platform.fillRoundedRect(60, 160, 840, 300, 12);
            platform.lineStyle(2, accentColor, 0.6);
            platform.strokeRoundedRect(60, 160, 840, 300, 12);

            // 场景标题
            this.add.text(width / 2, 30, sceneName, {
                fontSize: '18px', fill: '#ffffff', fontFamily: 'Microsoft YaHei',
                backgroundColor: bgColor + 'CC', padding: { x: 20, y: 8 }
            }).setOrigin(0.5).setDepth(5);

            // 场景特有装饰
            if (features.drawDecorations) features.drawDecorations(this);

            // 玩家
            this.player = this.physics.add.sprite(width / 2, height * 0.5, 'player');
            this.player.setCollideWorldBounds(true);
            this.player.setDepth(10);
            this.player.speed = 160;

            // NPC
            this.npcs = {};
            if (npcList) {
                npcList.forEach((npcId, index) => {
                    const npcData = NPC_DATA[npcId];
                    const x = 200 + index * 200;
                    const y = 300;
                    const npc = this.physics.add.sprite(x, y, `npc_${npcId}`);
                    npc.setImmovable(true).setDepth(8);
                    npc.npcId = npcId;

                    this.add.text(x, y - 24, npcData.name, {
                        fontSize: '10px', fill: '#' + npcData.color.toString(16).padStart(6, '0'),
                        fontFamily: 'Microsoft YaHei', backgroundColor: '#0a0a1aAA', padding: { x: 4, y: 2 }
                    }).setOrigin(0.5).setDepth(12);

                    this.npcs[npcId] = { sprite: npc, data: npcData };
                });
            }

            // 返回中央大厅传送门
            const returnPortal = this.add.sprite(480, 460, 'portal').setDepth(6);
            this.add.text(480, 486, '返回中央大厅', {
                fontSize: '10px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setDepth(12);

            this.tweens.add({
                targets: returnPortal, alpha: 0.8, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            // 输入
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,A,S,D');
            this.interactKey = this.input.keyboard.addKey('E');
            this.escKey = this.input.keyboard.addKey('ESC');

            // 交互提示
            this.interactHint = this.add.text(width / 2, height - 30, '', {
                fontSize: '12px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei',
                backgroundColor: '#1a1a2eCC', padding: { x: 10, y: 4 }
            }).setOrigin(0.5).setDepth(100).setVisible(false);

            // HUD
            const econ = window.GAME_STATE.economy;
            this.add.text(10, 8, `回合 ${econ?.turn || 1} · 星币: ${window.GAME_STATE.player.credits}`, {
                fontSize: '12px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei'
            }).setDepth(50);

            // 对话UI（简化版）
            this.createSimpleDialogue();

            this.cameras.main.fadeIn(400, 10, 10, 26);
        }

        createSimpleDialogue() {
            const { width, height } = this.cameras.main;
            this.dialogueOverlay = this.add.container(0, 0).setDepth(200).setVisible(false);

            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.4);
            bg.fillRect(0, 0, width, height);
            this.dialogueOverlay.add(bg);

            const dialogBg = this.add.graphics();
            dialogBg.fillStyle(0x1a1a2e, 0.95);
            dialogBg.fillRoundedRect(80, height - 180, width - 160, 150, 10);
            dialogBg.lineStyle(2, 0x00ffa3, 0.8);
            dialogBg.strokeRoundedRect(80, height - 180, width - 160, 150, 10);
            this.dialogueOverlay.add(dialogBg);

            this.dlgName = this.add.text(100, height - 170, '', {
                fontSize: '14px', fill: '#00ffa3', fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
            }).setDepth(201);
            this.dialogueOverlay.add(this.dlgName);

            this.dlgText = this.add.text(100, height - 145, '', {
                fontSize: '13px', fill: '#ffffff', fontFamily: 'Microsoft YaHei',
                wordWrap: { width: width - 220 }
            }).setDepth(201);
            this.dialogueOverlay.add(this.dlgText);

            const closeBtn = this.add.text(width - 110, height - 175, '✕', {
                fontSize: '16px', fill: '#ff6b35'
            }).setInteractive({ useHandCursor: true }).setDepth(201);
            closeBtn.on('pointerdown', () => { this.dialogueOverlay.setVisible(false); this.isInDialogue = false; });
            this.dialogueOverlay.add(closeBtn);

            // 输入
            this.dlgInput = this.add.dom(110, height - 60).createFromHTML(
                '<input type="text" id="scene-chat-input" placeholder="输入消息..." style="width:580px;height:28px;background:transparent;border:none;color:#fff;font-size:13px;font-family:Microsoft YaHei;outline:none;">'
            ).setDepth(202);
            this.dialogueOverlay.add(this.dlgInput);

            const sendBtn = this.add.text(width - 140, height - 65, '发送', {
                fontSize: '12px', fill: '#0a0a1a', fontFamily: 'Microsoft YaHei',
                backgroundColor: '#00ffa3', padding: { x: 14, y: 5 }
            }).setInteractive({ useHandCursor: true }).setDepth(202);
            sendBtn.on('pointerdown', () => this.sendMsg());
            this.dialogueOverlay.add(sendBtn);
        }

        async sendMsg() {
            const el = document.getElementById('scene-chat-input');
            if (!el?.value.trim()) return;
            const msg = el.value.trim();
            el.value = '';
            this.dlgText.setText('...');
            const resp = await window.GAME_STATE.dialogue.sendMessage(this.currentNpc, msg);
            this.dlgText.setText(resp);
        }

        update() {
            if (this.isInDialogue) { this.player.setVelocity(0); return; }

            const speed = this.player.speed;
            let vx = 0, vy = 0;
            if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
            else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
            if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
            else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
            this.player.setVelocity(vx, vy);

            // NPC交互检测
            let nearest = null, nearDist = Infinity;
            for (const [id, npc] of Object.entries(this.npcs)) {
                const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
                if (d < 60 && d < nearDist) { nearDist = d; nearest = id; }
            }

            // 返回传送门检测
            const portalDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 480, 460);

            if (nearest) {
                this.interactHint.setText(`按E与 ${NPC_DATA[nearest].name} 对话`).setVisible(true);
                this.nearestTarget = { type: 'npc', id: nearest };
            } else if (portalDist < 50) {
                this.interactHint.setText('按E返回中央大厅').setVisible(true);
                this.nearestTarget = { type: 'portal' };
            } else {
                this.interactHint.setVisible(false);
                this.nearestTarget = null;
            }

            if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearestTarget) {
                if (this.nearestTarget.type === 'npc') {
                    this.isInDialogue = true;
                    this.currentNpc = this.nearestTarget.id;
                    const npc = NPC_DATA[this.nearestTarget.id];
                    this.dlgName.setText(npc.name);
                    this.dlgName.setColor('#' + npc.color.toString(16).padStart(6, '0'));
                    const greeting = window.GAME_STATE.dialogue.sendMessage(this.nearestTarget.id, '你好');
                    this.dlgText.setText(greeting);
                    this.dialogueOverlay.setVisible(true);
                    window.GAME_STATE.relationships.onDialogue(this.nearestTarget.id);
                } else if (this.nearestTarget.type === 'portal') {
                    this.cameras.main.fadeOut(400, 10, 10, 26);
                    this.time.delayedCall(400, () => this.scene.start('HubScene'));
                }
            }

            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                this.dialogueOverlay.setVisible(false);
                this.isInDialogue = false;
            }
        }
    };
}
