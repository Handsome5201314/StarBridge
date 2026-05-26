import type {
  AICoachArtifact,
  LearnerProfile,
  PlayerProgress,
  PromptLevel,
  SceneAttempt,
  SensorBridgeEvent,
  SkillTag,
  VoiceProfile,
  VoicePurpose,
} from '../../src/shared/types/game'

export type InviteStatus = 'active' | 'revoked'

export type InviteRecord = {
  code: string
  status: InviteStatus
  maxUses: number
  usedCount: number
  expiresAt?: string
  note?: string
}

export type ChildProfileRecord = {
  id: string
  nickname: string
  createdAt: string
}

export type FamilySessionRecord = {
  id: string
  token: string
  inviteCode: string
  child: ChildProfileRecord
  progress: PlayerProgress
  createdAt: string
}

export type CreateSceneAttemptInput = {
  sceneId: string
  levelId: string
  promptLevel: PromptLevel
  targetSkill: SkillTag
  firstStepId: string
}

export type SceneStepEventRecord = {
  attemptId: string
  stepId: string
  choiceId: string
  accepted: boolean
  createdAt: string
}

export type CreateVoiceProfileInput = {
  displayName: string
  consentGranted: boolean
  purpose: VoicePurpose
}

export type StarBridgeRepository = {
  now(): Date
  findInvite(code: string): Promise<InviteRecord | null>
  incrementInviteUse(code: string): Promise<void>
  createSession(input: {
    childNickname: string
    inviteCode: string
    progress: PlayerProgress
  }): Promise<FamilySessionRecord>
  findSessionByToken(token: string): Promise<FamilySessionRecord | null>
  saveProgress(sessionId: string, progress: PlayerProgress): Promise<FamilySessionRecord>
  getLearnerProfile(sessionId: string): Promise<LearnerProfile>
  saveLearnerProfile(sessionId: string, profile: LearnerProfile): Promise<LearnerProfile>
  createSceneAttempt(sessionId: string, input: CreateSceneAttemptInput): Promise<SceneAttempt>
  findSceneAttempt(sessionId: string, attemptId: string): Promise<SceneAttempt | null>
  saveSceneAttempt(sessionId: string, attempt: SceneAttempt): Promise<SceneAttempt>
  appendSceneStepEvent(sessionId: string, event: SceneStepEventRecord): Promise<void>
  saveVoiceProfile(sessionId: string, input: CreateVoiceProfileInput): Promise<VoiceProfile>
  findVoiceProfile(sessionId: string, voiceProfileId: string): Promise<VoiceProfile | null>
  appendSensorEvent(sessionId: string, event: SensorBridgeEvent): Promise<SensorBridgeEvent>
  saveAICoachArtifact(sessionId: string, artifact: AICoachArtifact): Promise<AICoachArtifact>
  appendBehaviorEvent(input: {
    details?: Record<string, unknown>
    eventType: string
    sessionId: string
  }): Promise<void>
}
