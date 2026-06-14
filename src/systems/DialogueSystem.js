// ============================================================
// 对话系统 - 连接 Coze Bot API（增强版）
// ============================================================

class DialogueSystem {
    constructor() {
        this.apiUrl = '';
        this.apiToken = '';
        this.conversationHistory = {};
        this.isProcessing = false;
        this.useFallback = true;
    }

    // ---- 发送对话消息 ----
    async sendMessage(npcId, playerMessage) {
        if (!this.conversationHistory[npcId]) {
            this.conversationHistory[npcId] = [];
        }

        this.conversationHistory[npcId].push({ role: 'user', content: playerMessage });

        let response;

        // 优先尝试 Coze 工作流
        const bridge = window.cozeBridge;
        if (bridge && bridge.isConnected) {
            const economyStatus = JSON.stringify(window.GAME_STATE.economyStatus);
            const satisfaction = JSON.stringify(window.GAME_STATE.factionSatisfaction);
            const intimacy = window.GAME_STATE.relationships?.getIntimacy(npcId) || 0;
            const recentHistory = this.conversationHistory[npcId].slice(-6);

            const result = await bridge.dialogue(npcId, playerMessage, economyStatus, intimacy, JSON.stringify(recentHistory));
            if (result) {
                response = result.reply;
                if (result.intimacy_change && window.GAME_STATE.relationships) {
                    window.GAME_STATE.relationships.changeIntimacy(npcId, result.intimacy_change);
                }
            }
        }

        // 回退到本地
        if (!response) {
            response = this.fallbackResponse(npcId, playerMessage);
        }

        this.conversationHistory[npcId].push({ role: 'assistant', content: response });
        
        // 对话结束后增加势力满意度
        this.applyDialogueFactionBonus(npcId);
        
        return response;
    }

    // ---- 对话增加势力满意度 ----
    applyDialogueFactionBonus(npcId) {
        const npc = NPC_DATA[npcId];
        if (!npc || !npc.faction) return;
        
        const factionMap = {
            merchant: 'merchant',
            governor: 'governor',
            miner: 'miner',
            neutral: null,
            gray: null,
            unknown: null
        };
        
        const faction = factionMap[npc.faction];
        if (faction && window.GAME_STATE.factionSatisfaction[faction] !== undefined) {
            window.GAME_STATE.factionSatisfaction[faction] = Math.min(
                100,
                window.GAME_STATE.factionSatisfaction[faction] + 2
            );
        }
    }

    // ---- 本地回退对话 ----
    fallbackResponse(npcId, playerMessage) {
        const npc = NPC_DATA[npcId];
        const intimacy = window.GAME_STATE.relationships?.getIntimacy(npcId) || 0;
        const flags = window.GAME_STATE.flags;
        const sat = window.GAME_STATE.factionSatisfaction;
        const stage = window.GAME_STATE.story?.stage || 0;

        const responses = this.getResponses(npc, intimacy, flags, sat, stage);
        const lowerMsg = playerMessage.toLowerCase();

        // 扩展关键词匹配
        if (lowerMsg.includes('价格') || lowerMsg.includes('物价') || lowerMsg.includes('涨价')) return responses.price;
        if (lowerMsg.includes('关税') || lowerMsg.includes('税收') || lowerMsg.includes('税') || lowerMsg.includes('税率')) return responses.tariff;
        if (lowerMsg.includes('罢工') || lowerMsg.includes('抗议')) return responses.strike;
        if (lowerMsg.includes('航道') || lowerMsg.includes('断裂') || lowerMsg.includes('通道')) return responses.channel;
        if (lowerMsg.includes('你好') || lowerMsg.includes('嗨') || lowerMsg.includes('hi') || lowerMsg.includes('在') || lowerMsg.includes('在吗')) return responses.greeting;
        if (lowerMsg.includes('帮忙') || lowerMsg.includes('任务') || lowerMsg.includes('做什么') || lowerMsg.includes('该做')) return responses.task;
        if (lowerMsg.includes('秘密') || lowerMsg.includes('九姐') || lowerMsg.includes('暗市') || lowerMsg.includes('灰色')) return responses.secret;
        if (lowerMsg.includes('谢') || lowerMsg.includes('再见') || lowerMsg.includes('拜拜') || lowerMsg.includes('走了')) return responses.farewell;
        if (lowerMsg.includes('故事') || lowerMsg.includes('历史') || lowerMsg.includes('来历')) return responses.story;
        if (lowerMsg.includes('联盟') || lowerMsg.includes('商会')) return responses.faction;
        if (lowerMsg.includes('空间站') || lowerMsg.includes('荧河') || lowerMsg.includes('站里')) return responses.station;
        if (lowerMsg.includes('生活') || lowerMsg.includes('日子') || lowerMsg.includes('工作')) return responses.life;
        if (lowerMsg.includes('怎么') || lowerMsg.includes('怎么办') || lowerMsg.includes('建议')) return responses.advice;
        if (lowerMsg.includes('满意') || lowerMsg.includes('好感') || lowerMsg.includes('信任')) return responses.intimacy;

        return responses.default;
    }

