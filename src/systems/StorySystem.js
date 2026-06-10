// ============================================================
// 剧情系统 - 驱动叙事推进与多结局
// ============================================================

class StorySystem {
    constructor() {
        // 主线进度（对话驱动）
        this.mainQuest = '初到荧河';  // 当前主线阶段名
        this.stage = 0;              // 0-10
        this.maxStage = 10;

        // 关键决策记录（影响结局分支）
        this.keyDecisions = [];

        // 剧情事件列表
        this.events = [];
    }

    // ---- 玩家完成一次关键对话后调用 ----
    onImportantDialogue(npcId) {
        const flags = window.GAME_STATE.flags;

        // 按NPC推进主线
        if (npcId === 'governor_lin' && !flags.metGovernor) {
            flags.metGovernor = true;
            this.advanceMainQuest('林远总督向你介绍了荧河的局势：三方矛盾已经持续了半个世纪，希望你能帮他找到平衡点。');
        }
        if (npcId === 'lao_zhao' && !flags.talkedToMiner) {
            flags.talkedToMiner = true;
            this.advanceMainQuest('老赵带你看了矿工宿舍，条件很差。矿工们最不满的是15%的矿石出口税——他说这是在抽矿工的血。');
        }
        if (npcId === 'chen_boss' && !flags.talkedToMerchant) {
            flags.talkedToMerchant = true;
            this.advanceMainQuest('陈老板在贸易大厅接待了你。他认为关税是贸易的最大障碍，配额制度才是荧河经济的真正支柱。他暗示知道一些"内部消息"。');
        }

        // 检查主线解锁进度
        this.checkStageProgression();
    }

    // ---- 推进主线 ----
    advanceMainQuest(description) {
        this.stage = Math.min(this.stage + 1, this.maxStage);
        this.currentQuest = description;
        this.events.push({
            type: 'main_quest',
            description,
            time: Date.now()
        });
    }

    // ---- 检查阶段推进 ----
    checkStageProgression() {
        const flags = window.GAME_STATE.flags;

        // Stage 3: 见过三方首脑 → 触发"航道异常"线索
        if (this.stage >= 3 && !this._channelHintTriggered) {
            this._channelHintTriggered = true;
            this.events.push({
                type: 'hint',
                description: '苏雷船长提到：航道的信号最近不太对劲，像是有什么东西在另一端敲打。',
                time: Date.now()
            });
        }

        // Stage 5: 与苏雷深度对话过 → 航道断裂事件触发
        if (this.stage >= 5 && !flags.channelBroken) {
            this.triggerChannelBreak();
        }

        // Stage 7: 解决航道危机 + 见过三方 → 暗线浮出
        if (this.stage >= 7 && flags.channelFixed && !flags.secretActivated) {
            this.triggerSecretReveal();
        }
    }

    // ---- 航道断裂事件 ----
    triggerChannelBreak() {
        const flags = window.GAME_STATE.flags;
        if (flags.channelBroken) return;

        flags.channelBroken = true;
        this.events.push({
            type: 'crisis',
            description: '主航道突然断裂！进口物资供应骤减，物价开始飞涨。苏雷说这次的断裂信号和他二十年来见过的都不一样——有规律。',
            time: Date.now()
        });
        // 降低各方满意度
        window.GAME_STATE.factionSatisfaction.merchant -= 15;
        window.GAME_STATE.factionSatisfaction.miner -= 10;
        window.GAME_STATE.factionSatisfaction.governor -= 10;
    }

    // ---- 航道修复 ----
    fixChannel() {
        window.GAME_STATE.flags.channelFixed = true;
        this.events.push({
            type: 'recovery',
            description: '航道修复了，但苏雷私下告诉你——官方说是"自然衰减"，但他不相信。断裂前的信号像是有人在另一端敲航道。',
            time: Date.now()
        });
        window.GAME_STATE.factionSatisfaction.merchant += 10;
        window.GAME_STATE.factionSatisfaction.governor += 10;
    }

    // ---- 暗线揭示 ----
    triggerSecretReveal() {
        window.GAME_STATE.flags.secretActivated = true;
        this.events.push({
            type: 'secret',
            description: '九姐告诉你一个秘密：荧河的名字来自建站时发现的一块古老石板，上面写着"光之河的渡口"。航道节点可能不是自然形成的。',
            time: Date.now()
        });
    }

    // ---- 记录关键决策 ----
    recordDecision(decisionName, choice, consequence) {
        this.keyDecisions.push({
            name: decisionName,
            choice,
            consequence,
            time: Date.now()
        });
    }

