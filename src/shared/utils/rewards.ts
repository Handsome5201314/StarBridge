import { getLevelById } from '../data/levels'
import type { Difficulty, IslandId, LevelResult } from '../types/game'

export function createLevelResult(levelId: string): LevelResult | null {
  const level = getLevelById(levelId)

  if (!level) {
    return null
  }

  return {
    levelId: level.id,
    islandId: level.islandId,
    difficulty: level.difficulty,
    starsEarned: level.rewardStars,
    cardsEarned: level.rewardCardIds,
    skillTags: [level.targetSkill],
    completedAt: new Date().toISOString(),
  }
}

export function getBadgeProgressAfterCompletion(
  previous: number,
  difficulty: Difficulty,
) {
  return Math.max(previous, getDifficultyStep(difficulty))
}

export function getBadgeKey(islandId: IslandId) {
  switch (islandId) {
    case 'sentence_blocks':
      return 'brave-expression'
    case 'emotion_match':
      return 'emotion-helper'
    case 'greeting_match':
      return 'friendly-speech'
    case 'help_valley':
      return 'help-lantern'
    case 'starlight_market':
      return 'market-helper'
    case 'shopping_market':
      return 'market-navigator'
  }
}

function getDifficultyStep(difficulty: Difficulty) {
  switch (difficulty) {
    case 'basic':
      return 1
    case 'medium':
      return 2
    case 'advanced':
      return 3
  }
}