    getResponses(npc, intimacy, flags, sat, stage) {
        // 根据阶段调整语气
        const isEarlyStage = stage < 3;
        const isMidStage = stage >= 3 && stage < 6;
        const isLateStage = stage >= 6;

        const base = {
            greeting: isEarlyStage ? `你好，我是${npc.name}。很高兴认识你。` : `又见面了，有什么新情况？`,
            task: `荧河现在不太平，你最好先到处走走，了解一下情况。`,
            story: `荧河的历史很悠久...不过那都是很久以前的事了。`,
            faction: `各方势力在这里角力了半个世纪。`,
            station: `荧河空间站是巽风圈最重要的中转枢纽。`,
            life: `在这里生活不容易，但大家都在努力。`,
            advice: `多听听各方的声音，你会找到答案的。`,
            intimacy: `信任需要时间，慢慢来吧。`,
            price: `经济数据在中央大厅的全息屏上能看到。`,
            tariff: `关税政策一直是个敏感话题。`,
            strike: `现在还没到那个地步，但火药味已经够了。`,
            channel: `航道是荧河的生命线。`,
            secret: `有些事情不是随便能说的。`,
            farewell: `保重。`,
            default: `有什么想聊的？`
        };

        // 按势力微调
        const factionResponses = {
            merchant: {
                greeting: intimacy >= 3 ? '老朋友，今天又有新消息了。' : '欢迎来到交易大厅，荧河的血液在这里流动。',
                task: intimacy >= 3 ? '我这边有个内部消息...物价很快要动了。' : '多跑跑，多听听，自然就知道该做什么了。',
                price: `矿石${window.GAME_STATE.economyStatus.gdp}，食物在涨，科技产品居高不下。如果你想做买卖，现在是个好时机。`,
                tariff: '关税当然是越低越好！高关税扼杀贸易。我不怕告诉你，商会的利润被吃掉了一大块。',
                strike: '矿工的罢工是灾难！原材料的断供会导致整个贸易链断裂。',
                channel: flags.channelBroken ? '航道一断，进口物资价格飞涨！这才是真正的危机。' : '航道最近信号不太好，苏雷那老家伙比谁都在意。',
                secret: intimacy >= 4 ? '九姐那边...路子很野。如果你想去暗市，先取得矿工和总督的信任再说吧。' : '有些事，不方便说。',
                farewell: '生意就是生意。随时来找我。',
                default: intimacy >= 3 ? '你想知道什么，我尽量说。' : '说说看，有什么事。',
                story: isMidStage || isLateStage ? '荧河商会成立时，这里还是个荒凉的小站。我们一手把它建成了巽风圈的贸易心脏。' : '商会的历史嘛...说来话长。',
                faction: '商会联盟代表的是自由贸易的力量。没有我们，荧河什么都不是。',
                station: '中央贸易大厅是荧河的心脏，每天有数万吨物资在这里流转。',
                life: intimacy >= 3 ? '做贸易不容易啊...但比起矿工兄弟们，我们已经算好的了。' : '想了解商会？先从贸易大厅的全息屏开始吧。',
                advice: intimacy >= 3 ? '我给你个建议：降低关税，贸易活了，大家都有好处。' : '建议啊...多来聊聊，自然就知道了。',
                intimacy: intimacy >= 5 ? '我们已经是老朋友了，有什么需要尽管开口。' : '信任嘛...看你表现。'
            },
            governor: {
                greeting: intimacy >= 3 ? '你来了。正好有事跟你说。' : '荧河空间站欢迎你，谈判官。',
                task: intimacy >= 3 ? '我需要一个公正的人去处理一些麻烦。' : '先熟悉环境，我会告诉你怎么做的。',
                price: '物价稳定是民生根本。我看过数据了，还算可控。',
                tariff: '关税是财政的命脉。我知道矿工不满，但贸然减税会导致行政垮台。',
                strike: '我绝不希望看到罢工。那意味着我的工作失败了。',
                channel: flags.channelBroken ? '航道的断裂比表面看起来更复杂。苏雷船长有些话没说出口。' : '航道维护一直在进行，只是预算不够。',
                secret: intimacy >= 5 ? '你去过E层了吗？那里有些东西连我也不知道详情。' : '有些事情还是不知道为好。',
                farewell: '荧河的未来，就靠你了。',
                default: intimacy >= 3 ? '你说，我听着。' : '请简要说明来意。',
                story: isMidStage || isLateStage ? '林远家族三代治理荧河...这份责任，我不能辜负。' : '总督府的历史？很长。',
                faction: '总督府是荧河的秩序支柱。没有强力的行政管理，这里会变成什么样？',
                station: '荧河空间站由总督府统一管辖，这是联盟赋予我们的责任。',
                life: intimacy >= 3 ? '作为总督，我每天要处理无数事务。但看到荧河运转正常，一切都值得。' : '总督的工作很繁重，荧河的稳定离不开我们。',
                advice: intimacy >= 3 ? '你问建议？记住：平衡是关键。偏袒任何一方都会引发更大的危机。' : '建议嘛...先多了解情况再说。',
                intimacy: intimacy >= 5 ? '你已经证明了自己的能力，我很信任你。' : '信任需要时间。'
            },
            miner: {
                greeting: intimacy >= 3 ? '兄弟，又来窜门了？正好，刚开了壶热水。' : '有事说事，没事我还要下井。',
                task: intimacy >= 3 ? '我信任你。跟你说实话，兄弟们快撑不住了。' : '多看看矿工们的日子，你就知道该干什么了。',
                price: '矿石才卖这么点钱，转手商人翻一倍！这公平吗？',
                tariff: '出口关税15%！他娘的，我们挖出来的东西，凭什么被抽走这么多！',
                strike: intimacy >= 3 ? '如果条件再不改善，罢工只是时间问题。' : '哼，商人赚够了，我们连药都买不起。',
                channel: flags.channelBroken ? '航道断了，商人们急得跳脚。我们矿工倒是无所谓——反正本来就进口不了好东西。' : '航道好坏跟我们关系不大。',
                secret: intimacy >= 4 ? '暗市？听说过。那个九姐啊...不是一般人。' : '别问了。',
                farewell: '下井了。有事找你小梅姐。',
                default: intimacy >= 3 ? '有啥说啥，别整虚的。' : '直说吧。',
                story: isMidStage || isLateStage ? 'D层挖了五十年矿了...当年这里还是一片荒地，是我们一镐一镐刨出来的。' : '矿工的故事？全是血和汗。',
                faction: '矿工联合会是兄弟们抱团取暖的地方。商会和总督府都靠边站！',
                station: '荧河？那是商人和总督的荧河，跟我们矿工有啥关系？',
                life: intimacy >= 3 ? '你真想了解？去看看D层的宿舍，去看看兄弟们的手，你就知道了。' : '日子？凑合着过呗。',
                advice: intimacy >= 3 ? '告诉你实话：降低关税，减轻配额，兄弟们就能喘口气了。' : '建议？去看看矿工的生活，你就明白了。',
                intimacy: intimacy >= 5 ? '你小子不错，是自己人！' : '咱俩还没那么熟。'
            },
            gray: {
                greeting: intimacy >= 3 ? '呵，又来照顾生意了？' : '新面孔啊...你来错地方了吧？',
                task: intimacy >= 2 ? '我什么都有，只要你出得起价。' : '先证明你值得信任。',
                price: '官方价格？那是给老实人看的。我有更好的价。',
                tariff: '关税就是笑话。我可以帮你绕过去——当然，要付点代价。',
                strike: '罢工？有意思。混乱总是好生意。',
                channel: '航道断裂？那不是意外。',
                secret: intimacy >= 3 ? '荧河的名字来自一块石板。那不是人类的东西。' : '有些秘密...知道了就回不去了。',
                farewell: '随时欢迎回来喝茶~',
                default: '有话直说还是绕圈子？',
                story: isLateStage ? '你真的想知道荧河的来历？那可不是官方版本的故事...' : '故事？每个人都有秘密。',
                faction: '势力？在这里，只有买家和卖家。',
                station: 'E层是荧河的阴暗面...但有时候，阴暗面才是真相所在。',
                life: '在这里，每个人都有自己的活法。',
                advice: intimacy >= 3 ? '有时候，正道走不通，就得另辟蹊径。' : '建议？呵呵。',
                intimacy: intimacy >= 4 ? '你已经是自己人了。有些事，我可以告诉你。' : '信任？在这个地方，那可是奢侈品。'
            },
            neutral: {
                greeting: '嘿！好久不见！最近有什么新闻吗？',
                task: '荧河每天都在变化，消息比星币值钱。',
                price: '价格嘛...每天都在变。想赚钱就得盯着。',
                tariff: '关税这东西，有人受益就有人受害。',
                strike: '我听到风声了...这两边都有点过火。',
                channel: flags.channelBroken ? '我早就觉得航道不太对劲了。' : '航道是荧河的生命线。',
                secret: intimacy >= 4 ? '拿这张纸条去找九姐...提我的名字。' : '有些事情现在还不是时候。',
                farewell: '走了走了，下次聊！',
                default: '今天天气不错啊——虽然在太空站里没有天气。',
                story: '荧河的故事啊...版本太多了，你想要哪个？',
                faction: '各方都有自己的说法，我嘛，听听而已。',
                station: '荧河空间站，五十年了。从小站变成现在的枢纽，不容易。',
                life: '在荧河讨生活各有各的门道。',
                advice: '建议啊...多听多看，谨慎行事。',
                intimacy: '信任这东西，说不清道不明的。'
            },
            unknown: {
                greeting: '……',
                task: '你来了。你终归会来。',
                price: '价格是表象。本质在暗处。',
                tariff: '枷锁。',
                strike: '暴风雨前的寂静。',
                channel: '航道不是为了贸易而建的。它们在等待。',
                secret: '光之河的渡口...等你找到答案，你就会明白。',
                farewell: '我们还会再见。',
                default: '……时候未到。',
                story: '一切的开始……在光之河的另一端。',
                faction: '所有的分界，都是人设的。',
                station: '荧河……比你们知道的更古老。',
                life: '生与死，在这里没有区别。',
                advice: '答案就在你心里。',
                intimacy: '……'
            }
        };

        return factionResponses[npc.faction] || base;
    }

    // ---- 检查是否触发决策事件 ----
    checkDecisionEvent() {
        const story = window.GAME_STATE.story;
        if (!story) return null;
        return story.getAvailableDecision();
    }

    getHistory(npcId) {
        return this.conversationHistory[npcId] || [];
    }

    clearHistory(npcId) {
        this.conversationHistory[npcId] = [];
    }
}

window.DialogueSystem = DialogueSystem;
