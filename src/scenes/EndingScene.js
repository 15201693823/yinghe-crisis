// ============================================================
// EndingScene - 8种结局画面（暖金+暗红+米白统一风格）
// ============================================================

// ---- 8种结局的完整元数据（被 EndingScene 和 MenuScene 画廊复用） ----
const ENDING_METADATA = {
    balance: {
        id: 'balance',
        title: '荧河平衡',
        subtitle: 'Balance of the Yinghe',
        icon: '⚖️',
        // 配色：暖金主调 + 米白 + 暗红
        palette: {
            bgTop: 0x2a0a0a,
            bgBot: 0x5a3a1a,
            primary: 0xd4a574,
            secondary: 0xf5e6d3,
            accent: 0x8a5a2a,
            glow: 0xffd700,
            bar: 0xd4a574
        },
        particles: 'sparkles',     // 光芒粒子
        decoration: 'tripleHandshake', // 三方握手剪影
        shortDesc: '三方共治，谈判桌上达成脆弱的和平。',
        description: '你成功在荧河建立了三方共治的新秩序。虽然问题没有完全解决，但至少有了一个所有人都愿意坐下来的谈判桌。\n\n林远总督罕见地露出了笑容，老赵和陈老板在和解协议上握手。\n\n荧河恢复了平静——至少表面上是。\n\n' +
                     '……或许真正的平衡，永远在路上。'
    },
    secret: {
        id: 'secret',
        title: '光之河的渡口',
        subtitle: 'The Ferry of Light River',
        icon: '🌌',
        // 配色：暗紫红 + 金色光晕 + 米白
        palette: {
            bgTop: 0x1a0a1a,
            bgBot: 0x4a2a4a,
            primary: 0xc4a04a,
            secondary: 0xf5e6d3,
            accent: 0x8a4a8a,
            glow: 0xffd700,
            bar: 0xc4a04a
        },
        particles: 'runes',        // 神秘符文
        decoration: 'stoneTablet', // 古石板
        shortDesc: '你触碰到了荧河名字的真正来源。',
        description: '你触碰到了一切的根源——航道不是自然形成的。\n\n那块古老的石板暗示着荧河存在更深的秘密。九姐微微笑着说："你终于问到对的问题了。"\n\n但答案，不在这个世界里。\n\n' +
                     '……当光之河再次涌动，你会是下一个渡客吗？'
    },
    governor: {
        id: 'governor',
        title: '秩序的铁腕',
        subtitle: 'The Iron Fist of Order',
        icon: '🛡️',
        // 配色：暗红 + 钢铁深灰 + 米白
        palette: {
            bgTop: 0x1a0a0a,
            bgBot: 0x3a1a1a,
            primary: 0xb22222,
            secondary: 0xf5e6d3,
            accent: 0x4a3a3a,  // 偏暖的"钢铁深灰"
            glow: 0xff8c5a,
            bar: 0xb22222
        },
        particles: 'shields',      // 盾形飘落
        decoration: 'shieldEmblem', // 徽章
        shortDesc: '铁腕之下，秩序井然，怨气暗涌。',
        description: '林远总督站稳了脚跟。荧河在他的铁腕治理下恢复了秩序——但矿工和商会的压抑情绪正在暗处积聚。\n\n总督府的控制力从未如此强大，也从未如此孤独。\n\n' +
                     '……秩序的代价，是所有人的自由。'
    },
    merchant: {
        id: 'merchant',
        title: '市场之手',
        subtitle: 'The Hand of Market',
        icon: '💰',
        // 配色：黄金 + 琥珀色 + 暗红
        palette: {
            bgTop: 0x2a1a0a,
            bgBot: 0x5a3a0a,
            primary: 0xffb84d,
            secondary: 0xf5e6d3,
            accent: 0xb8742a,
            glow: 0xffd700,
            bar: 0xffb84d
        },
        particles: 'coins',        // 钱币
        decoration: 'scale',       // 天平
        shortDesc: '自由贸易带来繁荣，但D层阴影蔓延。',
        description: '荧河成了巽风圈最自由的贸易港。关税大幅降低，贸易量创下新高。陈老板在庆功宴上举杯："生意就是生意。"\n\n但矿工的生活并没有太大改善，D层的不满在暗处蔓延。\n\n' +
                     '……市场之眼，永远只看价格。'
    },
    miner: {
        id: 'miner',
        title: '矿工的尊严',
        subtitle: 'The Miner\'s Dignity',
        icon: '⛏',
        // 配色：暗铜 + 酒红 + 米白
        palette: {
            bgTop: 0x2a0a0a,
            bgBot: 0x3a1a0a,
            primary: 0x8b5a2a,
            secondary: 0xf5e6d3,
            accent: 0x5a1a1a,
            glow: 0xd4a574,
            bar: 0x8b5a2a
        },
        particles: 'oreChips',     // 矿石碎屑
        decoration: 'pickaxe',     // 镐头
        shortDesc: 'D层翻身，但资本在撤，繁荣难续。',
        description: '矿石出口税大幅降低，矿工的工资和生活条件得到了改善。老赵在D层开了一瓶珍藏多年的酒："这才叫过日子。"\n\n但商会对荧河的投资开始撤出——资本永远流向利润最高的地方。\n\n' +
                     '……尊严换来的面包，能吃多久？'
    },
    gray: {
        id: 'gray',
        title: '腐烂的荧河',
        subtitle: 'The Rotten Yinghe',
        icon: '💀',
        // 配色：暗红 + 紫灰 + 米白
        palette: {
            bgTop: 0x1a0a0a,
            bgBot: 0x2a1a2a,
            primary: 0x9a6a8a,  // 紫灰
            secondary: 0xf5e6d3,
            accent: 0x3a1a1a,
            glow: 0x8a4a5a,
            bar: 0x9a6a8a
        },
        particles: 'smoke',        // 灰雾
        decoration: 'cracks',      // 裂痕
        shortDesc: '暗市成了真正的主人，荧河烂到了骨子里。',
        description: '暗市成了荧河的真正主人。九姐的"Last Port"酒吧生意兴隆，但B层的正规市场日渐萧条。\n\n没有人知道你收了多少黑钱，但每个人都能感觉到——荧河烂了。\n\n' +
                     '……你赢得了所有筹码，却输掉了自己的影子。'
    },
    collapse: {
        id: 'collapse',
        title: '危机的深渊',
        subtitle: 'The Abyss of Crisis',
        icon: '🌋',
        // 配色：暗红 + 深黑红 + 米白（深暗但仍偏暖红）
        palette: {
            bgTop: 0x0a0202,
            bgBot: 0x2a0808,
            primary: 0x8b0000,
            secondary: 0xf5e6d3,
            accent: 0x3a0808,
            glow: 0xff4444,
            bar: 0x8b0000
        },
        particles: 'debris',       // 碎片
        decoration: 'shattered',   // 破碎玻璃
        shortDesc: '三方互不相让，荧河滑向深渊。',
        description: '荧河的矛盾终于爆发了。三方互不相让，经济一路滑向深渊。\n\n联盟的召回令在邮路上——你的谈判官生涯，结束了。\n\n荧河还在运转，以它一贯的方式——混乱而顽强。\n\n' +
                     '……但这一次，没有人能救它。'
    },
    unfinished: {
        id: 'unfinished',
        title: '未竟之事',
        subtitle: 'Unfinished Business',
        icon: '🌙',
        // 配色：米白 + 暗金 + 暗红
        palette: {
            bgTop: 0x3a2a1a,
            bgBot: 0x5a4030,
            primary: 0x8a6a3a,
            secondary: 0xf5e6d3,
            accent: 0x6a4a2a,
            glow: 0xc4a04a,
            bar: 0x8a6a3a
        },
        particles: 'moonbeams',    // 月光
        decoration: 'crescent',    // 残月
        shortDesc: '任期结束，故事还在继续。',
        description: '荧河的局势依然紧张。你已经尽力了，但三方矛盾的根源太深。\n\n你的任期结束了，联盟会派新的谈判官来。\n\n荧河的故事还会继续。\n\n' +
                     '……下一次，会有不一样的答案吗？'
    }
};

