// ============================================================
// 剧情系统 - 驱动叙事推进与多结局（增强版）
// ============================================================

class StorySystem {
    constructor() {
        // 主线进度（对话驱动）
        this.mainQuest = '初到荧河';  // 当前主线阶段名
        this.stage = 0;              // 0-10
        this.maxStage = 10;

        // 关键决策记录（影响结局分支）
        this.keyDecisions = [];
        this._decisionsMade = {};    // 已做出的决策ID

        // 剧情事件列表
        this.events = [];
        
        // 首脑对话记录（用于判断是否与三方首脑都对话过）
        this._leadersTalkedTo = {
            governor: false,
            merchant: false,
            miner: false
        };
    }

    // ---- 玩家完成一次关键对话后调用 ----
    onImportantDialogue(npcId) {
        const flags = window.GAME_STATE.flags;

        // 按NPC推进主线
        if (npcId === 'governor_lin' && !flags.metGovernor) {
            flags.metGovernor = true;
            this._leadersTalkedTo.governor = true;
            this.advanceMainQuest('林远总督向你介绍了荧河的局势：三方矛盾已经持续了半个世纪，希望你能帮他找到平衡点。');
        }
        if (npcId === 'lao_zhao' && !flags.talkedToMiner) {
            flags.talkedToMiner = true;
            this._leadersTalkedTo.miner = true;
            this.advanceMainQuest('老赵带你看了矿工宿舍，条件很差。矿工们最不满的是15%的矿石出口税——他说这是在抽矿工的血。');
        }
        if (npcId === 'chen_boss' && !flags.talkedToMerchant) {
            flags.talkedToMerchant = true;
            this._leadersTalkedTo.merchant = true;
            this.advanceMainQuest('陈老板在贸易大厅接待了你。他认为关税是贸易的最大障碍，配额制度才是荧河经济的真正支柱。他暗示知道一些"内部消息"。');
        }
        
        // 与苏雷船长对话推进
        if (npcId === 'captain_su' && !flags.talkedToCaptain) {
            flags.talkedToCaptain = true;
            this.advanceMainQuest('苏雷船长警告你：航道信号最近有些异常，像是另一端有什么在敲打。这不是好兆头。');
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

        // Stage 3: 见过三方首脑 → 触发"航道异常"线索 + 第一次决策
        if (this.stage >= 1 && this._allLeadersTalked() && !this._decision1Triggered) {
            this._decision1Triggered = true;
            this.events.push({
                type: 'main_quest',
                description: '你已经见过了荧河的三方首脑。他们各执一词，似乎都各有道理。是时候做出你的第一个选择了。',
                time: Date.now()
            });
        }

        // Stage 3: 触发"航道异常"线索
        if (this.stage >= 2 && !this._channelHintTriggered) {
            this._channelHintTriggered = true;
            this.events.push({
                type: 'hint',
                description: '苏雷船长提到：航道的信号最近不太对劲，像是有什么东西在另一端敲打。',
                time: Date.now()
            });
        }

        // Stage 5: 与苏雷深度对话过 → 航道断裂事件触发
        if (this.stage >= 3 && flags.talkedToCaptain && !flags.channelBroken) {
            this.triggerChannelBreak();
        }

        // Stage 5: 航道断裂后 → 第二次决策
        if (flags.channelBroken && !this._decision2Triggered) {
            this._decision2Triggered = true;
            this.events.push({
                type: 'main_quest',
                description: '航道断裂导致物价飞涨！荧河面临前所未有的危机。你需要做出选择来应对这场危机。',
                time: Date.now()
            });
        }

        // Stage 7: 解决航道危机 + 见过三方 → 暗线浮出
        if (this.stage >= 5 && flags.channelFixed && !flags.secretActivated) {
            this.triggerSecretReveal();
        }
        
        // Stage 7: 暗线揭示后 → 第三次决策
        if (flags.secretActivated && !this._decision3Triggered) {
            this._decision3Triggered = true;
            this.events.push({
                type: 'main_quest',
                description: '九姐透露了荧河名字的真正来源——"光之河的渡口"。这背后隐藏着更大的秘密。你必须做出最终的选择。',
                time: Date.now()
            });
        }
    }
    
    // ---- 检查是否与三方首脑都对话过 ----
    _allLeadersTalked() {
        return this._leadersTalkedTo.governor && 
               this._leadersTalkedTo.merchant && 
               this._leadersTalkedTo.miner;
    }

    // ---- 获取可用决策 ----
    getAvailableDecision() {
        const flags = window.GAME_STATE.flags;
        
        // 决策1：与三方首脑都对话过后触发（选边站）
        if (this._allLeadersTalked() && !this._decisionsMade['decision_1'] && !this._decision1Locked) {
            return {
                id: 'decision_1',
                title: '⚖️ 三方博弈',
                description: '你已经了解了荧河三方势力的诉求。现在，你必须表明立场。',
                choices: [
                    { id: 'support_merchant', text: '🤝 支持商会联盟', effect: 'merchant+15, miner-5, governor-5, moral-5', 
                      hint: '自由贸易能激发市场活力' },
                    { id: 'support_miner', text: '⛏ 支持矿工联合会', effect: 'miner+15, merchant-5, governor-5, moral+5',
                      hint: '底层民众的生活需要改善' },
                    { id: 'support_governor', text: '🛡️ 支持总督府', effect: 'governor+15, merchant-5, miner-5, moral-3',
                      hint: '秩序和稳定是发展的基础' },
                    { id: 'stay_neutral', text: '⚖️ 保持中立', effect: 'all+5, moral+3',
                      hint: '寻求三方共识' }
                ]
            };
        }
        
        // 决策2：航道断裂后触发（危机应对）
        if (flags.channelBroken && !this._decisionsMade['decision_2'] && !this._decision2Locked) {
            return {
                id: 'decision_2',
                title: '🚨 危机应对',
                description: '航道断裂导致物价飞涨！荧河面临前所未有的危机。你需要做出选择来应对这场危机。',
                choices: [
                    { id: 'lower_tariff', text: '💰 调降关税救济商人', effect: 'merchant+10, governor-5',
                      hint: '降低贸易成本，缓解物价' },
                    { id: 'subsidy_miner', text: '⛏ 增加矿工补贴', effect: 'miner+10, governor-5',
                      hint: '保障底层生活' },
                    { id: 'tax_hard', text: '📋 加税加强行政', effect: 'governor+10, merchant-5, miner-5',
                      hint: '加强政府调控能力' }
                ]
            };
        }
        
        // 决策3：暗线揭示后触发（真相抉择）
        if (flags.secretActivated && !this._decisionsMade['decision_3'] && !this._decision3Locked) {
            return {
                id: 'decision_3',
                title: '🔮 真相抉择',
                description: '九姐告诉你荧河名字的真正来源。这个秘密可能改变一切。你要如何处理这个信息？',
                choices: [
                    { id: 'reveal_truth', text: '📢 公开真相', effect: '全势力大幅波动, moral+10',
                      hint: '让所有人知道荧河的真相' },
                    { id: 'hide_truth', text: '🤫 隐瞒真相', effect: '保持现状稳定, moral+5',
                      hint: '保护荧河的安宁' },
                    { id: 'exploit_truth', text: '🖤 利用真相', effect: 'gray+20, moral-15',
                      hint: '用秘密换取利益' }
                ]
            };
        }
        
        return null;
    }
    
    // ---- 做出决策 ----
    makeDecision(decisionId, choiceId) {
        if (this._decisionsMade[decisionId]) {
            return { success: false, message: '这个决策已经做出过了' };
        }
        
        this._decisionsMade[decisionId] = true;
        
        const effects = {
            // 决策1效果
            'decision_1': {
                'support_merchant': () => {
                    window.GAME_STATE.factionSatisfaction.merchant += 15;
                    window.GAME_STATE.factionSatisfaction.miner -= 5;
                    window.GAME_STATE.factionSatisfaction.governor -= 5;
                    window.GAME_STATE.player.moral -= 5;
                    return '你选择了支持商会联盟。陈老板很高兴，但矿工和总督府对你的好感下降了。';
                },
                'support_miner': () => {
                    window.GAME_STATE.factionSatisfaction.miner += 15;
                    window.GAME_STATE.factionSatisfaction.merchant -= 5;
                    window.GAME_STATE.factionSatisfaction.governor -= 5;
                    window.GAME_STATE.player.moral += 5;
                    return '你选择了支持矿工联合会。老赵握着你的手说"这才是自己人"，但商会的态度冷淡了下来。';
                },
                'support_governor': () => {
                    window.GAME_STATE.factionSatisfaction.governor += 15;
                    window.GAME_STATE.factionSatisfaction.merchant -= 5;
                    window.GAME_STATE.factionSatisfaction.miner -= 5;
                    window.GAME_STATE.player.moral -= 3;
                    return '你选择了支持总督府。林远总督点头认可，但商人和矿工都觉得你偏心了。';
                },
                'stay_neutral': () => {
                    window.GAME_STATE.factionSatisfaction.merchant += 5;
                    window.GAME_STATE.factionSatisfaction.miner += 5;
                    window.GAME_STATE.factionSatisfaction.governor += 5;
                    window.GAME_STATE.player.moral += 3;
                    return '你选择保持中立，寻求三方共识。三方都对你表示了有限的认可。';
                }
            },
            // 决策2效果
            'decision_2': {
                'lower_tariff': () => {
                    window.GAME_STATE.factionSatisfaction.merchant += 10;
                    window.GAME_STATE.factionSatisfaction.governor -= 5;
                    return '你决定调降关税以救济商人。贸易成本降低，但总督府的财政压力增加了。';
                },
                'subsidy_miner': () => {
                    window.GAME_STATE.factionSatisfaction.miner += 10;
                    window.GAME_STATE.factionSatisfaction.governor -= 5;
                    return '你决定增加矿工补贴。矿工们的生活得到保障，但总督府需要削减其他开支。';
                },
                'tax_hard': () => {
                    window.GAME_STATE.factionSatisfaction.governor += 10;
                    window.GAME_STATE.factionSatisfaction.merchant -= 5;
                    window.GAME_STATE.factionSatisfaction.miner -= 5;
                    return '你决定加税以加强行政能力。总督府的管控加强了，但各方怨声载道。';
                }
            },
            // 决策3效果
            'decision_3': {
                'reveal_truth': () => {
                    window.GAME_STATE.factionSatisfaction.merchant += 20;
                    window.GAME_STATE.factionSatisfaction.miner += 20;
                    window.GAME_STATE.factionSatisfaction.governor -= 30;
                    window.GAME_STATE.player.moral += 10;
                    window.GAME_STATE.flags.truthRevealed = true;
                    return '你决定公开荧河的真相。这个消息在荧河引起了轩然大波，总督府的控制力大幅削弱。';
                },
                'hide_truth': () => {
                    window.GAME_STATE.player.moral += 5;
                    window.GAME_STATE.flags.truthHidden = true;
                    return '你决定隐瞒真相，保持荧河的现状稳定。有些秘密，或许永远不应该被知道。';
                },
                'exploit_truth': () => {
                    window.GAME_STATE.factionSatisfaction.merchant -= 15;
                    window.GAME_STATE.factionSatisfaction.miner -= 15;
                    window.GAME_STATE.factionSatisfaction.governor -= 15;
                    window.GAME_STATE.player.moral -= 15;
                    window.GAME_STATE.flags.truthExploited = true;
                    return '你决定利用这个秘密获取利益。你在灰色地带的地位大大提升，但你的灵魂似乎更黑暗了。';
                }
            }
        };
        
        const decisionEffects = effects[decisionId];
        if (!decisionEffects) {
            return { success: false, message: '未知的决策' };
        }
        
        const choiceEffect = decisionEffects[choiceId];
        if (!choiceEffect) {
            return { success: false, message: '未知的选项' };
        }
        
        const result = choiceEffect();
        
        // 记录决策
        this.keyDecisions.push({
            name: decisionId,
            choice: choiceId,
            consequence: result,
            time: Date.now()
        });
        
        // 添加剧情事件
        this.events.push({
            type: 'decision',
            description: result,
            time: Date.now()
        });
        
        // 确保满意度在有效范围内
        this._clampSatisfaction();
        
        return { success: true, message: result };
    }
    
    // ---- 确保满意度在0-100范围内 ----
    _clampSatisfaction() {
        const sat = window.GAME_STATE.factionSatisfaction;
        sat.merchant = Math.max(0, Math.min(100, sat.merchant));
        sat.miner = Math.max(0, Math.min(100, sat.miner));
        sat.governor = Math.max(0, Math.min(100, sat.governor));
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

        // 计算支持度
        const supportGovernor = this.keyDecisions.filter(d => 
            d.choice === 'support_governor' || d.choice === 'tax_hard'
        ).length;
        const supportMiners = this.keyDecisions.filter(d => 
            d.choice === 'support_miner' || d.choice === 'subsidy_miner'
        ).length;
        const supportMerchant = this.keyDecisions.filter(d => 
            d.choice === 'support_merchant' || d.choice === 'lower_tariff'
        ).length;
        const grayChoices = this.keyDecisions.filter(d => 
            d.choice === 'exploit_truth'
        ).length;

        // 平衡结局：三方满意度都>=40（降低门槛）
        if (sat.merchant >= 40 && sat.miner >= 40 && sat.governor >= 40 && !flags.secretActivated) {
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

        // 铁腕结局：支持总督最多且满意度>=50
        if (supportGovernor >= supportMiners && supportGovernor >= supportMerchant && sat.governor >= 50) {
            return {
                id: 'governor',
                title: '秩序的铁腕',
                description: '林远总督站稳了脚跟。荧河在他的铁腕治理下恢复了秩序——但矿工和商会的压抑情绪正在暗处积聚。\n\n总督府的控制力从未如此强大，也从未如此孤独。'
            };
        }

        // 商人结局：支持商人最多且满意度>=50
        if (supportMerchant >= supportMiners && sat.merchant >= 50) {
            return {
                id: 'merchant',
                title: '市场之手',
                description: '荧河成了巽风圈最自由的贸易港。关税大幅降低，贸易量创下新高。陈老板在庆功宴上举杯："生意就是生意。"\n\n但矿工的生活并没有太大改善，D层的不满在暗处蔓延。'
            };
        }

        // 矿工结局：支持矿工最多且满意度>=50
        if (supportMiners >= supportMerchant && sat.miner >= 50) {
            return {
                id: 'miner',
                title: '矿工的尊严',
                description: '矿石出口税大幅降低，矿工的工资和生活条件得到了改善。老赵在D层开了一瓶珍藏多年的酒："这才叫过日子。"\n\n但商会对荧河的投资开始撤出——资本永远流向利润最高的地方。'
            };
        }

        // 道德崩塌结局
        if (grayChoices >= 2 || moral <= 15) {
            return {
                id: 'gray',
                title: '腐烂的荧河',
                description: '暗市成了荧河的真正主人。九姐的"Last Port"酒吧生意兴隆，但B层的正规市场日渐萧条。没有人知道你收了多少黑钱，但每个人都能感觉到——荧河烂了。'
            };
        }

        // 什么也没做好的结局（默认）
        if (sat.merchant < 25 && sat.miner < 25 && sat.governor < 25) {
            return {
                id: 'collapse',
                title: '危机的深渊',
                description: '荧河的矛盾终于爆发了。三方互不相让，经济一路滑向深渊。联盟的召回令在邮路上——你的谈判官生涯，结束了。\n\n荧河还在运转，以它一贯的方式——混乱而顽强。'
            };
        }

        // 未完成结局：游戏进行到一定程度但未达到任何结局条件
        if (this.stage >= 8 && !flags.secretActivated && sat.merchant < 50 && sat.miner < 50 && sat.governor < 50) {
            return {
                id: 'unfinished',
                title: '未竟之事',
                description: '荧河的局势依然紧张。你已经尽力了，但三方矛盾的根源太深。你的任期结束了，联盟会派新的谈判官来。\n\n荧河的故事还会继续。'
            };
        }

        return null; // 还没到结局
    }

    // ---- 获取剧情摘要 ----
    getSummary() {
        const flags = window.GAME_STATE.flags;
        let progress = 0;
        if (flags.metGovernor) progress += 15;
        if (flags.talkedToMiner) progress += 15;
        if (flags.talkedToMerchant) progress += 15;
        if (flags.talkedToCaptain) progress += 10;
        if (flags.channelBroken) progress += 10;
        if (flags.channelFixed) progress += 10;
        if (flags.secretActivated) progress += 15;
        progress = Math.min(progress, 100);

        return {
            mainQuest: this.currentQuest || '探索荧河空间站，与各方势力对话',
            progress,
            stage: this.stage,
            eventCount: this.events.length,
            decisionCount: this.keyDecisions.length,
            recentEvents: this.events.slice(-3)
        };
    }
}

window.StorySystem = StorySystem;
