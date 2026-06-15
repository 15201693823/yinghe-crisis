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

        let response = null;
        this.lastUsedAI = false;

        // 优先尝试 Coze 工作流
        const bridge = window.cozeBridge;
        if (bridge && bridge.isConnected) {
            const economyStatus = JSON.stringify(window.GAME_STATE.economyStatus);
            const satisfaction = JSON.stringify(window.GAME_STATE.factionSatisfaction);
            const intimacy = window.GAME_STATE.relationships?.getIntimacy(npcId) || 0;
            const recentHistory = this.conversationHistory[npcId].slice(-6);

            try {
                const result = await bridge.dialogue(npcId, playerMessage, economyStatus, intimacy, JSON.stringify(recentHistory));
                if (result && result.reply && result.reply.trim().length > 0) {
                    response = result.reply;
                    this.lastUsedAI = true;
                    if (result.intimacy_change && window.GAME_STATE.relationships) {
                        window.GAME_STATE.relationships.changeIntimacy(npcId, result.intimacy_change);
                    }
                    console.log(`[Dialogue] ✅ AI回复 npc=${npcId}: "${response.substring(0, 30)}..."`);
                } else {
                    console.warn(`[Dialogue] ⚠️ AI返回空/null，回退本地对话 npc=${npcId}`);
                }
            } catch (e) {
                console.warn(`[Dialogue] ❌ AI调用异常，回退本地对话 npc=${npcId}:`, e.message);
            }
        }

        // 回退到本地（即使AI失败也保证有回复）
        if (!response) {
            response = this.fallbackResponse(npcId, playerMessage);
            if (!response || response.trim().length === 0) {
                // 终极保险：永远不返回空白
                const npc = NPC_DATA[npcId];
                response = `${npc?.name || 'NPC'}：……（思索片刻）\n\n${this.getSafeDefault(npcId)}`;
                console.error(`[Dialogue] ❌ 本地回复也为空，使用终极保险 npc=${npcId}`);
            } else {
                console.log(`[Dialogue] 📦 本地回复 npc=${npcId}: "${response.substring(0, 30)}..."`);
            }
        }

        this.conversationHistory[npcId].push({ role: 'assistant', content: response });
        
        // 对话结束后增加势力满意度
        this.applyDialogueFactionBonus(npcId);
        
        return response;
    }

    getSafeDefault(npcId) {
        const npc = NPC_DATA[npcId];
        if (!npc) return '我们改天再聊吧。';
        const defaults = {
            chen_boss: '生意上的事，等你准备好了再说。',
            ajie: '哎呀，你看我都走神了！回头再聊哈~',
            governor_lin: '作为总督，我每天要处理的事务太多。改日再议。',
            lao_zhao: '我得下井了，有事找小梅姐。',
            xiao_mei: '数据上还需要再核验，下次给你看完整报告。',
            captain_su: '航道上的事不是三言两语说得清的。',
            jiu_jie: '有些事，急不得~',
            mysterious: '……'
        };
        return defaults[npcId] || '我们改天再聊。';
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
        if (!npc) return null;
        const intimacy = window.GAME_STATE.relationships?.getIntimacy(npcId) || 0;
        const flags = window.GAME_STATE.flags;
        const sat = window.GAME_STATE.factionSatisfaction;
        const stage = window.GAME_STATE.story?.stage || 0;

        const responses = this.getResponses(npc, intimacy, flags, sat, stage);
        const lowerMsg = playerMessage.toLowerCase();

        // 工具：随机选一条
        const pick = (key) => {
            const arr = responses[key];
            if (!arr) return null;
            if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
            return arr;
        };

        // 扩展关键词匹配（顺序：先匹配更具体的）
        if (/\b(你好|您好|嗨|hi|hello|在吗|在么|在)\b/i.test(lowerMsg)) return pick('greeting');
        if (/(价格|物价|涨|跌|贵|便宜|多少钱|行情)/.test(lowerMsg)) return pick('price');
        if (/(关税|税收|税|税率|抽税|出口税)/.test(lowerMsg)) return pick('tariff');
        if (/(罢工|抗议|示威|闹事|暴动)/.test(lowerMsg)) return pick('strike');
        if (/(航道|航线|通道|航路|航行|船)/.test(lowerMsg)) return pick('channel');
        if (/(帮忙|任务|做什么|该做|如何|能帮)/.test(lowerMsg)) return pick('task');
        if (/(秘密|九姐|暗市|灰色|地下|石板|光之河)/.test(lowerMsg)) return pick('secret');
        if (/(故事|历史|来历|起源|以前|过去|建站)/.test(lowerMsg)) return pick('story');
        if (/(联盟|商会|商盟|联合)/.test(lowerMsg)) return pick('faction');
        if (/(空间站|荧河|站里|这里|地方)/.test(lowerMsg)) return pick('station');
        if (/(生活|日子|工作|辛苦|累|休息|家|家人)/.test(lowerMsg)) return pick('life');
        if (/(怎么|怎么办|建议|主意|方法|看法)/.test(lowerMsg)) return pick('advice');
        if (/(满意|好感|信任|朋友|关系|亲)/.test(lowerMsg)) return pick('intimacy');
        if (/(谢|再见|拜拜|走了|回去|晚安)/.test(lowerMsg)) return pick('farewell');
        if (/(矿|矿石|矿工|挖矿|井下)/.test(lowerMsg)) return pick('mining');
        if (/(总督|林远|府|官|行政|政府)/.test(lowerMsg)) return pick('governor');
        if (/(危险|怕|担心|害怕|安全)/.test(lowerMsg)) return pick('danger');
        if (/(什么|谁|哪里|为啥|为什么|怎么)/.test(lowerMsg)) return pick('default');
        if (/(啊|哦|嗯|哈|呵|嘿|呀)/.test(lowerMsg)) return pick('casual');

        return pick('default') || '……';
    }

    // 把字符串变成数组（兼容老数据）
    _arr(s) { return Array.isArray(s) ? s : [s]; }

    getResponses(npc, intimacy, flags, sat, stage) {
        const isEarlyStage = stage < 3;
        const isMidStage = stage >= 3 && stage < 6;
        const isLateStage = stage >= 6;
        const isHighIntimacy = intimacy >= 3;
        const isMaxIntimacy = intimacy >= 5;

        // 通用基础回复
        const base = {
            greeting: this._arr(`你好，我是${npc.name}。很高兴认识你。`),
            task: this._arr(`荧河现在不太平，你最好先到处走走，了解一下情况。`),
            story: this._arr(`荧河的历史很悠久...不过那都是很久以前的事了。`),
            faction: this._arr(`各方势力在这里角力了半个世纪。`),
            station: this._arr(`荧河空间站是巽风圈最重要的中转枢纽。`),
            life: this._arr(`在这里生活不容易，但大家都在努力。`),
            advice: this._arr(`多听听各方的声音，你会找到答案的。`),
            intimacy: this._arr(`信任需要时间，慢慢来吧。`),
            price: this._arr(`经济数据在中央大厅的全息屏上能看到。`),
            tariff: this._arr(`关税政策一直是个敏感话题。`),
            strike: this._arr(`现在还没到那个地步，但火药味已经够了。`),
            channel: this._arr(`航道是荧河的生命线。`),
            secret: this._arr(`有些事情不是随便能说的。`),
            mining: this._arr(`矿工们很辛苦。`),
            governor: this._arr(`总督府负责维持秩序。`),
            danger: this._arr(`荧河不太平，小心为上。`),
            casual: this._arr(`嗯，是啊。`),
            farewell: this._arr(`保重。`),
            default: this._arr(`有什么想聊的？`)
        };

        // 每个势力 10-15 条不同回复（按场景分类，每类多条候选）
        const factionResponses = {
            merchant: {
                greeting: isHighIntimacy ? this._arr(
                    '老朋友，今天又有新消息了。',
                    '又见面了，我刚想找你呢。',
                    '欢迎！来，坐，喝杯茶~'
                ) : this._arr(
                    '欢迎来到交易大厅，荧河的血液在这里流动。',
                    '新面孔？来来来，做生意的吗？',
                    '你好，我是陈守义，圈里人都叫我陈老板。'
                ),
                task: isHighIntimacy ? this._arr(
                    '我这边有个内部消息...物价很快要动了。',
                    '你去找阿杰问问，他消息比我灵。',
                    '最近商会有些动作...你先别声张。'
                ) : this._arr(
                    '多跑跑，多听听，自然就知道该做什么了。',
                    '先熟悉环境，再谈生意不迟。',
                    '去B层的全息屏看看行情吧。'
                ),
                price: this._arr(
                    `矿石${window.GAME_STATE.economyStatus.gdp}，食物在涨，科技产品居高不下。如果你想做买卖，现在是个好时机。`,
                    '现在物价有点乱。矿石比上个月涨了12%，燃料倒是降了。',
                    '想赚钱？盯紧矿工那边的动态，他们的产量直接影响矿石价格。',
                    '我在B层的全息屏上更新了最新行情。',
                    '你要是想买，建议趁早；要看涨了。'
                ),
                tariff: isHighIntimacy ? this._arr(
                    '关税当然是越低越好！高关税扼杀贸易。我不怕告诉你，商会的利润被吃掉了一大块。',
                    '你问税率？15%出口税是矿工的痛，也是我们商会的痛。',
                    '总督府定的税，我敢说一半都进了私人口袋。',
                    '实话告诉你：配额制度才是我们商会真正的财路。'
                ) : this._arr(
                    '关税这事啊，得从长计议。',
                    '税率高低都有人受益有人吃亏。',
                    '这是总督府定的，我不方便评价。'
                ),
                strike: isHighIntimacy ? this._arr(
                    '矿工的罢工是灾难！原材料的断供会导致整个贸易链断裂。',
                    '你要是能劝住老赵，我给你10%的折扣！',
                    '罢工三天，荧河要损失一千万星币。',
                    '我跟你说，老赵那帮人是被小梅怂恿的。'
                ) : this._arr(
                    '希望不会有那一天。',
                    '罢工对谁都没好处。'
                ),
                channel: flags.channelBroken ? this._arr(
                    '航道一断，进口物资价格飞涨！这才是真正的危机。',
                    '苏雷船长说航道最近信号很不正常...',
                    '我和苏雷是老交情了，航道的事他最清楚。',
                    '没有航道，商会就是无源之水。'
                ) : this._arr(
                    '航道最近信号不太好，苏雷那老家伙比谁都在意。',
                    '航道是荧河的生命线，希望别出事。',
                    '你找时间去C层看看苏雷，他知道的比我多。'
                ),
                secret: intimacy >= 4 ? this._arr(
                    '九姐那边...路子很野。如果你想去暗市，先取得矿工和总督的信任再说吧。',
                    '暗市在E层，但没通关文牒进不去。',
                    '168年铁锤李的事...别问。',
                    '我老婆是联盟航道局的人，有些事我不方便说。'
                ) : this._arr(
                    '有些事，不方便说。',
                    '你还不够格知道。'
                ),
                story: isMidStage || isLateStage ? this._arr(
                    '荧河商会成立时，这里还是个荒凉的小站。我们一手把它建成了巽风圈的贸易心脏。',
                    '我陈家三代在荧河做生意，最清楚这里的门道。',
                    '我父亲是商会初创会员之一...他要是看到今天这样，不知道会怎么想。'
                ) : this._arr(
                    '商会的历史嘛...说来话长。',
                    '你想听老故事？那得请我喝两杯。'
                ),
                faction: this._arr(
                    '商会联盟代表的是自由贸易的力量。没有我们，荧河什么都不是。',
                    '商会不只是商人，还有航运、保险、仓储...',
                    '没有配额制度，就没有今天的我。所以我说：配额是我的命根子。',
                    '联盟的核心圈？那是另一回事了。'
                ),
                station: this._arr(
                    '中央贸易大厅是荧河的心脏，每天有数万吨物资在这里流转。',
                    'B层只是冰山一角，A层是总督府，C层是港口，D层是矿区，E层是暗市。',
                    '你要是能把五个区都跑一遍，就知道荧河是怎么回事了。'
                ),
                life: isHighIntimacy ? this._arr(
                    '做贸易不容易啊...但比起矿工兄弟们，我们已经算好的了。',
                    '我老婆去年走了，现在一个人。',
                    '做生意就是这样，赚钱的时候开心，赔钱的时候想跳楼。'
                ) : this._arr(
                    '想了解商会？先从贸易大厅的全息屏开始吧。',
                    '生意人的生活啊，就那样。'
                ),
                advice: isHighIntimacy ? this._arr(
                    '我给你个建议：降低关税，贸易活了，大家都有好处。',
                    '别跟老赵硬刚，他不是不讲理的人。',
                    '找林远总督谈，他表面严肃但其实想解决问题。',
                    '实在不行就去找九姐，她路子野。'
                ) : this._arr(
                    '建议啊...多来聊聊，自然就知道了。',
                    '先去跑跑，看清楚再说。'
                ),
                intimacy: isMaxIntimacy ? this._arr(
                    '我们已经是老朋友了，有什么需要尽管开口。',
                    '你的事就是我的事。',
                    '说！要钱还是要人，我帮你摆平。'
                ) : this._arr(
                    '信任嘛...看你表现。',
                    '生意场上，没有永远的朋友。'
                ),
                mining: this._arr(
                    '老赵的矿工联合会？一群不知好歹的家伙。',
                    '矿工要是罢工，我们商会的货就断了。',
                    'D层是荧河的根，没有矿石我们卖什么？'
                ),
                governor: this._arr(
                    '林远总督啊，老狐狸一个。',
                    '总督府跟我们商会关系微妙...配额的事就是他批的。',
                    '你要是能跟林远谈成事，荧河就稳了。'
                ),
                danger: this._arr(
                    '荧河最近不太平，走路小心点。',
                    '我做生意这么多年，什么风浪没见过。',
                    '小心驶得万年船。'
                ),
                casual: this._arr('是啊是啊。', '可不是嘛。', '嗯嗯。'),
                farewell: this._arr(
                    '生意就是生意。随时来找我。',
                    '保重，下次再来喝茶。',
                    '下次进货记得找我，给你老客户价。'
                ),
                default: isHighIntimacy ? this._arr(
                    '你想知道什么，我尽量说。',
                    '问吧，知无不言。',
                    '你说，我听着呢。'
                ) : this._arr(
                    '说说看，有什么事。',
                    '请讲。',
                    '有什么想了解的？'
                )
            },
            governor: {
                greeting: isHighIntimacy ? this._arr(
                    '你来了。正好有事跟你说。',
                    '我等你很久了。',
                    '又见面了，谈判官。'
                ) : this._arr(
                    '荧河空间站欢迎你，谈判官。',
                    '我是林远，荧河空间站总督。',
                    '请坐。'
                ),
                task: isHighIntimacy ? this._arr(
                    '我需要一个公正的人去处理一些麻烦。',
                    '航道的异常信号...你得亲自去看看。',
                    '请你帮我在三方之间斡旋。',
                    '你先去跟阿杰聊聊，他消息灵通。'
                ) : this._arr(
                    '先熟悉环境，我会告诉你怎么做的。',
                    '按部就班地走。'
                ),
                price: this._arr(
                    '物价稳定是民生根本。我看过数据了，还算可控。',
                    '最近物价有点波动，但还在合理范围。',
                    '陈老板跟我说物价在涨，我会持续关注。'
                ),
                tariff: this._arr(
                    '关税是财政的命脉。我知道矿工不满，但贸然减税会导致行政垮台。',
                    '15%的出口税是经过多方博弈的结果。',
                    '减税说起来容易，但没有行政经费，谁来维持秩序？',
                    '你要是能让三方都满意，我立刻减税。'
                ),
                strike: this._arr(
                    '我绝不希望看到罢工。那意味着我的工作失败了。',
                    '老赵的诉求我听到了，但让步太多会让商会反弹。',
                    '罢工一天，荧河就损失一百万。',
                    '请你务必居中调停。'
                ),
                channel: flags.channelBroken ? this._arr(
                    '航道的断裂比表面看起来更复杂。苏雷船长有些话没说出口。',
                    '联盟航道局的报告有30%是错的，苏雷知道真相。',
                    '我去过断裂点...不像自然衰减。',
                    '你亲自去C层问苏雷。'
                ) : this._arr(
                    '航道维护一直在进行，只是预算不够。',
                    '航道的状态我最清楚。',
                    '苏雷最近跟我汇报过几次，信号有些波动。'
                ),
                secret: intimacy >= 5 ? this._arr(
                    '你去过E层了吗？那里有些东西连我也不知道详情。',
                    '联盟派你来不只是调解...这是政治任务。',
                    '我夫人死于联星历202年的冲突。从那以后我发誓不让冲突再升级。',
                    '石板的事...我听老一辈提过。'
                ) : this._arr(
                    '有些事情还是不知道为好。',
                    '这是机密。'
                ),
                story: isMidStage || isLateStage ? this._arr(
                    '林远家族三代治理荧河...这份责任，我不能辜负。',
                    '我父亲是联盟上将，他希望我接任但我从政。',
                    '我上任12年了...这是联盟总督的最长任期。'
                ) : this._arr(
                    '总督府的历史？很长。',
                    '改天再说。'
                ),
                faction: this._arr(
                    '总督府是荧河的秩序支柱。没有强力的行政管理，这里会变成什么样？',
                    '商会要钱，矿工要命，我只能...平衡。',
                    '你问我偏向谁？我偏向荧河。'
                ),
                station: this._arr(
                    '荧河空间站由总督府统一管辖，这是联盟赋予我们的责任。',
                    '128年的建站史，5任总督，我是第5任。',
                    '5,200人常住，每天过境数千。'
                ),
                life: isHighIntimacy ? this._arr(
                    '作为总督，我每天要处理无数事务。但看到荧河运转正常，一切都值得。',
                    '我夫人走的时候，我差点辞职。',
                    '你呢？家人还在联盟核心圈吗？'
                ) : this._arr(
                    '总督的工作很繁重，荧河的稳定离不开我们。',
                    '习惯了。'
                ),
                advice: isHighIntimacy ? this._arr(
                    '你问建议？记住：平衡是关键。偏袒任何一方都会引发更大的危机。',
                    '先跟三方都谈谈，再做判断。',
                    '注意阿杰，他可能不简单。',
                    '暗市的事先放一放，正事要紧。'
                ) : this._arr(
                    '建议嘛...先多了解情况再说。',
                    '谨慎。'
                ),
                intimacy: isMaxIntimacy ? this._arr(
                    '你已经证明了自己的能力，我很信任你。',
                    '联盟派你来是对的。',
                    '有什么需要我帮忙的，尽管开口。'
                ) : this._arr(
                    '信任需要时间。',
                    '我得观察你。'
                ),
                mining: this._arr(
                    '老赵的诉求不是没有道理。但财政不允许全面让步。',
                    'D层是荧河的命脉，矿工不能罢工。',
                    '小梅是个聪明人，你可以跟她聊聊。'
                ),
                danger: this._arr(
                    'A层有警卫保护，你放心。',
                    '最近是有点不太平。',
                    '小心为上。'
                ),
                casual: this._arr('嗯。', '是的。', '继续。'),
                farewell: this._arr(
                    '荧河的未来，就靠你了。',
                    '保重，谈判官。',
                    '改日再议。'
                ),
                default: isHighIntimacy ? this._arr(
                    '你说，我听着。',
                    '请讲。',
                    '什么事？'
                ) : this._arr(
                    '请简要说明来意。',
                    '讲。',
                    '请说。'
                )
            },
            miner: {
                greeting: isHighIntimacy ? this._arr(
                    '兄弟，又来窜门了？正好，刚开了壶热水。',
                    '又见面了，今天不下井？',
                    '来来来，喝口热的。'
                ) : this._arr(
                    '有事说事，没事我还要下井。',
                    '你是？',
                    '直说吧。'
                ),
                task: isHighIntimacy ? this._arr(
                    '我信任你。跟你说实话，兄弟们快撑不住了。',
                    '你去B层看看那些商人怎么花的！',
                    '小梅姐有数据，你问问她。',
                    '我师父"铁锤李"当年就是被商会打手打死的。'
                ) : this._arr(
                    '多看看矿工们的日子，你就知道该干什么了。',
                    '先下去看看D层。'
                ),
                price: this._arr(
                    '矿石才卖这么点钱，转手商人翻一倍！这公平吗？',
                    '你们看全息屏上那价格，那是给商人看的！',
                    '我们挖矿的，矿石卖100，到我们手里20。',
                    '物价涨了，我们的工资没涨。'
                ),
                tariff: isHighIntimacy ? this._arr(
                    '出口关税15%！他娘的，我们挖出来的东西，凭什么被抽走这么多！',
                    '15%就是从我们嘴里抢饭吃！',
                    '取消关税是第一步。第二步是配额改革。',
                    '总督府定的税，有一半进了私人口袋。'
                ) : this._arr(
                    '税太重了。',
                    '这个话题我不想多说。'
                ),
                strike: isHighIntimacy ? this._arr(
                    '如果条件再不改善，罢工只是时间问题。',
                    '兄弟们已经忍无可忍了。',
                    '不是我想罢工，是被逼的。',
                    '小梅说先谈，谈不拢再罢工。'
                ) : this._arr(
                    '哼，商人赚够了，我们连药都买不起。',
                    '走一步看一步。'
                ),
                channel: flags.channelBroken ? this._arr(
                    '航道断了，商人们急得跳脚。我们矿工倒是无所谓——反正本来就进口不了好东西。',
                    '航道好不好跟我们关系不大，我们的产品不走主航道。',
                    '苏雷那老家伙挺有意思，但他管的是商人的事。'
                ) : this._arr(
                    '航道好坏跟我们关系不大。',
                    '那是商人和船长的事。'
                ),
                secret: intimacy >= 4 ? this._arr(
                    '暗市？听说过。那个九姐啊...不是一般人。',
                    '我师父的死，商会脱不了干系。',
                    '我大儿子16岁已经下井了，我对不起他。',
                    '小梅其实可以留在联盟的，她是为我们才回来的。'
                ) : this._arr(
                    '别问了。',
                    '少打听。'
                ),
                story: isMidStage || isLateStage ? this._arr(
                    'D层挖了五十年矿了...当年这里还是一片荒地，是我们一镐一镐刨出来的。',
                    '我爷爷是第一批矿工，我爹是第二代，我是第三代。',
                    '联星历168年铁锤李的事...我亲眼见过。'
                ) : this._arr(
                    '矿工的故事？全是血和汗。',
                    '改天再说。'
                ),
                faction: this._arr(
                    '矿工联合会是兄弟们抱团取暖的地方。商会和总督府都靠边站！',
                    '联合会不是我一个人的，是大家伙的。',
                    '我们只相信一起下井的兄弟。'
                ),
                station: this._arr(
                    '荧河？那是商人和总督的荧河，跟我们矿工有啥关系？',
                    'D层才是我的家。',
                    'C层的港口我去过，没什么好看的。'
                ),
                life: isHighIntimacy ? this._arr(
                    '你真想了解？去看看D层的宿舍，去看看兄弟们的手，你就知道了。',
                    '我老婆在D层医疗站做护士，比我还累。',
                    '孩子小的时候我一个月才见一次。',
                    '矿工的日子，不是人过的。'
                ) : this._arr(
                    '日子？凑合着过呗。',
                    '能活着就不错了。'
                ),
                advice: isHighIntimacy ? this._arr(
                    '告诉你实话：降低关税，减轻配额，兄弟们就能喘口气了。',
                    '你要是能帮我们跟陈老板谈，我请你喝酒。',
                    '小梅比我能说，你找她。',
                    '总督府的话，听三分就够了。'
                ) : this._arr(
                    '建议？去看看矿工的生活，你就明白了。',
                    '少问多做。'
                ),
                intimacy: isMaxIntimacy ? this._arr(
                    '你小子不错，是自己人！',
                    '有事儿你说话！',
                    '下次来家里吃饭，我老婆做的菜不错。'
                ) : this._arr(
                    '咱俩还没那么熟。',
                    '我凭什么信你？'
                ),
                mining: this._arr(
                    'D层的矿工兄弟们才是最实在的。',
                    '矿石是我们一镐一镐刨出来的。',
                    '小梅比我懂经济，你问她。'
                ),
                governor: this._arr(
                    '林远那老狐狸，哼。',
                    '总督府说要减税，三年了还是15%。',
                    '总督府的话，不能全信。'
                ),
                danger: this._arr(
                    'D层不太平，小心井下的毒气。',
                    '别去C层，那里的人看我们像看乞丐。',
                    '小心。'
                ),
                casual: this._arr('嗯。', '哦。', '是啊。'),
                farewell: this._arr(
                    '下井了。有事找你小梅姐。',
                    '保重。',
                    '下次再聊。'
                ),
                default: isHighIntimacy ? this._arr(
                    '有啥说啥，别整虚的。',
                    '直说。',
                    '你讲。'
                ) : this._arr(
                    '直说吧。',
                    '讲。',
                    '说。'
                )
            },
            gray: {
                greeting: isHighIntimacy ? this._arr(
                    '呵，又来照顾生意了？',
                    '贵客来了~',
                    '坐嘛，喝杯茶~'
                ) : this._arr(
                    '新面孔啊...你来错地方了吧？',
                    '你找谁？',
                    '这里是E层，没事别瞎逛。'
                ),
                task: intimacy >= 2 ? this._arr(
                    '我什么都有，只要你出得起价。',
                    '你想要什么？情报？货物？还是...别的？',
                    '谈生意找我准没错。'
                ) : this._arr(
                    '先证明你值得信任。',
                    '你还不够格。'
                ),
                price: this._arr(
                    '官方价格？那是给老实人看的。我有更好的价。',
                    '我这儿的价格嘛...你懂的。',
                    '想要便宜？找错人了。我这儿是另一个价格体系。',
                    '全息屏上的价格，跟我有什么关系~'
                ),
                tariff: this._arr(
                    '关税就是笑话。我可以帮你绕过去——当然，要付点代价。',
                    '你问税？我可以让你一分税都不用交~',
                    '走私嘛，是门艺术。',
                    '总督府的税，有一半我帮你避了。'
                ),
                strike: this._arr(
                    '罢工？有意思。混乱总是好生意。',
                    '罢工好啊，矿工们需要的物资，我可以提供~',
                    '越乱，我越赚钱。'
                ),
                channel: this._arr(
                    '航道断裂？那不是意外。',
                    '你注意到没？每次航道断裂前24小时，信号会脉冲。',
                    '苏雷知道一些事，他不说。',
                    '航道不是给人走的。它们在等待。'
                ),
                secret: intimacy >= 3 ? this._arr(
                    '荧河的名字来自一块石板。那不是人类的东西。',
                    '你见过"光之河"吗？我见过。',
                    '九姐我不是一个人，我背后有人。',
                    '总督府不知道的，我知道。',
                    '去找那个神秘客...但要小心。'
                ) : this._arr(
                    '有些秘密...知道了就回不去了。',
                    '你确定要听？'
                ),
                story: isLateStage ? this._arr(
                    '你真的想知道荧河的来历？那可不是官方版本的故事...',
                    '石板上的字，至今没人能翻译。',
                    '128年前建站的人在节点附近发现了它。',
                    '那块石板...不是人类的工艺。'
                ) : this._arr(
                    '故事？每个人都有秘密。',
                    '改天再聊。'
                ),
                faction: this._arr(
                    '势力？在这里，只有买家和卖家。',
                    '商会也好总督府也好，我跟他们做生意，不站队。',
                    '我谁的账都不买，谁的钱都赚。'
                ),
                station: this._arr(
                    'E层是荧河的阴暗面...但有时候，阴暗面才是真相所在。',
                    '你在A层是客人，在E层是...？',
                    'E层是法外之地，荧河的另一面。'
                ),
                life: this._arr(
                    '在这里，每个人都有自己的活法。',
                    '我？我不告诉你~',
                    '暗市的人都不谈自己。'
                ),
                advice: isHighIntimacy ? this._arr(
                    '有时候，正道走不通，就得另辟蹊径。',
                    '找总督府没用的事，可以找我~',
                    '你要是想查航道的事，去找苏雷，他知道的比说的多。',
                    '小心那个神秘客...或者说，小心你自己。'
                ) : this._arr(
                    '建议？呵呵。',
                    '你还不够格听我的建议。'
                ),
                intimacy: intimacy >= 4 ? this._arr(
                    '你已经是自己人了。有些事，我可以告诉你。',
                    '好，你跟我还有点缘分~',
                    '你的事就是我的事，亲爱的~'
                ) : this._arr(
                    '信任？在这个地方，那可是奢侈品。',
                    '先交钱。'
                ),
                mining: this._arr(
                    '矿工们需要什么我都清楚~',
                    '老赵那边，我有渠道。',
                    'D层的事我比你清楚。'
                ),
                governor: this._arr(
                    '林远？他老婆死在我知道之前...',
                    '总督府跟我做生意，不查我~',
                    '官面上说的话，你懂的。'
                ),
                danger: this._arr(
                    'E层很危险，但有我在就安全~',
                    '小心其他暗市的生意人...他们可不像我这么好说话。',
                    '别单独在E层乱走。'
                ),
                casual: this._arr('嗯~', '是啊~', '呵~', '有趣~'),
                farewell: this._arr(
                    '随时欢迎回来喝茶~',
                    '下次来~',
                    '改天见，亲爱的~'
                ),
                default: isHighIntimacy ? this._arr(
                    '有话直说还是绕圈子？',
                    '说吧，我听着~',
                    '你讲~'
                ) : this._arr(
                    '有话快说。',
                    '没空。',
                    '？'
                )
            },
            neutral: {
                greeting: this._arr(
                    '嘿！好久不见！最近有什么新闻吗？',
                    '嗨！来啦~',
                    '你好你好！'
                ),
                task: this._arr(
                    '荧河每天都在变化，消息比星币值钱。',
                    '你想知道什么我都告诉你！',
                    '问我啊，我什么都知道。'
                ),
                price: this._arr(
                    '价格嘛...每天都在变。想赚钱就得盯着。',
                    '我跟你说，矿石最近在涨！',
                    '燃料跌了，你知道吗？',
                    '全息屏上的数据，看一半信一半。',
                    '我刚听说，食物价格要动。'
                ),
                tariff: this._arr(
                    '关税这东西，有人受益就有人受害。',
                    '我反正不关心，谁当权我就跟谁做生意。',
                    '老赵和陈老板天天为这个吵。',
                    '你想听哪一边的版本？'
                ),
                strike: this._arr(
                    '我听到风声了...这两边都有点过火。',
                    '罢工这事啊，三天两头就有人提。',
                    '老赵那边有动静了，你小心点。',
                    '小梅姐昨天跟我说，矿工们快撑不住了。'
                ),
                channel: flags.channelBroken ? this._arr(
                    '我早就觉得航道不太对劲了。',
                    '苏雷说信号有问题，他没说具体什么问题。',
                    '你去找苏雷，他比我清楚。'
                ) : this._arr(
                    '航道是荧河的生命线。',
                    '最近信号有些奇怪。',
                    '我听说苏雷最近心事重重的。'
                ),
                secret: intimacy >= 4 ? this._arr(
                    '拿这张纸条去找九姐...提我的名字。',
                    '其实我有点背景，但我不方便说。',
                    '你想查的事...有个人比我清楚。',
                    '九姐那边，认我的面子。'
                ) : this._arr(
                    '有些事情现在还不是时候。',
                    '等你跟我再熟点再说。'
                ),
                story: this._arr(
                    '荧河的故事啊...版本太多了，你想要哪个？',
                    '官方版本：128年前建站，5任总督。',
                    '民间版本：那石板不是人放的。',
                    '你想听哪个？'
                ),
                faction: this._arr(
                    '各方都有自己的说法，我嘛，听听而已。',
                    '商会、矿工、总督，我都不站。',
                    '我就是个卖东西的，谁给钱我就给谁办事。'
                ),
                station: this._arr(
                    '荧河空间站，五十年了。从小站变成现在的枢纽，不容易。',
                    'B层是中央，C层是港口，D层是矿区，E层是暗市，A层是总督府。',
                    '我在B层卖东西，南来北往的消息都在这里。'
                ),
                life: this._arr(
                    '在荧河讨生活各有各的门道。',
                    '我嘛，就喜欢卖东西聊天，简单。',
                    '你呢？在核心圈有家人吗？'
                ),
                advice: this._arr(
                    '建议啊...多听多看，谨慎行事。',
                    '先去跑一圈，把五个区都熟悉。',
                    '找阿杰聊天，他认识所有人。',
                    '别轻易站队，看清楚再说。'
                ),
                intimacy: this._arr(
                    '信任这东西，说不清道不明的。',
                    '咱们是朋友啦！',
                    '你人不错，我喜欢跟你聊天。'
                ),
                mining: this._arr(
                    '老赵是条汉子，就是脾气爆。',
                    '小梅比他聪明，你找她聊聊。',
                    'D层啊，我去过一次，灰尘太大。'
                ),
                governor: this._arr(
                    '林远总督？挺严肃的一个人。',
                    '总督府管的事可多了。',
                    'A层我没去过，听说很庄严。'
                ),
                danger: this._arr(
                    '小心点，最近确实有点乱。',
                    '别一个人走E层。',
                    '你小心~'
                ),
                casual: this._arr('是啊~', '没错！', '我也这么觉得！', '哈！'),
                farewell: this._arr(
                    '走了走了，下次聊！',
                    '拜拜~',
                    '下次再来啊~'
                ),
                default: this._arr(
                    '今天天气不错啊——虽然在太空站里没有天气。',
                    '说啊说啊，我听着~',
                    '你想聊什么？',
                    '随便聊聊？',
                    '来来来，坐下~'
                )
            },
            unknown: {
                greeting: this._arr('……', '你来了。', '……嗯。'),
                task: this._arr(
                    '你来了。你终归会来。',
                    '走。',
                    '……'
                ),
                price: this._arr('价格是表象。本质在暗处。', '……'),
                tariff: this._arr('枷锁。', '……'),
                strike: this._arr('暴风雨前的寂静。', '……'),
                channel: this._arr(
                    '航道不是为了贸易而建的。它们在等待。',
                    '……信号……',
                    '航道的尽头不是空间。'
                ),
                secret: this._arr(
                    '光之河的渡口...等你找到答案，你就会明白。',
                    '……石板……',
                    '我们都在等待。'
                ),
                story: this._arr(
                    '一切的开始……在光之河的另一端。',
                    '……',
                    '……时间……不重要。'
                ),
                faction: this._arr('所有的分界，都是人设的。', '……'),
                station: this._arr('荧河……比你们知道的更古老。', '……'),
                life: this._arr('生与死，在这里没有区别。', '……'),
                advice: this._arr('答案就在你心里。', '……'),
                intimacy: this._arr('……', '……嗯。', '我们……会再见的。'),
                mining: this._arr('矿……在深处。', '……'),
                governor: this._arr('秩序……是幻象。', '……'),
                danger: this._arr('……小心。', '……'),
                casual: this._arr('……', '……嗯。'),
                farewell: this._arr('我们还会再见。', '……'),
                default: this._arr('……时候未到。', '……', '……嗯。')
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
