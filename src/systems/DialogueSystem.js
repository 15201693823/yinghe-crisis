// ============================================================
// 对话系统 - 连接 Coze Bot API（精简版）
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
        return response;
    }

    // ---- 本地回退对话 ----
    fallbackResponse(npcId, playerMessage) {
        const npc = NPC_DATA[npcId];
        const intimacy = window.GAME_STATE.relationships?.getIntimacy(npcId) || 0;
        const flags = window.GAME_STATE.flags;
        const sat = window.GAME_STATE.factionSatisfaction;

        const responses = this.getResponses(npc, intimacy, flags, sat);
        const lowerMsg = playerMessage.toLowerCase();

        if (lowerMsg.includes('价格') || lowerMsg.includes('物价')) return responses.price;
        if (lowerMsg.includes('关税') || lowerMsg.includes('税收') || lowerMsg.includes('税')) return responses.tariff;
        if (lowerMsg.includes('罢工')) return responses.strike;
        if (lowerMsg.includes('航道') || lowerMsg.includes('断裂')) return responses.channel;
        if (lowerMsg.includes('你好') || lowerMsg.includes('嗨') || lowerMsg.includes('hi')) return responses.greeting;
        if (lowerMsg.includes('帮忙') || lowerMsg.includes('任务') || lowerMsg.includes('做什么')) return responses.task;
        if (lowerMsg.includes('秘密') || lowerMsg.includes('九姐') || lowerMsg.includes('暗市')) return responses.secret;
        if (lowerMsg.includes('谢') || lowerMsg.includes('再见') || lowerMsg.includes('拜拜')) return responses.farewell;

        return responses.default;
    }

    getResponses(npc, intimacy, flags, sat) {
        const base = {
            greeting: `你好，我是${npc.name}。`,
            task: `荧河现在不太平，你最好先到处走走，了解一下情况。`,
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
                default: intimacy >= 3 ? '你想知道什么，我尽量说。' : '说说看，有什么事。'
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
                default: intimacy >= 3 ? '你说，我听着。' : '请简要说明来意。'
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
                default: intimacy >= 3 ? '有啥说啥，别整虚的。' : '直说吧。'
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
                default: '有话直说还是绕圈子？'
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
                default: '今天天气不错啊——虽然在太空站里没有天气。'
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
                default: '……时候未到。'
            }
        };

        return factionResponses[npc.faction] || base;
    }

    getHistory(npcId) {
        return this.conversationHistory[npcId] || [];
    }

    clearHistory(npcId) {
        this.conversationHistory[npcId] = [];
    }
}

window.DialogueSystem = DialogueSystem;