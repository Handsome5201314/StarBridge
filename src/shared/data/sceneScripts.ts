import type { SceneScript } from '../types/game'

export const shoppingMarketScript: SceneScript = {
  sceneId: 'shopping-market',
  levelId: 'shopping-market-basic-01',
  islandId: 'shopping_market',
  title: '购物小镇：买酸奶任务',
  description: '在低刺激超市场景里练习看清任务、询问、排队、结账和礼貌结束。',
  targetAgeBand: '7+',
  targetSkill: 'social_generalization',
  steps: [
    {
      id: 'prepare-list',
      title: '看购物清单',
      sceneText: '出发前，家长给出一张短清单：酸奶、苹果、纸巾。',
      prompt: '先确认今天要买什么。',
      expectedChoiceId: 'read-list',
      skillTag: 'shopping',
      visualFocus: '购物清单',
      choices: [
        {
          id: 'read-list',
          label: '看清单，说“我要找酸奶”。',
          feedback: '你先看任务，再开始行动。',
          npcReply: '很好，我们先去冷藏柜找酸奶。',
        },
        {
          id: 'ignore-list',
          label: '不看清单，直接往前走。',
          feedback: '先看清单会更容易找到目标。',
          npcReply: '我们停一下，再看看今天要买什么。',
        },
      ],
    },
    {
      id: 'find-item',
      title: '找到商品区域',
      sceneText: '货架上有牛奶、酸奶和果汁，包装颜色很像。',
      prompt: '选择和清单一致的商品。',
      expectedChoiceId: 'choose-yogurt',
      skillTag: 'shopping',
      visualFocus: '冷藏柜',
      choices: [
        {
          id: 'choose-yogurt',
          label: '选择酸奶。',
          feedback: '你把清单和货架对应起来了。',
          npcReply: '对，这就是清单上的酸奶。',
        },
        {
          id: 'choose-juice',
          label: '选择果汁。',
          feedback: '果汁也在旁边，但清单上写的是酸奶。',
          npcReply: '我们再对照一次清单。',
        },
      ],
    },
    {
      id: 'ask-staff',
      title: '询问工作人员',
      sceneText: '想找原味酸奶，但货架上只看到草莓味。',
      prompt: '用清楚、礼貌的句子向店员询问。',
      expectedChoiceId: 'ask-politely',
      skillTag: 'conversation_repair',
      visualFocus: '店员胸牌',
      choices: [
        {
          id: 'ask-politely',
          label: '说“你好，请问原味酸奶在哪里？”',
          feedback: '你先问候，再说清楚想找什么。',
          npcReply: '你好，原味酸奶在左边第二层。',
        },
        {
          id: 'walk-away',
          label: '不说话，直接离开。',
          feedback: '找不到时，可以向可靠工作人员求助。',
          npcReply: '我可以帮你找原味酸奶。',
        },
      ],
    },
    {
      id: 'checkout',
      title: '排队结账',
      sceneText: '前面还有一位顾客正在扫码付款。',
      prompt: '练习等待和轮到自己时的表达。',
      expectedChoiceId: 'wait-turn',
      skillTag: 'take_turns',
      visualFocus: '排队线',
      choices: [
        {
          id: 'wait-turn',
          label: '站在线后等待，轮到时说“我要结账”。',
          feedback: '你注意到顺序，并说出了结账需求。',
          npcReply: '轮到你了，请把商品放到台面上。',
        },
        {
          id: 'cut-line',
          label: '绕到前面，把商品放到台面上。',
          feedback: '超市里通常要按顺序排队。',
          npcReply: '请先站到队伍后面，等前一位顾客完成。',
        },
      ],
    },
    {
      id: 'polite-close',
      title: '礼貌结束',
      sceneText: '收银员把小票和酸奶递给你。',
      prompt: '结束互动时说一句合适的话。',
      expectedChoiceId: 'say-thanks',
      skillTag: 'use_polite_words',
      visualFocus: '小票和购物袋',
      choices: [
        {
          id: 'say-thanks',
          label: '说“谢谢，再见”。',
          feedback: '你用礼貌话语结束了这次互动。',
          npcReply: '不客气，欢迎下次再来。',
        },
        {
          id: 'silent-leave',
          label: '拿起东西就走。',
          feedback: '说谢谢能让结束更清楚，也更友好。',
          npcReply: '我们可以补一句谢谢。',
        },
      ],
    },
  ],
  roleCards: [
    {
      id: 'buyer',
      role: '小顾客',
      goal: '看清单、找商品、用清楚句子询问。',
      sampleLine: '你好，请问原味酸奶在哪里？',
    },
    {
      id: 'staff',
      role: '店员',
      goal: '提供简短、稳定、可预测的回应。',
      sampleLine: '在左边第二层，我可以带你看。',
    },
    {
      id: 'cashier',
      role: '收银员',
      goal: '帮助孩子练习排队、结账和礼貌结束。',
      sampleLine: '轮到你了，请把商品放到台面上。',
    },
  ],
  generalizationTask: {
    title: '真实超市：买一件清单商品',
    scenario: '选择家附近熟悉、声音不太嘈杂的真实超市或小卖部，只买一件低风险商品。',
    steps: [
      '出发前让孩子看一张 1 到 2 件商品的短清单。',
      '到店后先找区域，必要时向工作人员问一句固定句式。',
      '结账后用“谢谢”或点头完成结束互动。',
    ],
    parentTip: '重点是从游戏迁移到真实生活，不追求一次完成所有步骤；成人可以先示范，再逐步减少提示。',
  },
}

export const sceneScripts = [shoppingMarketScript]

export function getSceneScript(sceneId: string) {
  return sceneScripts.find((script) => script.sceneId === sceneId)
}
