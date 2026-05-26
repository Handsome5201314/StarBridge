import { randomUUID } from 'node:crypto'

import { Prisma, PrismaClient } from '@prisma/client'

import { defaultLearnerProfile } from '../services/learnerProfile'
import { initialProgress } from '../../src/shared/store/gameStoreCore'
import type {
  LearnerProfile,
  PlayerProgress,
  PromptLevel,
  SceneAttempt,
  SensorBridgeEvent,
  SensorMetric,
  SensorModality,
  SkillTag,
  VoiceProfile,
  VoiceProfileStatus,
  VoicePurpose,
} from '../../src/shared/types/game'
import type { FamilySessionRecord, StarBridgeRepository } from './types'

type PrismaConnection = PrismaClient | Prisma.TransactionClient

export function createPrismaRepository(
  prisma: PrismaClient = new PrismaClient(),
): StarBridgeRepository {
  return {
    now() {
      return new Date()
    },
    async findInvite(code) {
      const invite = await prisma.inviteCode.findUnique({ where: { code: code.toUpperCase() } })
      return invite
        ? {
            code: invite.code,
            status: invite.status,
            maxUses: invite.maxUses,
            usedCount: invite.usedCount,
            expiresAt: invite.expiresAt?.toISOString(),
            note: invite.note ?? undefined,
          }
        : null
    },
    async incrementInviteUse(code) {
      await prisma.inviteCode.update({
        where: { code: code.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      })
    },
    async createSession(input) {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const child = await tx.childProfile.create({
          data: { nickname: input.childNickname },
        })
        const session = await tx.familySession.create({
          data: {
            token: createId('sb'),
            inviteCode: input.inviteCode.toUpperCase(),
            childId: child.id,
            progress: input.progress as unknown as Prisma.InputJsonObject,
          },
        })
        return readSessionById(tx, session.id)
      })
    },
    async findSessionByToken(token) {
      return readSessionByToken(prisma, token)
    },
    async saveProgress(sessionId, progress) {
      await prisma.familySession.update({
        where: { id: sessionId },
        data: { progress: progress as unknown as Prisma.InputJsonObject },
      })
      return readSessionById(prisma, sessionId)
    },
    async getLearnerProfile(sessionId) {
      const profile = await prisma.learnerProfile.findUnique({ where: { sessionId } })
      if (!profile) {
        return defaultLearnerProfile
      }
      return mapLearnerProfile(profile)
    },
    async saveLearnerProfile(sessionId, profile) {
      const saved = await prisma.learnerProfile.upsert({
        where: { sessionId },
        create: {
          sessionId,
          ...learnerProfileToPrisma(profile),
        },
        update: learnerProfileToPrisma(profile),
      })
      return mapLearnerProfile(saved)
    },
    async createSceneAttempt(sessionId, input) {
      const attempt = await prisma.sceneAttempt.create({
        data: {
          id: createId('attempt'),
          sessionId,
          sceneId: input.sceneId,
          levelId: input.levelId,
          promptLevel: input.promptLevel,
          targetSkill: input.targetSkill,
          currentStepId: input.firstStepId,
          completedStepIds: [],
          status: 'active',
          startedAt: new Date(),
        },
      })
      return mapSceneAttempt(attempt)
    },
    async findSceneAttempt(sessionId, attemptId) {
      const attempt = await prisma.sceneAttempt.findFirst({
        where: { id: attemptId, sessionId },
      })
      return attempt ? mapSceneAttempt(attempt) : null
    },
    async saveSceneAttempt(sessionId, attempt) {
      const saved = await prisma.sceneAttempt.update({
        where: { id: attempt.id, sessionId },
        data: {
          currentStepId: attempt.currentStepId,
          completedStepIds: attempt.completedStepIds,
          status: attempt.status,
          completedAt: attempt.completedAt ? new Date(attempt.completedAt) : null,
        },
      })
      return mapSceneAttempt(saved)
    },
    async appendSceneStepEvent(_sessionId, event) {
      await prisma.sceneStepEvent.create({
        data: {
          attemptId: event.attemptId,
          stepId: event.stepId,
          choiceId: event.choiceId,
          accepted: event.accepted,
          createdAt: new Date(event.createdAt),
        },
      })
    },
    async saveVoiceProfile(sessionId, input) {
      const profile = await prisma.voiceProfile.create({
        data: {
          id: createId('voice'),
          sessionId,
          displayName: input.displayName,
          consentGranted: input.consentGranted,
          purpose: input.purpose,
          status: 'ready',
        },
      })
      return mapVoiceProfile(profile)
    },
    async findVoiceProfile(sessionId, voiceProfileId) {
      const profile = await prisma.voiceProfile.findFirst({
        where: { id: voiceProfileId, sessionId },
      })
      return profile ? mapVoiceProfile(profile) : null
    },
    async appendSensorEvent(sessionId, event) {
      const saved = await prisma.sensorEvent.create({
        data: {
          sessionId,
          modality: event.modality,
          metric: event.metric,
          value: toPrismaJsonValue(event.value) ?? Prisma.JsonNull,
          confidence: event.confidence,
          recordedAt: new Date(event.recordedAt),
          rawMediaStored: false,
        },
      })
      return mapSensorEvent(saved)
    },
    async saveAICoachArtifact(sessionId, artifact) {
      await prisma.aICoachArtifact.create({
        data: {
          sessionId,
          sceneId: artifact.sceneId,
          artifact: toPrismaJsonObject(artifact as unknown as Record<string, unknown>),
          source: 'fallback',
        },
      })
      return {
        ...artifact,
        roleCards: artifact.roleCards.map((card) => ({ ...card })),
        reflectionQuestions: [...artifact.reflectionQuestions],
        safetyNotes: [...artifact.safetyNotes],
      }
    },
    async appendBehaviorEvent(input) {
      await prisma.behaviorEvent.create({
        data: {
          sessionId: input.sessionId,
          eventType: input.eventType,
          details: input.details ? toPrismaJsonObject(input.details) : undefined,
        },
      })
    },
  }
}

