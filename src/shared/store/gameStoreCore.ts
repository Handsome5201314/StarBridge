import { createContext, type Dispatch } from 'react'
import { getBadgeProgressAfterCompletion, getBadgeKey } from '../utils/rewards'
import { createRealLifeTask } from '../utils/practice'
import type { LevelResult, PlayerProgress, RealLifeTask } from '../types/game'

export const STORAGE_KEY = 'starbridge-demo-progress:v1'

export const initialProgress: PlayerProgress = {
  totalStars: 0,
  todayStars: 0,
  completedLevelIds: [],
  collectedCardIds: [],
  badgeProgress: {
    'brave-expression': 0,
    'emotion-helper': 0,
    'friendly-speech': 0,
    'help-lantern': 0,
    'market-helper': 0,
    'market-navigator': 0,
  },
  buddyGrowth: {
    stage: 1,
    exp: 0,
  },
  todaySkillTags: [],
  realLifeTasks: [],
}

export type GameAction =
  | { type: 'completeLevel'; result: LevelResult }
  | { type: 'collectCards'; cardIds: string[] }
  | { type: 'addStars'; count: number }
  | { type: 'updateBadgeProgress'; result: LevelResult }
  | { type: 'generateRealLifeTask'; result: LevelResult }
  | { type: 'completeRealLifeTask'; taskId: string }
  | { type: 'addBuddyExp'; exp: number }
  | { type: 'replaceProgress'; progress: PlayerProgress }
  | { type: 'resetDemoProgress' }

export type GameActions = {
  completeLevel(result: LevelResult): void
  collectCards(cardIds: string[]): void
  addStars(count: number): void
  updateBadgeProgress(result: LevelResult): void
  generateRealLifeTask(result: LevelResult): void
  completeRealLifeTask(taskId: string): void
  addBuddyExp(exp: number): void
  resetDemoProgress(): void
}

export type GameStore = {
  progress: PlayerProgress
  actions: GameActions
}

type LocalStorageReader = {
  getItem(key: string): string | null
}

export const GameStoreContext = createContext<GameStore | null>(null)

export function createActions(dispatch: Dispatch<GameAction>): GameActions {
  return {
    completeLevel(result) {
      dispatch({ type: 'completeLevel', result })
    },
    collectCards(cardIds) {
      dispatch({ type: 'collectCards', cardIds })
    },
    addStars(count) {
      dispatch({ type: 'addStars', count })
    },
    updateBadgeProgress(result) {
      dispatch({ type: 'updateBadgeProgress', result })
    },
    generateRealLifeTask(result) {
      dispatch({ type: 'generateRealLifeTask', result })
    },
    completeRealLifeTask(taskId) {
      dispatch({ type: 'completeRealLifeTask', taskId })
    },
    addBuddyExp(exp) {
      dispatch({ type: 'addBuddyExp', exp })
    },
    resetDemoProgress() {
      dispatch({ type: 'resetDemoProgress' })
    },
  }
}

export function gameReducer(state: PlayerProgress, action: GameAction): PlayerProgress {
  switch (action.type) {
    case 'completeLevel': {
      if (state.completedLevelIds.includes(action.result.levelId)) {
        return state
      }

      const withStars = addStarsToProgress(state, action.result.starsEarned)
      const withCards = collectCardsInProgress(withStars, action.result.cardsEarned)
      const withBadge = updateBadgeProgressInProgress(withCards, action.result)
      const withTask = generateRealLifeTaskInProgress(withBadge, action.result)

      return {
        ...withTask,
        completedLevelIds: [...withTask.completedLevelIds, action.result.levelId],
        todaySkillTags: Array.from(
          new Set([...withTask.todaySkillTags, ...action.result.skillTags]),
        ),
        buddyGrowth: addBuddyExpToGrowth(withTask.buddyGrowth, action.result.starsEarned * 2),
      }
    }
    case 'collectCards':
      return collectCardsInProgress(state, action.cardIds)
    case 'addStars':
      return addStarsToProgress(state, action.count)
    case 'updateBadgeProgress':
      return updateBadgeProgressInProgress(state, action.result)
    case 'generateRealLifeTask':
      return generateRealLifeTaskInProgress(state, action.result)
    case 'completeRealLifeTask':
      return completeRealLifeTaskInProgress(state, action.taskId)
    case 'addBuddyExp':
      return { ...state, buddyGrowth: addBuddyExpToGrowth(state.buddyGrowth, action.exp) }
    case 'replaceProgress':
      return normalizeProgress(action.progress)
    case 'resetDemoProgress':
      return initialProgress
  }
}

