import { cards } from '../../src/shared/data/cards'
import { islands } from '../../src/shared/data/islands'
import { levels } from '../../src/shared/data/levels'
import { gameReducer } from '../../src/shared/store/gameStoreCore'
import type { PlayerProgress } from '../../src/shared/types/game'
import { getFallbackParentAdvice } from '../../src/shared/utils/parentAdvice'
import { createLevelResult } from '../../src/shared/utils/rewards'
import type { FamilySessionRecord, StarBridgeRepository } from '../repositories/types'
import { HttpError } from './inviteService'

export function buildBootstrap(session: FamilySessionRecord) {
  return {
    child: session.child,
    islands,
    levels,
    cards,
    progress: session.progress,
  }
}

export async function completeLevelForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  levelId: string,
) {
  const alreadyCompleted = session.progress.completedLevelIds.includes(levelId)
  const result = createLevelResult(levelId)

  if (!result) {
    throw new HttpError(404, '没有找到这个关卡')
  }

  if (alreadyCompleted) {
    return { alreadyCompleted, progress: session.progress }
  }

  const nextProgress = gameReducer(session.progress, { type: 'completeLevel', result })
  const nextSession = await repository.saveProgress(session.id, nextProgress)
  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'level_completed',
    details: { levelId },
  })

  return { alreadyCompleted: false, progress: nextSession.progress }
}

export async function completeRealLifeTaskForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  taskId: string,
) {
  const task = session.progress.realLifeTasks.find((item) => item.id === taskId)

  if (!task) {
    throw new HttpError(404, '没有找到这个现实练习任务')
  }

  const alreadyCompleted = task.status === 'done'
  if (alreadyCompleted) {
    return { alreadyCompleted, progress: session.progress }
  }

  const nextProgress = gameReducer(session.progress, { type: 'completeRealLifeTask', taskId })
  const nextSession = await repository.saveProgress(session.id, nextProgress)
  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'real_life_task_completed',
    details: { taskId },
  })

  return { alreadyCompleted: false, progress: nextSession.progress }
}

export function createParentAdvice(progress: PlayerProgress) {
  return {
    source: 'fallback' as const,
    content: getFallbackParentAdvice(progress),
  }
}
