import { getSceneScript } from '../../src/shared/data/sceneScripts'
import { gameReducer } from '../../src/shared/store/gameStoreCore'
import type { PromptLevel, SkillTag } from '../../src/shared/types/game'
import { createLevelResult } from '../../src/shared/utils/rewards'
import type { FamilySessionRecord, StarBridgeRepository } from '../repositories/types'
import { HttpError } from './inviteService'

export async function startSceneForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  sceneId: string,
  payload: unknown,
) {
  const script = getRequiredSceneScript(sceneId)
  const input = parseSceneStart(payload, script.targetSkill)
  const firstStep = script.steps[0]

  if (!firstStep) {
    throw new HttpError(500, '场景脚本缺少步骤')
  }

  const attempt = await repository.createSceneAttempt(session.id, {
    sceneId: script.sceneId,
    levelId: script.levelId,
    promptLevel: input.promptLevel,
    targetSkill: input.targetSkill,
    firstStepId: firstStep.id,
  })

  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'scene_started',
    details: {
      sceneId: script.sceneId,
      attemptId: attempt.id,
      promptLevel: input.promptLevel,
      targetSkill: input.targetSkill,
    },
  })

  return {
    attemptId: attempt.id,
    attempt,
    script,
    nextStep: firstStep,
  }
}

export async function respondToSceneStepForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  sceneId: string,
  stepId: string,
  payload: unknown,
) {
  const script = getRequiredSceneScript(sceneId)
  const input = parseSceneResponse(payload)
  const attempt = await repository.findSceneAttempt(session.id, input.attemptId)

  if (!attempt || attempt.sceneId !== script.sceneId) {
    throw new HttpError(404, '没有找到这次场景练习')
  }

  if (attempt.status === 'completed') {
    return {
      accepted: true,
      completed: true,
      attempt,
      step: null,
      nextStep: null,
      progress: session.progress,
    }
  }

  const step = script.steps.find((item) => item.id === stepId)
  if (!step) {
    throw new HttpError(404, '没有找到这个场景步骤')
  }

  if (attempt.currentStepId !== step.id) {
    throw new HttpError(409, '请先完成当前场景步骤')
  }

  const accepted = input.choiceId === step.expectedChoiceId
  await repository.appendSceneStepEvent(session.id, {
    attemptId: attempt.id,
    stepId: step.id,
    choiceId: input.choiceId,
    accepted,
    createdAt: repository.now().toISOString(),
  })

  if (!accepted) {
    await repository.appendBehaviorEvent({
      sessionId: session.id,
      eventType: 'scene_step_retry',
      details: { sceneId: script.sceneId, attemptId: attempt.id, stepId: step.id },
    })
    return {
      accepted,
      completed: false,
      attempt,
      step,
      nextStep: step,
      progress: session.progress,
    }
  }

  const completedStepIds = Array.from(new Set([...attempt.completedStepIds, step.id]))
  const nextStep = script.steps.find((item) => !completedStepIds.includes(item.id)) ?? null
  const completed = !nextStep
  const nextAttempt = await repository.saveSceneAttempt(session.id, {
    ...attempt,
    completedStepIds,
    currentStepId: nextStep?.id ?? step.id,
    status: completed ? 'completed' : 'active',
    completedAt: completed ? repository.now().toISOString() : undefined,
  })
  let progress = session.progress

  if (completed) {
    const result = createLevelResult(script.levelId)
    if (!result) {
      throw new HttpError(500, '场景奖励配置缺失')
    }
    const nextProgress = gameReducer(session.progress, { type: 'completeLevel', result })
    const nextSession = await repository.saveProgress(session.id, nextProgress)
    progress = nextSession.progress
    await repository.appendBehaviorEvent({
      sessionId: session.id,
      eventType: 'scene_completed',
      details: { sceneId: script.sceneId, attemptId: attempt.id, levelId: script.levelId },
    })
  }

  return {
    accepted,
    completed,
    attempt: nextAttempt,
    step,
    nextStep,
    progress,
  }
}

function getRequiredSceneScript(sceneId: string) {
  const script = getSceneScript(sceneId)
  if (!script) {
    throw new HttpError(404, '没有找到这个社交泛化场景')
  }
  return script
}

function parseSceneStart(payload: unknown, defaultTargetSkill: SkillTag) {
  const input = objectPayload(payload)
  return {
    promptLevel: parsePromptLevel(input.promptLevel),
    targetSkill:
      typeof input.targetSkill === 'string' && input.targetSkill.trim()
        ? (input.targetSkill.trim() as SkillTag)
        : defaultTargetSkill,
  }
}

function parseSceneResponse(payload: unknown) {
  const input = objectPayload(payload)
  const attemptId = typeof input.attemptId === 'string' ? input.attemptId.trim() : ''
  const choiceId = typeof input.choiceId === 'string' ? input.choiceId.trim() : ''

  if (!attemptId || !choiceId) {
    throw new HttpError(400, '请提供场景练习和选择结果')
  }

  return { attemptId, choiceId }
}

function parsePromptLevel(value: unknown): PromptLevel {
  if (value === 'low' || value === 'high') {
    return value
  }
  return 'medium'
}

function objectPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }
  return payload as Record<string, unknown>
}
