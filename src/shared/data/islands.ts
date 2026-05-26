import { levels } from './levels'
import type { IslandConfig } from '../types/game'

export const islands: IslandConfig[] = [
  {
    id: 'sentence_blocks',
    name: '句子积木岛',
    description: '用词语积木拼出自己的想法',
    route: '/level/sentence-basic-01',
    badgeId: 'brave-expression',
    themeSkill: 'express_need',
    levels: levels.filter((level) => level.islandId === 'sentence_blocks'),
  },
  {
    id: 'emotion_match',
    name: '情绪消消乐湖',
    description: '认识开心、难过、生气和平静',
    route: '/level/emotion-basic-01',
    badgeId: 'emotion-helper',
    themeSkill: 'recognize_emotion',
    levels: levels.filter((level) => level.islandId === 'emotion_match'),
  },
  {
    id: 'greeting_match',
    name: '问候岛',
    description: '看看场景，连到合适的友好话语',
    route: '/level/greeting-basic-01',
    badgeId: 'friendly-speech',
    themeSkill: 'greeting',
    levels: levels.filter((level) => level.islandId === 'greeting_match'),
  },
  {
    id: 'help_valley',
    name: '求助山谷',
    description: '看见困难，找到可靠的人，清楚说出需要的帮助',
    route: '/level/help-basic-01',
    badgeId: 'help-lantern',
    themeSkill: 'ask_help',
    levels: levels.filter((level) => level.islandId === 'help_valley'),
  },
  {
    id: 'starlight_market',
    name: '星光超市',
    description: '根据任务选择合适商品，拖进购物车',
    route: '/level/market-basic-01',
    badgeId: 'market-helper',
    themeSkill: 'daily_life_choice',
    levels: levels.filter((level) => level.islandId === 'starlight_market'),
  },
  {
    id: 'shopping_market',
    name: '购物小镇',
    description: '在超市场景里练习清单、询问、排队、结账和礼貌结束',
    route: '/level/shopping-market-basic-01',
    badgeId: 'market-navigator',
    themeSkill: 'social_generalization',
    levels: levels.filter((level) => level.islandId === 'shopping_market'),
  },
]

export function getIslandById(islandId: IslandConfig['id']) {
  return islands.find((island) => island.id === islandId)
}