    // ---- 检查黑市解锁条件 ----
    checkBlackMarketUnlock() {
        const flags = window.GAME_STATE.flags;
        if (flags.blackMarketUnlocked) return true;

        // 解锁条件（满足任一即可）：
        const hasHighIntimacy = (
            (window.GAME_STATE.relationships?.getIntimacy('chen_boss') || 0) >= 3 &&
            (window.GAME_STATE.relationships?.getIntimacy('lao_zhao') || 0) >= 3
        );
        const hasAjieTrust = (window.GAME_STATE.relationships?.getIntimacy('ajie') || 0) >= 4;
        const channelBroken = flags.channelBroken;

        if (hasHighIntimacy || hasAjieTrust || channelBroken) {
            flags.blackMarketUnlocked = true;
            this.events.push({
                type: 'unlock',
                description: '暗市街区解锁了！阿杰悄悄塞给你一张纸条："去E层找九姐，提我的名字。"',
                time: Date.now()
            });
            return true;
        }
        return false;
    }

    // ---- 检查结局 ----
    checkEnding() {
        const sat = window.GAME_STATE.factionSatisfaction;
        const flags = window.GAME_STATE.flags;
        const moral = window.GAME_STATE.player.moral;
        const relationships = window.GAME_STATE.relationships;

        // 结局由关键决策 + 满意度 + 道德值共同决定
        const supportGovernor = this.keyDecisions.filter(d => d.choice === 'support_governor').length;
        const supportMiners = this.keyDecisions.filter(d => d.choice === 'support_miners').length;
        const supportMerchant = this.keyDecisions.filter(d => d.choice === 'support_merchant').length;
        const grayChoices = this.keyDecisions.filter(d => d.choice === 'gray').length;

        // 平衡结局：三方满意度都>=60
        if (sat.merchant >= 60 && sat.miner >= 60 && sat.governor >= 60 && !flags.secretActivated) {
            return {
                id: 'balance',
                title: '荧河平衡',
                description: '你成功在荧河建立了三方共治的新秩序。虽然问题没有完全解决，但至少有了一个所有人都愿意坐下来的谈判桌。林远总督罕见地露出了笑容，老赵和陈老板在和解协议上握手。\n\n荧河恢复了平静——至少表面上是。'
            };
        }

        // 秘密结局：触发过暗线
        if (flags.secretActivated) {
            return {
                id: 'secret',
                title: '光之河的渡口',
                description: '你触碰到了一切的根源——航道不是自然形成的。那块古老的石板暗示着荧河存在更深的秘密。九姐微微笑着说："你终于问到对的问题了。"\n\n但答案，不在这个世界里。'
            };
        }

        // 铁腕结局：支持总督最多
        if (supportGovernor > supportMiners && supportGovernor > supportMerchant && sat.governor >= 70) {
            return {
                id: 'governor',
                title: '秩序的铁腕',
                description: '林远总督站稳了脚跟。荧河在他的铁腕治理下恢复了秩序——但矿工和商会的压抑情绪正在暗处积聚。\n\n总督府的控制力从未如此强大，也从未如此孤独。'
            };
        }

        // 商人结局
        if (supportMerchant >= supportMiners && sat.merchant >= 70) {
            return {
                id: 'merchant',
                title: '市场之手',
                description: '荧河成了巽风圈最自由的贸易港。关税大幅降低，贸易量创下新高。陈老板在庆功宴上举杯："生意就是生意。"\n\n但矿工的生活并没有太大改善，D层的不满在暗处蔓延。'
            };
        }

        // 矿工结局
        if (supportMiners >= supportMerchant && sat.miner >= 70) {
            return {
                id: 'miner',
                title: '矿工的尊严',
                description: '矿石出口税大幅降低，矿工的工资和生活条件得到了改善。老赵在D层开了一瓶珍藏多年的酒："这才叫过日子。"\n\n但商会对荧河的投资开始撤出——资本永远流向利润最高的地方。'
            };
        }

        // 道德崩塌结局
        if (grayChoices >= 3 || moral <= 10) {
            return {
                id: 'gray',
                title: '腐烂的荧河',
                description: '暗市成了荧河的真正主人。九姐的"Last Port"酒吧生意兴隆，但B层的正规市场日渐萧条。没有人知道你收了多少黑钱，但每个人都能感觉到——荧河烂了。'
            };
        }

        // 什么也没做好的结局（默认）
        if (sat.merchant < 30 && sat.miner < 30 && sat.governor < 30) {
            return {
                id: 'collapse',
                title: '危机的深渊',
                description: '荧河的矛盾终于爆发了。三方互不相让，经济一路滑向深渊。联盟的召回令在邮路上——你的谈判官生涯，结束了。\n\n荧河还在运转，以它一贯的方式——混乱而顽强。'
            };
        }

        return null; // 还没到结局
    }

    // ---- 获取剧情摘要 ----
    getSummary() {
        const flags = window.GAME_STATE.flags;
        let progress = 0;
        if (flags.metGovernor) progress += 20;
        if (flags.talkedToMiner) progress += 20;
        if (flags.talkedToMerchant) progress += 20;
        if (flags.channelBroken) progress += 15;
        if (flags.channelFixed) progress += 15;
        progress = Math.min(progress, 100);

        return {
            mainQuest: this.currentQuest || '探索荧河空间站，与各方势力对话',
            progress,
            stage: this.stage,
            eventCount: this.events.length,
            recentEvents: this.events.slice(-3)
        };
    }
}

window.StorySystem = StorySystem;