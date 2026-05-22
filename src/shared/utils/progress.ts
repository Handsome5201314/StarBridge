import { cards } from '../data/cards'
import { levels } from '../data/levels'
import type { PlayerProgress, SkillTag } from '../types/game'

export const skillLabels: Record<SkillTag, string> = {
  express_need: '主动表达需求',
  greeting: '友好打招呼',
  ask_help: '请求帮助',
  recognize_emotion: '识别情绪',
  understand_others: '理解他人感受',
  use_polite_words: '使用请和谢谢',
  take_turns: '轮流互动',
}

export const skillDescriptions: Record<SkillTag, string> = {
  express_need: '学会用语言、图卡或动作告诉别人自己的需要。',
  greeting: '能用合适方式开始一次轻松互动。',
  ask_help: '知道遇到困难时可以主动请求帮助。',
  recognize_emotion: '能把表情、词语和感受连接起来。',
  understand_others: '开始观察别人可能正在经历的情绪。',
  use_polite_words: '在真实互动里使用礼貌语建立良好关系。',
  take_turns: '理解等待和轮流，让互动更顺畅。',
}

export function getRecommendedLevel(progress: PlayerProgress) {
  return levels.find((level) => !progress.completedLevelIds.includes(level.id)) ?? levels[0]
}

export function getCompletedLevels(progress: PlayerProgress) {
  const completedIds = new Set(progress.completedLevelIds)
  return levels.filter((level) => completedIds.has(level.id))
}

export function getCollectedCards(progress: PlayerProgress) {
  const collectedIds = new Set(progress.collectedCardIds)
  return cards.filter((card) => collectedIds.has(card.id))
}