export function loadProgress(): PlayerProgress {
  const localStorage = getLocalStorageReader()

  if (!localStorage) {
    return initialProgress
  }

  try {
    const rawProgress = localStorage.getItem(STORAGE_KEY)
    if (!rawProgress) {
      return initialProgress
    }

    return normalizeProgress(JSON.parse(rawProgress))
  } catch {
    return initialProgress
  }
}

function getLocalStorageReader(): LocalStorageReader | null {
  const maybeBrowser = globalThis as typeof globalThis & {
    window?: { localStorage?: LocalStorageReader }
  }

  return maybeBrowser.window?.localStorage ?? null
}

export function normalizeProgress(progress: PlayerProgress): PlayerProgress {
  return {
    ...initialProgress,
    ...progress,
    completedLevelIds: Array.isArray(progress.completedLevelIds)
      ? progress.completedLevelIds
      : initialProgress.completedLevelIds,
    collectedCardIds: Array.isArray(progress.collectedCardIds)
      ? progress.collectedCardIds
      : initialProgress.collectedCardIds,
    badgeProgress: {
      ...initialProgress.badgeProgress,
      ...progress.badgeProgress,
    },
    buddyGrowth: {
      ...initialProgress.buddyGrowth,
      ...progress.buddyGrowth,
    },
    todaySkillTags: Array.isArray(progress.todaySkillTags)
      ? progress.todaySkillTags
      : initialProgress.todaySkillTags,
    realLifeTasks: Array.isArray(progress.realLifeTasks)
      ? progress.realLifeTasks
      : initialProgress.realLifeTasks,
  }
}

function addStarsToProgress(state: PlayerProgress, count: number): PlayerProgress {
  return {
    ...state,
    totalStars: state.totalStars + count,
    todayStars: state.todayStars + count,
  }
}

function collectCardsInProgress(state: PlayerProgress, cardIds: string[]): PlayerProgress {
  return {
    ...state,
    collectedCardIds: Array.from(new Set([...state.collectedCardIds, ...cardIds])),
  }
}

function updateBadgeProgressInProgress(
  state: PlayerProgress,
  result: LevelResult,
): PlayerProgress {
  const badgeKey = getBadgeKey(result.islandId)
  const currentProgress = state.badgeProgress[badgeKey] ?? 0

  return {
    ...state,
    badgeProgress: {
      ...state.badgeProgress,
      [badgeKey]: getBadgeProgressAfterCompletion(currentProgress, result.difficulty),
    },
  }
}

function generateRealLifeTaskInProgress(
  state: PlayerProgress,
  result: LevelResult,
): PlayerProgress {
  const task = createRealLifeTask(result)
  const exists = state.realLifeTasks.some((item) => item.id === task.id)

  if (exists) {
    return state
  }

  return {
    ...state,
    realLifeTasks: [task, ...state.realLifeTasks],
  }
}

function completeRealLifeTaskInProgress(
  state: PlayerProgress,
  taskId: string,
): PlayerProgress {
  const task = state.realLifeTasks.find((item) => item.id === taskId)

  if (!task || task.status === 'done') {
    return state
  }

  const completedTask: RealLifeTask = {
    ...task,
    status: 'done',
    completedAt: new Date().toISOString(),
  }

  return {
    ...state,
    buddyGrowth: addBuddyExpToGrowth(state.buddyGrowth, 8),
    realLifeTasks: state.realLifeTasks.map((item) =>
      item.id === taskId ? completedTask : item,
    ),
  }
}

function addBuddyExpToGrowth(
  growth: PlayerProgress['buddyGrowth'],
  exp: number,
): PlayerProgress['buddyGrowth'] {
  const nextExp = growth.exp + exp

  return {
    stage: Math.min(3, Math.floor(nextExp / 30) + 1),
    exp: nextExp,
  }
}
