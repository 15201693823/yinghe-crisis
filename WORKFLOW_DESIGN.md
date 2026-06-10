# 星贸纪元：荧河危机 - Coze工作流设计方案

## 工作流总览

游戏AI后端由 **1个Coze Bot + 3个Workflow** 组成：

```
玩家操作 → Phaser前端 → Coze Bot API → 路由到工作流
                                      ├── Workflow 1: NPC对话
                                      ├── Workflow 2: 决策卡生成  
                                      └── Workflow 3: 经济引擎
```

---

## Workflow 1: NPC对话生成

### 入口参数
| 参数 | 类型 | 说明 |
|------|------|------|
| npc_id | string | NPC标识符 |
| player_message | string | 玩家输入 |
| economy_state | string | JSON格式经济状态摘要 |
| intimacy | number | 亲密度0-10 |
| conversation_history | string | 最近3轮对话 |

### 工作流节点

```
[开始] 
  → [代码节点: 加载NPC人设] 从npc_id映射到预设prompt
  → [LLM节点: 生成回复] 
      system: NPC人设prompt + 经济状态注入
      user: conversation_history + player_message
      温度: 0.8（保持角色个性）
  → [代码节点: 提取态度信号] 解析回复中的立场关键词
  → [代码节点: 计算亲密度变化] 基于态度+话题匹配度
  → [结束] 返回: { reply, intimacy_change, attitude_signal }
```

### NPC人设模板（system prompt）

每个NPC有独立的system prompt，核心结构：

```
你是{NPC名}，{身份}。
性格：{性格描述}
立场：{立场描述}
利益：{核心利益列表}

当前经济状态：
- GDP: {gdp}，增长率: {gdp_growth}
- 通胀率: {inflation}
- 商品价格: {prices}
- 三方满意度: 商会{merchant}/矿工{miner}/总督{governor}
- 亲密度: {intimacy}/10

规则：
1. 根据亲密度调整说话态度（0-2冷漠，3-5正常，6-8信任，9-10推心置腹）
2. 回复中自然融入当前经济数据
3. 如果亲密度>=3，可以透露内部信息
4. 保持角色性格一致性，不要跳出角色
5. 回复控制在50-100字
```

---

## Workflow 2: 决策卡生成

### 入口参数
| 参数 | 类型 | 说明 |
|------|------|------|
| economy_state | string | JSON格式完整经济状态 |
| turn | number | 当前回合 |
| chapter | number | 当前章节 |
| active_flags | string | JSON格式事件标记 |
| recent_decisions | string | 最近2回合决策历史 |

### 工作流节点

```
[开始]
  → [代码节点: 经济诊断] 分析当前经济瓶颈
      - 找出满意度最低的势力
      - 找出价格偏离基准最大的商品
      - 判断通胀/GDP趋势
  → [LLM节点: 生成卡牌方案]
      system: 你是决策卡设计器，根据经济诊断生成1-2张决策卡
      输出格式约束: JSON { cards: [...] }
      温度: 1.0（保持多样性）
  → [代码节点: 校验数值] 
      - 效果值在-15到+15之间
      - 成本在0-60之间
      - 灰色卡必须有risk字段
  → [条件节点: 是否触发事件卡]
      条件: channelBroken || minerStrike || merchantBlockade
      是 → [代码节点: 生成事件卡] 附加1张事件卡
      否 → 跳过
  → [条件节点: 是否可出灰色卡]
      条件: blackMarketUnlocked && Math.random() < 0.3
      是 → [LLM节点: 生成灰色卡] 带risk和moralCost
      否 → 跳过
  → [结束] 返回: { cards: [...] }
```

### 决策卡JSON格式

```json
{
  "cards": [
    {
      "id": "unique_id",
      "name": "关税调整令",
      "rarity": "common|rare|gray",
      "description": "背景描述，引用当前经济数据",
      "effects": {
        "merchant_happy": -5,
        "miner_happy": 5,
        "gov_happy": 0,
        "gdp": -0.02,
        "inflation": -0.01
      },
      "prediction": "AI基于当前趋势的1-2句预测",
      "cost": 20,
      "risk": 0.3,
      "moralCost": -15
    }
  ]
}
```

---

## Workflow 3: 经济引擎（每回合执行）

### 入口参数
| 参数 | 类型 | 说明 |
|------|------|------|
| current_state | string | JSON格式完整经济快照 |
| decision_effects | string | 上回合决策效果 |
| player_trade_log | string | 玩家交易记录 |

### 工作流节点

```
[开始]
  → [代码节点: 供需更新]
      - 供给 = base × (1+生产变化) × (1-中断) × 劳动因子
      - 需求 = base × (1+人口增长) × (1+GDP增长) × 紧急度
  → [代码节点: 价格计算]
      P = P_base × (Supply/Demand) × (1+tariff) × (1+inflation) × eventModifier
  → [代码节点: GDP计算]
      GDP = Σ(交易量×价格) + 服务收入 - 补贴
  → [代码节点: 通胀计算]
      CPI = Σ(价格×权重); inflation = CPI_current/CPI_base - 1
  → [代码节点: 满意度更新]
      基于决策效果+经济指标变化
  → [代码节点: 事件检测]
      检查触发条件（满意度<20→罢工概率+30%等）
  → [代码节点: 章节推进]
      回合5→第2章，回合10→第3章
  → [结束] 返回: 完整经济快照
```

---

## Coze Bot 配置

### Bot基本信息
- 名称: 星贸纪元·荧河危机
- 描述: AI驱动的星际贸易决策RPG游戏引擎
- 模型: 推荐Doubao-pro（速度快）或GPT-4（质量高）

### Bot人设（全局）
```
你是《星贸纪元：荧河危机》的游戏AI引擎。
你的职责是：
1. 根据玩家输入路由到正确的工作流
2. 将工作流返回的数据格式化为前端可用的JSON

输入格式：
- type: "dialogue" | "card" | "economy"
- payload: 对应工作流的入口参数

输出格式：纯JSON，不带markdown代码块
```

### API调用方式
```
POST https://api.coze.cn/v3/chat
Headers:
  Authorization: Bearer {PAT_TOKEN}
  Content-Type: application/json

Body:
{
  "bot_id": "{BOT_ID}",
  "user_id": "player_001",
  "stream": false,
  "additional_messages": [{
    "role": "user",
    "content": "{\"type\":\"dialogue\",\"payload\":{\"npc_id\":\"chen_boss\",\"player_message\":\"你好\",\"economy_state\":\"...\",\"intimacy\":0}}",
    "content_type": "text"
  }]
}
```

---

## 前端对接代码

在 DialogueSystem.js 中填入：
- apiUrl: Coze Bot API地址
- apiToken: Coze PAT Token

配置位置: src/systems/DialogueSystem.js 第7-8行
