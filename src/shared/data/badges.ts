import type { BadgeConfig } from '../types/game'

export const badges: BadgeConfig[] = [
  {
    id: 'brave-expression',
    islandId: 'sentence_blocks',
    name: '勇敢表达徽章',
    description: '能主动表达需求、问候和请求帮助。',
    unlockText: '句子积木岛三档任务全部完成后解锁。',
  },
  {
    id: 'emotion-helper',
    islandId: 'emotion_match',
    name: '情绪识别徽章',
    description: '能识别常见情绪，并理解他人的感受。',
    unlockText: '情绪消消乐湖三档任务全部完成后解锁。',
  },
  {
    id: 'friendly-speech',
    islandId: 'greeting_match',
    name: '友好徽章',
    description: '能先观察发生了什么，再选择合适的友好话语。',
    unlockText: '完成问候岛的友好话语连连看后解锁。',
  },
  {
    id: 'help-lantern',
    islandId: 'help_valley',
    name: '求助灯徽',
    description: '遇到困难时，能停下来、找可靠的人，并清楚说出需要什么帮助。',
    unlockText: '完成求助山谷三档任务后解锁。',
  },
  {
    id: 'market-helper',
    islandId: 'starlight_market',
    name: '购物徽章',
    description: '能听懂购物任务，按物品、类别和生活情景选择合适商品。',
    unlockText: '完成星光超市三档购物任务后解锁。',
  },
  {
    id: 'market-navigator',
    islandId: 'shopping_market',
    name: '小小购物导航员',
    description: '能把游戏中的清单、询问、排队和礼貌结束迁移到真实购物场景。',
    unlockText: '完成购物小镇的超市场景任务后解锁。',
  },
]

export function getBadgeById(badgeId: string) {
  return badges.find((badge) => badge.id === badgeId)
}