class EndingScene extends Phaser.Scene {
    constructor() { super({ key: 'EndingScene' }); }

    // ---- 接收来自 StorySystem 或 MenuScene 画廊的数据 ----
    init(data) {
        const requestedId = data?.ending?.id || 'unfinished';
        this.endingId = ENDING_METADATA[requestedId] ? requestedId : 'unfinished';
        this.fromGallery = !!data?.fromGallery;

        const meta = ENDING_METADATA[this.endingId];
        this.ending = {
            id: meta.id,
            title: meta.title,
            subtitle: meta.subtitle,
            description: data?.ending?.description || meta.description,
            icon: meta.icon,
            palette: meta.palette,
            particles: meta.particles,
            decoration: meta.decoration,
            shortDesc: meta.shortDesc
        };
        this.gameStats = data?.gameStats || this._buildSampleStats();
    }

    // ---- 构造一份示例统计（来自画廊时使用） ----
    _buildSampleStats() {
        return {
            merchant: 50,
            miner: 50,
            governor: 50,
            moral: 50,
            decisions: 0,
            dialogues: 0,
            timeStr: '00:00',
            isSample: true
        };
    }

    create() {
        const { width, height } = this.cameras.main;
        const palette = this.ending.palette;

        // ---- 背景渐变（暗红→深色，仍是暖色基底） ----
        this.drawBackground(width, height, palette);

        // ---- 背景动画（每种结局不同） ----
        this.createBackgroundAnimation(width, height, palette);

        // ---- 装饰图样（盾/钱币/石板/残月等） ----
        this.drawDecoration(width, height, palette);

        // ---- 顶部标题区 ----
        this.drawHeader(width, height, palette);

        // ---- 中央圆形图标 ----
        this.drawCenterIcon(width, height, palette);

        // ---- 描述文字（多段落逐段淡入） ----
        this.drawDescription(width, height, palette);

        // ---- 统计面板（档案卡） ----
        this.drawStatsPanel(width, height, palette);

        // ---- 底部按钮 ----
        this.drawButtons(width, height, palette);

        // ---- 整体淡入 ----
        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    // ============================================================
    // 背景渐变
    // ============================================================
    drawBackground(width, height, palette) {
        // 用 Phaser Graphics 画上下渐变
        const bg = this.add.graphics().setDepth(0);
        const steps = 60;
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            const r = ((palette.bgTop >> 16) & 0xff) * (1 - ratio) + ((palette.bgBot >> 16) & 0xff) * ratio;
            const g = ((palette.bgTop >> 8) & 0xff) * (1 - ratio) + ((palette.bgBot >> 8) & 0xff) * ratio;
            const b = (palette.bgTop & 0xff) * (1 - ratio) + (palette.bgBot & 0xff) * ratio;
            const color = (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
            bg.fillStyle(color, 1);
            bg.fillRect(0, (height * i) / steps, width, height / steps + 1);
        }
        // 整体米白微罩
        const overlay = this.add.graphics().setDepth(1);
        overlay.fillStyle(palette.secondary, 0.04);
        overlay.fillRect(0, 0, width, height);
    }

    // ============================================================
    // 背景动画
    // ============================================================
    createBackgroundAnimation(width, height, palette) {
        switch (this.ending.particles) {
            case 'sparkles':      this.bgSparkles(width, height, palette);    break;
            case 'runes':         this.bgRunes(width, height, palette);       break;
            case 'shields':       this.bgShields(width, height, palette);     break;
            case 'coins':         this.bgCoins(width, height, palette);       break;
            case 'oreChips':      this.bgOreChips(width, height, palette);    break;
            case 'smoke':         this.bgSmoke(width, height, palette);       break;
            case 'debris':        this.bgDebris(width, height, palette);      break;
            case 'moonbeams':     this.bgMoonbeams(width, height, palette);   break;
        }
    }

    // 光芒粒子（balance）
    bgSparkles(width, height, palette) {
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(height, height + 200);
            const size = Phaser.Math.Between(1, 3);
            const s = this.add.circle(x, y, size, palette.glow, 0.7).setDepth(2);
            this.tweens.add({
                targets: s,
                y: -20,
                alpha: 0,
                duration: Phaser.Math.Between(4000, 8000),
                delay: Phaser.Math.Between(0, 5000),
                repeat: -1,
                onRepeat: () => {
                    s.x = Phaser.Math.Between(0, width);
                    s.y = height + Phaser.Math.Between(0, 100);
                    s.alpha = 0.7;
                }
            });
        }
        // 中央光晕脉动
        const halo = this.add.circle(width / 2, height * 0.45, 80, palette.glow, 0.15).setDepth(2);
        this.tweens.add({
            targets: halo,
            scaleX: 1.3, scaleY: 1.3, alpha: 0.05,
            duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    // 神秘符文（secret）
    bgRunes(width, height, palette) {
        const runes = ['光', '之', '河', '渡', '口', '✦', '◆', '卐', '☽', '✧'];
        for (let i = 0; i < 18; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const ch = Phaser.Utils.Array.GetRandom(runes);
            const t = this.add.text(x, y, ch, {
                fontSize: Phaser.Math.Between(14, 28) + 'px',
                fill: '#' + palette.glow.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei'
            }).setAlpha(0.5).setDepth(2);
            this.tweens.add({
                targets: t,
                y: y - Phaser.Math.Between(40, 100),
                alpha: 0,
                angle: Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(5000, 9000),
                delay: Phaser.Math.Between(0, 4000),
                repeat: -1,
                onRepeat: () => {
                    t.x = Phaser.Math.Between(0, width);
                    t.y = Phaser.Math.Between(height * 0.6, height);
                    t.alpha = 0.5;
                }
            });
        }
    }

    // 盾形飘落（governor）
    bgShields(width, height, palette) {
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-100, height);
            const s = this.add.graphics().setDepth(2);
            s.lineStyle(1.5, palette.primary, 0.4);
            s.strokeRoundedRect(x - 12, y - 14, 24, 28, 4);
            s.lineStyle(1, palette.primary, 0.3);
            s.beginPath();
            s.moveTo(x - 8, y - 4); s.lineTo(x, y + 4); s.lineTo(x + 8, y - 4);
            s.strokePath();
            this.tweens.add({
                targets: s,
                y: height + 50,
                alpha: 0,
                duration: Phaser.Math.Between(6000, 12000),
                delay: Phaser.Math.Between(0, 4000),
                repeat: -1,
                onRepeat: () => {
                    s.x = Phaser.Math.Between(0, width);
                    s.y = -50;
                    s.alpha = 0.4;
                }
            });
        }
    }

    // 钱币（merchant）
    bgCoins(width, height, palette) {
        for (let i = 0; i < 25; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const r = Phaser.Math.Between(4, 8);
            const c = this.add.circle(x, y, r, palette.glow, 0.7).setDepth(2);
            c.stroke = this.add.graphics().setDepth(3);
            c.stroke.lineStyle(1, palette.accent, 0.8);
            c.stroke.strokeCircle(x, y, r);
            this.tweens.add({
                targets: [c, c.stroke],
                y: y - 30,
                alpha: 0,
                duration: Phaser.Math.Between(4000, 7000),
                delay: Phaser.Math.Between(0, 4000),
                repeat: -1,
                onRepeat: () => {
                    const nx = Phaser.Math.Between(0, width);
                    c.x = nx; c.stroke.x = nx;
                    c.y = height + 20; c.stroke.y = height + 20;
                    c.alpha = 0.7; c.stroke.alpha = 0.8;
                }
            });
        }
    }

    // 矿石碎屑（miner）
    bgOreChips(width, height, palette) {
        for (let i = 0; i < 22; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(4, 9);
            const c = this.add.polygon(x, y, [
                0, -size, size * 0.87, -size * 0.5, size * 0.87, size * 0.5,
                0, size, -size * 0.87, size * 0.5, -size * 0.87, -size * 0.5
            ], palette.primary, 0.7).setDepth(2);
            c.stroke('$' + palette.accent.toString(16).padStart(6, '0'), 1);
            this.tweens.add({
                targets: c,
                y: y + Phaser.Math.Between(20, 60),
                angle: Phaser.Math.Between(-90, 90),
                alpha: 0,
                duration: Phaser.Math.Between(5000, 9000),
                delay: Phaser.Math.Between(0, 3000),
                repeat: -1,
                onRepeat: () => {
                    c.x = Phaser.Math.Between(0, width);
                    c.y = -20;
                    c.alpha = 0.7;
                }
            });
        }
    }

    // 灰雾（gray）
    bgSmoke(width, height, palette) {
        for (let i = 0; i < 18; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(height * 0.5, height);
            const r = Phaser.Math.Between(15, 35);
            const s = this.add.circle(x, y, r, palette.primary, 0.06).setDepth(2);
            this.tweens.add({
                targets: s,
                y: y - Phaser.Math.Between(80, 160),
                x: x + Phaser.Math.Between(-40, 40),
                alpha: 0,
                scaleX: 1.5, scaleY: 1.5,
                duration: Phaser.Math.Between(6000, 10000),
                delay: Phaser.Math.Between(0, 4000),
                repeat: -1,
                onRepeat: () => {
                    s.x = Phaser.Math.Between(0, width);
                    s.y = height + 30;
                    s.alpha = 0.06;
                    s.scaleX = 1; s.scaleY = 1;
                }
            });
        }
    }

    // 碎片（collapse）
    bgDebris(width, height, palette) {
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-100, height);
            const w = Phaser.Math.Between(4, 12);
            const h = Phaser.Math.Between(4, 10);
            const c = this.add.polygon(x, y, [
                -w/2, -h/2, w/2, -h/2, w/2, h/2 - 2, w/2 - 3, h/2, -w/2, h/2
            ], palette.primary, 0.6).setDepth(2);
            this.tweens.add({
                targets: c,
                y: height + 50,
                angle: Phaser.Math.Between(-180, 180),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                delay: Phaser.Math.Between(0, 3000),
                repeat: -1,
                onRepeat: () => {
                    c.x = Phaser.Math.Between(0, width);
                    c.y = -30;
                    c.alpha = 0.6;
                }
            });
        }
        // 顶部警示条
        const warning = this.add.graphics().setDepth(3);
        for (let i = 0; i < width; i += 30) {
            warning.fillStyle(palette.glow, 0.3);
            warning.fillTriangle(i, 0, i + 15, 0, i + 7.5, 8);
            warning.fillTriangle(i + 15, 0, i + 30, 0, i + 22.5, 8);
        }
    }

    // 月光（unfinished）
    bgMoonbeams(width, height, palette) {
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(height, height + 100);
            const r = Phaser.Math.Between(2, 5);
            const s = this.add.circle(x, y, r, palette.secondary, 0.5).setDepth(2);
            this.tweens.add({
                targets: s,
                y: -20,
                alpha: 0,
                duration: Phaser.Math.Between(8000, 14000),
                delay: Phaser.Math.Between(0, 6000),
                repeat: -1,
                onRepeat: () => {
                    s.x = Phaser.Math.Between(0, width);
                    s.y = height + 30;
                    s.alpha = 0.5;
                }
            });
        }
    }

    // ============================================================
    // 装饰图样
    // ============================================================
    drawDecoration(width, height, palette) {
        // 装饰带：位于标题下方（y≈108），由中心主题图标 + 左右延伸的细线组成
        const cy = 108;
        const cx = width / 2;
        const g = this.add.graphics().setDepth(3);

        // 左右两侧的细线（点缀）
        g.lineStyle(1, palette.primary, 0.6);
        g.beginPath();
        g.moveTo(cx - 110, cy); g.lineTo(cx - 40, cy);
        g.moveTo(cx + 40, cy); g.lineTo(cx + 110, cy);
        g.strokePath();
        // 细线两端的菱形端点
        g.fillStyle(palette.primary, 0.7);
        g.fillTriangle(cx - 110, cy - 3, cx - 105, cy, cx - 110, cy + 3);
        g.fillTriangle(cx + 110, cy - 3, cx + 105, cy, cx + 110, cy + 3);
        g.fillTriangle(cx - 40, cy - 3, cx - 35, cy, cx - 40, cy + 3);
        g.fillTriangle(cx + 40, cy - 3, cx + 35, cy, cx + 40, cy + 3);

        // 中心主题小图
        this._drawDecorGlyph(cx, cy, g, palette);
    }

    _drawDecorGlyph(cx, cy, g, palette) {
        switch (this.ending.decoration) {
            case 'tripleHandshake': {
                // 三方握手剪影（三个箭头汇聚）
                g.lineStyle(2, palette.primary, 0.85);
                g.fillStyle(palette.glow, 0.4);
                g.beginPath();
                g.moveTo(cx - 25, cy - 12); g.lineTo(cx - 6, cy - 4); g.lineTo(cx - 6, cy + 4); g.lineTo(cx - 25, cy + 12);
                g.closePath(); g.fillPath(); g.strokePath();
                g.beginPath();
                g.moveTo(cx + 25, cy - 12); g.lineTo(cx + 6, cy - 4); g.lineTo(cx + 6, cy + 4); g.lineTo(cx + 25, cy + 12);
                g.closePath(); g.fillPath(); g.strokePath();
                g.fillStyle(palette.glow, 0.9);
                g.fillCircle(cx, cy, 5);
                break;
            }
            case 'stoneTablet': {
                // 古石板
                g.fillStyle(palette.accent, 0.5);
                g.fillRoundedRect(cx - 30, cy - 12, 60, 24, 3);
                g.lineStyle(1.5, palette.primary, 0.85);
                g.strokeRoundedRect(cx - 30, cy - 12, 60, 24, 3);
                g.lineStyle(1, palette.glow, 0.6);
                g.beginPath();
                g.moveTo(cx - 20, cy - 4); g.lineTo(cx + 20, cy - 4);
                g.moveTo(cx - 20, cy + 4); g.lineTo(cx + 15, cy + 4);
                g.strokePath();
                break;
            }
            case 'shieldEmblem': {
                // 盾形
                g.fillStyle(palette.accent, 0.5);
                g.beginPath();
                g.moveTo(cx, cy - 14);
                g.lineTo(cx + 12, cy - 10);
                g.lineTo(cx + 12, cy + 3);
                g.lineTo(cx, cy + 14);
                g.lineTo(cx - 12, cy + 3);
                g.lineTo(cx - 12, cy - 10);
                g.closePath(); g.fillPath();
                g.lineStyle(1.5, palette.primary, 0.9);
                g.strokePath();
                g.lineStyle(1, palette.glow, 0.6);
                g.beginPath();
                g.moveTo(cx, cy - 5); g.lineTo(cx, cy + 4);
                g.moveTo(cx - 4, cy - 1); g.lineTo(cx + 4, cy - 1);
                g.strokePath();
                break;
            }
            case 'scale': {
                // 天平
                g.lineStyle(1.5, palette.primary, 0.85);
                g.beginPath();
                g.moveTo(cx, cy - 12); g.lineTo(cx, cy + 10); g.strokePath();
                g.beginPath();
                g.moveTo(cx - 14, cy - 4); g.lineTo(cx + 14, cy - 4); g.strokePath();
                g.beginPath();
                g.moveTo(cx - 14, cy - 4); g.lineTo(cx - 11, cy + 5); g.lineTo(cx - 17, cy + 5); g.closePath(); g.strokePath();
                g.beginPath();
                g.moveTo(cx + 14, cy - 4); g.lineTo(cx + 11, cy + 5); g.lineTo(cx + 17, cy + 5); g.closePath(); g.strokePath();
                g.fillStyle(palette.glow, 0.7);
                g.fillCircle(cx, cy - 12, 2);
                break;
            }
            case 'pickaxe': {
                // 镐头
                g.lineStyle(2, palette.primary, 0.85);
                g.beginPath();
                g.moveTo(cx - 10, cy - 10); g.lineTo(cx + 10, cy + 10); g.strokePath();
                g.fillStyle(palette.glow, 0.8);
                g.beginPath();
                g.moveTo(cx - 12, cy - 10); g.lineTo(cx - 4, cy - 12); g.lineTo(cx - 2, cy - 4); g.closePath(); g.fillPath();
                g.beginPath();
                g.moveTo(cx + 4, cy + 12); g.lineTo(cx + 12, cy + 10); g.lineTo(cx + 10, cy + 2); g.closePath(); g.fillPath();
                break;
            }
            case 'cracks': {
                // 裂痕（小三角组）
                g.lineStyle(1, palette.primary, 0.7);
                const c1 = [[cx - 18, cy + 5], [cx - 8, cy - 5], [cx - 14, cy - 10], [cx - 4, cy + 5]];
                c1.forEach(p => {});
                g.beginPath();
                g.moveTo(cx - 16, cy + 6); g.lineTo(cx - 8, cy - 6); g.lineTo(cx - 12, cy - 10);
                g.strokePath();
                g.beginPath();
                g.moveTo(cx + 8, cy - 6); g.lineTo(cx + 16, cy + 6); g.lineTo(cx + 12, cy + 10);
                g.strokePath();
                g.lineStyle(1, palette.glow, 0.4);
                g.beginPath();
                g.moveTo(cx - 4, cy - 2); g.lineTo(cx, cy - 8); g.lineTo(cx + 4, cy - 2);
                g.strokePath();
                break;
            }
            case 'shattered': {
                // 破碎玻璃碎片
                g.lineStyle(1.5, palette.primary, 0.85);
                g.fillStyle(palette.accent, 0.4);
                // 左侧碎片
                g.beginPath();
                g.moveTo(cx - 20, cy + 5); g.lineTo(cx - 8, cy - 8); g.lineTo(cx - 4, cy + 8);
                g.closePath(); g.fillPath(); g.strokePath();
                // 右侧碎片
                g.beginPath();
                g.moveTo(cx + 20, cy - 5); g.lineTo(cx + 8, cy + 8); g.lineTo(cx + 4, cy - 8);
                g.closePath(); g.fillPath(); g.strokePath();
                break;
            }
            case 'crescent': {
                // 残月
                g.fillStyle(palette.glow, 0.85);
                g.fillCircle(cx, cy, 10);
                g.fillStyle(palette.bgTop, 0.9);
                g.fillCircle(cx + 3, cy - 1, 8);
                break;
            }
        }
    }

    // ============================================================
    // 顶部标题区
    // ============================================================
    drawHeader(width, height, palette) {
        // 顶部角标
        const cornerSize = 30;
        const cg = this.add.graphics().setDepth(10);
        cg.lineStyle(2, palette.primary, 0.8);
        // 左上
        cg.beginPath();
        cg.moveTo(20, 20 + cornerSize); cg.lineTo(20, 20); cg.lineTo(20 + cornerSize, 20); cg.strokePath();
        // 右上
        cg.beginPath();
        cg.moveTo(width - 20 - cornerSize, 20); cg.lineTo(width - 20, 20); cg.lineTo(width - 20, 20 + cornerSize); cg.strokePath();

        // 金色画框（在标题区）
        const titleBg = this.add.graphics().setDepth(10);
        titleBg.fillStyle(palette.bgTop, 0.5);
        titleBg.fillRoundedRect(width * 0.2, 22, width * 0.6, 60, 10);
        titleBg.lineStyle(2, palette.primary, 0.9);
        titleBg.strokeRoundedRect(width * 0.2, 22, width * 0.6, 60, 10);
        titleBg.lineStyle(1, palette.glow, 0.4);
        titleBg.strokeRoundedRect(width * 0.2 - 2, 20, width * 0.6 + 4, 64, 11);

        // 标记 "ENDING" 小标签
        const tagY = 28;
        const tagBg = this.add.graphics().setDepth(11);
        tagBg.fillStyle(palette.primary, 0.9);
        tagBg.fillRoundedRect(width * 0.2 + 12, tagY, 56, 16, 4);
        this.add.text(width * 0.2 + 40, tagY + 8, 'ENDING', {
            fontSize: '9px', fill: '#' + palette.bgTop.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(12);

        // 大标题
        this.add.text(width / 2, 60, this.ending.title, {
            fontSize: '28px', fill: '#' + palette.secondary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#' + palette.bgTop.toString(16).padStart(6, '0'), strokeThickness: 4
        }).setOrigin(0.5).setDepth(12);

        // 副标题（英文）
        this.add.text(width / 2, 84, this.ending.subtitle, {
            fontSize: '11px', fill: '#' + palette.primary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(12);
    }

    // ============================================================
    // 中央圆形图标
    // ============================================================
    drawCenterIcon(width, height, palette) {
        const cx = width / 2;
        const cy = height * 0.38;
        const r = 56;

        // 外圈光晕（脉动）
        const halo = this.add.circle(cx, cy, r + 12, palette.glow, 0.12).setDepth(10);
        this.tweens.add({
            targets: halo,
            scaleX: 1.15, scaleY: 1.15, alpha: 0.04,
            duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // 金色画框圆环
        const ring1 = this.add.graphics().setDepth(11);
        ring1.lineStyle(3, palette.primary, 0.9);
        ring1.strokeCircle(cx, cy, r);
        ring1.lineStyle(1, palette.glow, 0.5);
        ring1.strokeCircle(cx, cy, r + 5);

        // 暗红底圆
        const circle = this.add.circle(cx, cy, r - 2, palette.bgTop, 0.7).setDepth(12);

        // 四角装饰
        const corner = this.add.graphics().setDepth(13);
        const cr = r;
        corner.lineStyle(2, palette.glow, 0.8);
        // 左上
        corner.beginPath();
        corner.moveTo(cx - cr - 3, cy - cr * 0.5);
        corner.lineTo(cx - cr - 3, cy - cr - 3);
        corner.lineTo(cx - cr * 0.5, cy - cr - 3);
        corner.strokePath();
        // 右上
        corner.beginPath();
        corner.moveTo(cx + cr * 0.5, cy - cr - 3);
        corner.lineTo(cx + cr + 3, cy - cr - 3);
        corner.lineTo(cx + cr + 3, cy - cr * 0.5);
        corner.strokePath();
        // 左下
        corner.beginPath();
        corner.moveTo(cx - cr - 3, cy + cr * 0.5);
        corner.lineTo(cx - cr - 3, cy + cr + 3);
        corner.lineTo(cx - cr * 0.5, cy + cr + 3);
        corner.strokePath();
        // 右下
        corner.beginPath();
        corner.moveTo(cx + cr * 0.5, cy + cr + 3);
        corner.lineTo(cx + cr + 3, cy + cr + 3);
        corner.lineTo(cx + cr + 3, cy + cr * 0.5);
        corner.strokePath();

        // 中央图标字符
        this.add.text(cx, cy, this.ending.icon, {
            fontSize: '54px',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(14);
    }

    // ============================================================
    // 描述文字（多段落逐段淡入）
    // ============================================================
    drawDescription(width, height, palette) {
        // 描述面板
        const descX = width * 0.1;
        const descY = height * 0.55;
        const descW = width * 0.8;
        const descH = height * 0.18;

        const descBg = this.add.graphics().setDepth(10);
        descBg.fillStyle(palette.bgTop, 0.55);
        descBg.fillRoundedRect(descX, descY, descW, descH, 8);
        descBg.lineStyle(1.5, palette.primary, 0.6);
        descBg.strokeRoundedRect(descX, descY, descW, descH, 8);

        // 分割段落
        const paragraphs = this.ending.description.split('\n').filter(p => p.trim());
        const paraH = (descH - 12) / Math.max(paragraphs.length, 1);
        const paraTexts = [];

        paragraphs.forEach((p, i) => {
            const t = this.add.text(width / 2, descY + 6 + paraH * i + paraH / 2, p, {
                fontSize: '11px',
                fill: '#' + palette.secondary.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei',
                align: 'center',
                wordWrap: { width: descW - 30 }
            }).setOrigin(0.5).setDepth(11).setAlpha(0);
            paraTexts.push(t);

            // 逐段淡入
            this.tweens.add({
                targets: t,
                alpha: 1,
                duration: 600,
                delay: 600 + i * 800,
                ease: 'Sine.easeOut'
            });
        });
    }

    // ============================================================
    // 统计面板（档案卡）
    // ============================================================
    drawStatsPanel(width, height, palette) {
        const panelX = width * 0.1;
        const panelY = height * 0.75;
        const panelW = width * 0.8;
        const panelH = 56;

        const bg = this.add.graphics().setDepth(10);
        bg.fillStyle(palette.bgTop, 0.65);
        bg.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
        bg.lineStyle(1.5, palette.primary, 0.6);
        bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
        // 左侧标签
        bg.fillStyle(palette.primary, 0.85);
        bg.fillRoundedRect(panelX + 8, panelY + 8, 50, panelH - 16, 4);
        this.add.text(panelX + 33, panelY + panelH / 2, '档案', {
            fontSize: '11px', fill: '#' + palette.bgTop.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(12);

        // 如果是示例数据，加个"预览"提示
        if (this.gameStats.isSample) {
            this.add.text(panelX + 70, panelY + 14, '（画廊预览）', {
                fontSize: '9px', fill: '#' + palette.primary.toString(16).padStart(6, '0'),
                fontFamily: 'Microsoft YaHei', fontStyle: 'italic'
            }).setDepth(12);
        }

        // 6项指标，每项2列
        const items = [
            { label: '商会', value: this.gameStats.merchant, max: 100, color: palette.bar },
            { label: '矿工', value: this.gameStats.miner, max: 100, color: palette.bar },
            { label: '总督', value: this.gameStats.governor, max: 100, color: palette.bar },
            { label: '道德', value: this.gameStats.moral, max: 100, color: palette.bar },
            { label: '决策', value: this.gameStats.decisions, max: 10, color: palette.bar, raw: true },
            { label: '对话', value: this.gameStats.dialogues, max: 50, color: palette.bar, raw: true }
        ];

        const startX = panelX + 70;
        const startY = panelY + 8;
        const cellW = (panelW - 80) / 3;
        const cellH = (panelH - 16) / 2;

        items.forEach((it, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = startX + col * cellW;
            const y = startY + row * cellH;
            this.drawStatItem(x, y, cellW - 4, cellH - 2, it, palette);
        });

        // 游戏时长（右下）
        this.add.text(panelX + panelW - 10, panelY + panelH / 2,
            `⏱ ${this.gameStats.timeStr}`, {
            fontSize: '10px', fill: '#' + palette.primary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(1, 0.5).setDepth(12);
    }

    drawStatItem(x, y, w, h, item, palette) {
        // 标签
        this.add.text(x + 4, y + 2, item.label, {
            fontSize: '9px', fill: '#' + palette.secondary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei'
        }).setDepth(12);

        // 数值
        this.add.text(x + w - 4, y + 2, item.raw ? String(item.value) : `${item.value}/${item.max}`, {
            fontSize: '9px', fill: '#' + palette.primary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold'
        }).setOrigin(1, 0).setDepth(12);

        // 进度条
        const barX = x + 4;
        const barY = y + h - 8;
        const barW = w - 8;
        const barH = 4;
        const ratio = Math.max(0, Math.min(1, item.value / item.max));

        const barBg = this.add.graphics().setDepth(12);
        barBg.fillStyle(palette.bgTop, 0.85);
        barBg.fillRoundedRect(barX, barY, barW, barH, 2);

        const barFill = this.add.graphics().setDepth(13);
        barFill.fillStyle(item.color, 0.95);
        barFill.fillRoundedRect(barX, barY, barW * ratio, barH, 2);
    }

    // ============================================================
    // 底部按钮
    // ============================================================
    drawButtons(width, height, palette) {
        const btnY = height - 26;
        const btnW = 160;
        const btnH = 36;
        const gap = 20;
        const totalW = btnW * 2 + gap;
        const startX = (width - totalW) / 2;

        // "再来一次" 按钮
        this.createButton(
            startX + btnW / 2, btnY, btnW, btnH,
            '🔁 再来一次', palette,
            () => {
                window.audioManager?.uiClick();
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    // 清除存档并回到 MenuScene
                    if (window.saveManager?.clear) {
                        window.saveManager.clear();
                    }
                    // 重置游戏状态
                    if (typeof resetGameState === 'function') resetGameState();
                    this.scene.start('MenuScene');
                });
            }
        );

        // "观看开场动画" 按钮
        this.createButton(
            startX + btnW + gap + btnW / 2, btnY, btnW, btnH,
            '📖 观看开场动画', palette,
            () => {
                window.audioManager?.uiClick();
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('IntroScene');
                });
            }
        );
    }

    createButton(cx, cy, w, h, text, palette, onClick) {
        const bg = this.add.graphics().setDepth(20);
        const draw = (color, alpha, border) => {
            bg.clear();
            bg.fillStyle(color, alpha);
            bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
            bg.lineStyle(2, border, 0.9);
            bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        };
        draw(palette.bgTop, 0.85, palette.primary);

        const btn = this.add.text(cx, cy, text, {
            fontSize: '14px', fill: '#' + palette.secondary.toString(16).padStart(6, '0'),
            fontFamily: 'Microsoft YaHei', fontStyle: 'bold',
            stroke: '#' + palette.bgTop.toString(16).padStart(6, '0'), strokeThickness: 3
        }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            draw(palette.primary, 0.4, palette.glow);
            btn.setStyle({ fill: '#' + palette.glow.toString(16).padStart(6, '0') });
        });
        btn.on('pointerout', () => {
            draw(palette.bgTop, 0.85, palette.primary);
            btn.setStyle({ fill: '#' + palette.secondary.toString(16).padStart(6, '0') });
        });
        btn.on('pointerdown', onClick);

        // 轻微浮动
        this.tweens.add({
            targets: [bg, btn],
            y: '+=2',
            duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }
}

window.EndingScene = EndingScene;
window.ENDING_METADATA = ENDING_METADATA;