function learnerProfileToPrisma(profile: LearnerProfile) {
  return {
    ageBand: profile.ageBand,
    supportLevel: profile.supportLevel,
    preferredVoice: profile.preferredVoice,
    toleratedModalities: profile.toleratedModalities,
    promptPreference: profile.promptPreference,
    generalizationGoals: profile.generalizationGoals,
    notes: profile.notes,
  }
}

function mapLearnerProfile(profile: {
  ageBand: string
  supportLevel: string
  preferredVoice: string
  toleratedModalities: unknown
  promptPreference: string
  generalizationGoals: unknown
  notes: string
}): LearnerProfile {
  return {
    ageBand: profile.ageBand,
    supportLevel:
      profile.supportLevel === 'light' || profile.supportLevel === 'high'
        ? profile.supportLevel
        : 'moderate',
    preferredVoice:
      profile.preferredVoice === 'neutral_safe' ? 'neutral_safe' : 'guardian_familiar',
    toleratedModalities: stringArray(profile.toleratedModalities).filter(
      (item): item is LearnerProfile['toleratedModalities'][number] =>
        item === 'visual' || item === 'voice' || item === 'text' || item === 'sensor_mock',
    ),
    promptPreference: parsePromptLevel(profile.promptPreference),
    generalizationGoals: stringArray(profile.generalizationGoals),
    notes: profile.notes,
  }
}

function mapSceneAttempt(attempt: {
  id: string
  sceneId: string
  levelId: string
  promptLevel: string
  targetSkill: string
  currentStepId: string
  completedStepIds: unknown
  status: string
  startedAt: Date
  completedAt: Date | null
}): SceneAttempt {
  return {
    id: attempt.id,
    sceneId: attempt.sceneId,
    levelId: attempt.levelId,
    promptLevel: parsePromptLevel(attempt.promptLevel),
    targetSkill: attempt.targetSkill as SkillTag,
    currentStepId: attempt.currentStepId,
    completedStepIds: stringArray(attempt.completedStepIds),
    status: attempt.status === 'completed' ? 'completed' : 'active',
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString(),
  }
}

