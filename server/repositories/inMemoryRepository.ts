import { randomUUID } from 'node:crypto'

import type {
  AICoachArtifact,
  LearnerProfile,
  PlayerProgress,
  SceneAttempt,
  SensorBridgeEvent,
  VoiceProfile,
} from '../../src/shared/types/game'
import { defaultLearnerProfile } from '../services/learnerProfile'
import type { FamilySessionRecord, InviteRecord, StarBridgeRepository } from './types'

type InMemoryRepositoryOptions = {
  invites?: Array<Partial<InviteRecord> & Pick<InviteRecord, 'code' | 'maxUses' | 'status'>>
  now?: () => Date
}

export function createInMemoryRepository(
  options: InMemoryRepositoryOptions = {},
): StarBridgeRepository {
  const invites = new Map<string, InviteRecord>()
  const sessions = new Map<string, FamilySessionRecord>()
  const learnerProfiles = new Map<string, LearnerProfile>()
  const sceneAttempts = new Map<string, SceneAttempt>()
  const voiceProfiles = new Map<string, VoiceProfile[]>()
  const sensorEvents = new Map<string, SensorBridgeEvent[]>()
  const coachArtifacts = new Map<string, AICoachArtifact[]>()
  const now = options.now ?? (() => new Date())

  for (const invite of options.invites ?? []) {
    invites.set(invite.code.toUpperCase(), {
      usedCount: invite.usedCount ?? 0,
      ...invite,
      code: invite.code.toUpperCase(),
    })
  }

  return {
    now,
    async findInvite(code) {
      return invites.get(code.toUpperCase()) ?? null
    },
    async incrementInviteUse(code) {
      const normalizedCode = code.toUpperCase()
      const invite = invites.get(normalizedCode)
      if (!invite) return
      invites.set(normalizedCode, { ...invite, usedCount: invite.usedCount + 1 })
    },
    async createSession(input) {
      const session: FamilySessionRecord = {
        id: createId('session'),
        token: createId('sb'),
        inviteCode: input.inviteCode.toUpperCase(),
        child: {
          id: createId('child'),
          nickname: input.childNickname,
          createdAt: now().toISOString(),
        },
        progress: cloneProgress(input.progress),
        createdAt: now().toISOString(),
      }
      sessions.set(session.token, session)
      return cloneSession(session)
    },
    async findSessionByToken(token) {
      const session = sessions.get(token)
      return session ? cloneSession(session) : null
    },
    async saveProgress(sessionId, progress) {
      const session = Array.from(sessions.values()).find((item) => item.id === sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      const nextSession = { ...session, progress: cloneProgress(progress) }
      sessions.set(nextSession.token, nextSession)
      return cloneSession(nextSession)
    },
    async getLearnerProfile(sessionId) {
      const profile = learnerProfiles.get(sessionId) ?? defaultLearnerProfile
      return cloneLearnerProfile(profile)
    },
    async saveLearnerProfile(sessionId, profile) {
      const nextProfile = cloneLearnerProfile(profile)
      learnerProfiles.set(sessionId, nextProfile)
      return cloneLearnerProfile(nextProfile)
    },
    async createSceneAttempt(sessionId, input) {
      const attempt = {
        id: createId('attempt'),
        sceneId: input.sceneId,
        levelId: input.levelId,
        promptLevel: input.promptLevel,
        targetSkill: input.targetSkill,
        currentStepId: input.firstStepId,
        completedStepIds: [],
        status: 'active' as const,
        startedAt: now().toISOString(),
      }
      sceneAttempts.set(createSessionScopedKey(sessionId, attempt.id), cloneSceneAttempt(attempt))
      return cloneSceneAttempt(attempt)
    },
    async findSceneAttempt(sessionId, attemptId) {
      const attempt = sceneAttempts.get(createSessionScopedKey(sessionId, attemptId))
      return attempt ? cloneSceneAttempt(attempt) : null
    },
    async saveSceneAttempt(sessionId, attempt) {
      sceneAttempts.set(createSessionScopedKey(sessionId, attempt.id), cloneSceneAttempt(attempt))
      return cloneSceneAttempt(attempt)
    },
    async appendSceneStepEvent() {
      // In-memory tests assert user-facing state, not event log retrieval.
    },
    async saveVoiceProfile(sessionId, input) {
      const profile = {
        id: createId('voice'),
        displayName: input.displayName,
        consentGranted: input.consentGranted,
        purpose: input.purpose,
        status: 'ready' as const,
        createdAt: now().toISOString(),
      }
      const existing = voiceProfiles.get(sessionId) ?? []
      voiceProfiles.set(sessionId, [cloneVoiceProfile(profile), ...existing])
      return cloneVoiceProfile(profile)
    },
    async findVoiceProfile(sessionId, voiceProfileId) {
      const profile = (voiceProfiles.get(sessionId) ?? []).find((item) => item.id === voiceProfileId)
      return profile ? cloneVoiceProfile(profile) : null
    },
    async appendSensorEvent(sessionId, event) {
      const nextEvent = cloneSensorEvent(event)
      const existing = sensorEvents.get(sessionId) ?? []
      sensorEvents.set(sessionId, [nextEvent, ...existing])
      return cloneSensorEvent(nextEvent)
    },
    async saveAICoachArtifact(sessionId, artifact) {
      const existing = coachArtifacts.get(sessionId) ?? []
      coachArtifacts.set(sessionId, [artifact, ...existing])
      return {
        ...artifact,
        roleCards: artifact.roleCards.map((card) => ({ ...card })),
        reflectionQuestions: [...artifact.reflectionQuestions],
        safetyNotes: [...artifact.safetyNotes],
      }
    },
    async appendBehaviorEvent() {
      // In-memory repository keeps only user-facing session state.
    },
  }
}

function cloneSession(session: FamilySessionRecord): FamilySessionRecord {
  return {
    ...session,
    child: { ...session.child },
    progress: cloneProgress(session.progress),
  }
}

function cloneProgress(progress: PlayerProgress): PlayerProgress {
  return {
    ...progress,
    completedLevelIds: [...progress.completedLevelIds],
    collectedCardIds: [...progress.collectedCardIds],
    badgeProgress: { ...progress.badgeProgress },
    buddyGrowth: { ...progress.buddyGrowth },
    todaySkillTags: [...progress.todaySkillTags],
    realLifeTasks: progress.realLifeTasks.map((task) => ({ ...task })),
  }
}

function cloneLearnerProfile(profile: LearnerProfile): LearnerProfile {
  return {
    ...profile,
    toleratedModalities: [...profile.toleratedModalities],
    generalizationGoals: [...profile.generalizationGoals],
  }
}

function cloneSceneAttempt(attempt: SceneAttempt): SceneAttempt {
  return {
    ...attempt,
    completedStepIds: [...attempt.completedStepIds],
  }
}

function cloneVoiceProfile(profile: VoiceProfile): VoiceProfile {
  return { ...profile }
}

function cloneSensorEvent(event: SensorBridgeEvent): SensorBridgeEvent {
  return { ...event }
}

function createSessionScopedKey(sessionId: string, id: string): string {
  return `${sessionId}:${id}`
}

function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`
}