function mapVoiceProfile(profile: {
  id: string
  displayName: string
  consentGranted: boolean
  purpose: string
  status: string
  createdAt: Date
}): VoiceProfile {
  return {
    id: profile.id,
    displayName: profile.displayName,
    consentGranted: profile.consentGranted,
    purpose: parseVoicePurpose(profile.purpose),
    status: parseVoiceStatus(profile.status),
    createdAt: profile.createdAt.toISOString(),
  }
}

function mapSensorEvent(event: {
  modality: string
  metric: string
  value: unknown
  confidence: number
  recordedAt: Date
  rawMediaStored: boolean
}): SensorBridgeEvent {
  return {
    modality: event.modality as SensorModality,
    metric: event.metric as SensorMetric,
    value: typeof event.value === 'number' || typeof event.value === 'string' ? event.value : '',
    confidence: event.confidence,
    recordedAt: event.recordedAt.toISOString(),
    rawMediaStored: false,
  }
}

function parsePromptLevel(value: string): PromptLevel {
  return value === 'low' || value === 'high' ? value : 'medium'
}

function parseVoicePurpose(value: string): VoicePurpose {
  if (value === 'npc_line' || value === 'coach_preview') {
    return value
  }
  return 'guardian_prompt'
}

function parseVoiceStatus(value: string): VoiceProfileStatus {
  if (value === 'pending_provider' || value === 'disabled') {
    return value
  }
  return 'ready'
}

async function readSessionByToken(
  prisma: PrismaConnection,
  token: string,
): Promise<FamilySessionRecord | null> {
  const session = await prisma.familySession.findUnique({
    where: { token },
    include: { child: true },
  })
  return session ? mapSession(session) : null
}

async function readSessionById(
  prisma: PrismaConnection,
  id: string,
): Promise<FamilySessionRecord> {
  const session = await prisma.familySession.findUnique({
    where: { id },
    include: { child: true },
  })
  if (!session) {
    throw new Error(`Session not found: ${id}`)
  }
  return mapSession(session)
}

function mapSession(session: {
  id: string
  token: string
  inviteCode: string
  createdAt: Date
  child: { id: string; nickname: string; createdAt: Date }
  progress: unknown
}): FamilySessionRecord {
  return {
    id: session.id,
    token: session.token,
    inviteCode: session.inviteCode,
    child: {
      id: session.child.id,
      nickname: session.child.nickname,
      createdAt: session.child.createdAt.toISOString(),
    },
    progress: normalizeProgress(session.progress),
    createdAt: session.createdAt.toISOString(),
  }
}

function normalizeProgress(value: unknown): PlayerProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return initialProgress
  }
  const progress = value as Partial<PlayerProgress>
  return {
    ...initialProgress,
    ...progress,
    completedLevelIds: stringArray(progress.completedLevelIds),
    collectedCardIds: stringArray(progress.collectedCardIds),
    badgeProgress: recordNumber(progress.badgeProgress, initialProgress.badgeProgress),
    buddyGrowth:
      progress.buddyGrowth && typeof progress.buddyGrowth === 'object'
        ? { ...initialProgress.buddyGrowth, ...progress.buddyGrowth }
        : initialProgress.buddyGrowth,
    todaySkillTags: stringArray(progress.todaySkillTags) as PlayerProgress['todaySkillTags'],
    realLifeTasks: Array.isArray(progress.realLifeTasks)
      ? progress.realLifeTasks.filter((task): task is PlayerProgress['realLifeTasks'][number] =>
          Boolean(task && typeof task === 'object' && 'id' in task),
        )
      : [],
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function recordNumber(value: unknown, fallback: Record<string, number>): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .map(([key, numberValue]) => [key, numberValue]),
  )
}

function toPrismaJsonObject(value: Record<string, unknown>): Prisma.InputJsonObject {
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, toPrismaJsonValue(item)] as const)
      .filter((entry): entry is readonly [string, Prisma.InputJsonValue | null] => entry[1] !== undefined),
  )
}

function toPrismaJsonValue(value: unknown): Prisma.InputJsonValue | null | undefined {
  if (value === null) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (Array.isArray(value)) {
    return value
      .map(toPrismaJsonValue)
      .filter((item): item is Prisma.InputJsonValue | null => item !== undefined)
  }
  if (value && typeof value === 'object') {
    return toPrismaJsonObject(value as Record<string, unknown>)
  }
  return undefined
}

function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`
}
