import type {
  AICoachArtifact,
  CardConfig,
  IslandConfig,
  LearnerProfile,
  LevelConfig,
  PlayerProgress,
  PromptLevel,
  SceneScript,
  SceneStep,
  SensorBridgeEvent,
  SensorMetric,
  SensorModality,
  SkillTag,
  VoiceProfile,
  VoicePurpose,
} from '../types/game'

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? '/api')

export const SESSION_TOKEN_STORAGE_KEY = 'starbridge-session-token:v1'
export const DEFAULT_INVITE_CODE = import.meta.env.VITE_STARBRIDGE_INVITE_CODE ?? 'STARBRIDGE-DEMO'

export type StarBridgeChildProfile = {
  id: string
  nickname: string
  createdAt: string
}

export type GameBootstrapResponse = {
  child: StarBridgeChildProfile
  islands: IslandConfig[]
  levels: LevelConfig[]
  cards: CardConfig[]
  progress: PlayerProgress
}

export type ClaimInviteResponse = {
  child: StarBridgeChildProfile
  sessionToken: string
}

export type ProgressMutationResponse = {
  alreadyCompleted: boolean
  progress: PlayerProgress
}

export type SceneStartResponse = {
  attemptId: string
  script: SceneScript
  nextStep: SceneStep
}

export type SceneStepResponse = {
  accepted: boolean
  completed: boolean
  nextStep: SceneStep | null
  progress: PlayerProgress
}

export type SceneCoachResponse = {
  source: 'fallback' | 'ai'
  artifact: AICoachArtifact
}

export type VoiceSynthesisResponse = {
  fallback: boolean
  fallbackReason: string
  audioUrl: string | null
  safeText: string
}

export type SensorEventResponse = {
  accepted: boolean
  event: SensorBridgeEvent
}

export async function claimInvite(
  code = DEFAULT_INVITE_CODE,
  childNickname = '星桥小朋友',
): Promise<ClaimInviteResponse> {
  return requestApi('/invites/claim', {
    method: 'POST',
    body: { code, childNickname },
  })
}

export async function loadGameBootstrap(
  sessionToken: string,
): Promise<GameBootstrapResponse> {
  return requestApi('/game/bootstrap', { sessionToken })
}

export async function completeLevelRemote(
  sessionToken: string,
  levelId: string,
): Promise<ProgressMutationResponse> {
  return requestApi(`/levels/${encodeURIComponent(levelId)}/complete`, {
    method: 'POST',
    sessionToken,
    body: {},
  })
}

export async function completeRealLifeTaskRemote(
  sessionToken: string,
  taskId: string,
): Promise<ProgressMutationResponse> {
  return requestApi(`/real-life-tasks/${encodeURIComponent(taskId)}/complete`, {
    method: 'POST',
    sessionToken,
    body: {},
  })
}

export async function loadLearnerProfile(sessionToken: string): Promise<LearnerProfile> {
  return requestApi('/learner-profile', { sessionToken })
}

export async function startSceneRemote(
  sessionToken: string,
  sceneId: string,
  input: { promptLevel?: PromptLevel; targetSkill?: SkillTag } = {},
): Promise<SceneStartResponse> {
  return requestApi(`/scenes/${encodeURIComponent(sceneId)}/start`, {
    method: 'POST',
    sessionToken,
    body: input,
  })
}

export async function respondToSceneStepRemote(
  sessionToken: string,
  sceneId: string,
  stepId: string,
  input: { attemptId: string; choiceId: string },
): Promise<SceneStepResponse> {
  return requestApi(
    `/scenes/${encodeURIComponent(sceneId)}/steps/${encodeURIComponent(stepId)}/respond`,
    {
      method: 'POST',
      sessionToken,
      body: input,
    },
  )
}

export async function createSceneCoachRemote(
  sessionToken: string,
  input: { promptLevel?: PromptLevel; sceneId: string; targetSkill?: SkillTag },
): Promise<SceneCoachResponse> {
  return requestApi('/ai/scene-coach', {
    method: 'POST',
    sessionToken,
    body: input,
  })
}

export async function createVoiceProfileRemote(
  sessionToken: string,
  input: { consentGranted: boolean; displayName: string; purpose: VoicePurpose },
): Promise<VoiceProfile> {
  return requestApi('/voice/profiles', {
    method: 'POST',
    sessionToken,
    body: input,
  })
}

export async function synthesizeVoiceRemote(
  sessionToken: string,
  input: { text: string; voiceProfileId?: string },
): Promise<VoiceSynthesisResponse> {
  return requestApi('/voice/synthesize', {
    method: 'POST',
    sessionToken,
    body: input,
  })
}

export async function sendSensorEventRemote(
  sessionToken: string,
  input: {
    confidence: number
    metric: SensorMetric
    modality: SensorModality
    value: number | string
  },
): Promise<SensorEventResponse> {
  return requestApi('/sensor-events', {
    method: 'POST',
    sessionToken,
    body: input,
  })
}

export function getStoredSessionToken(): string | null {
  return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)
}

async function requestApi<T>(
  path: string,
  options: {
    body?: unknown
    method?: 'GET' | 'POST'
    sessionToken?: string
  } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.sessionToken ? { Authorization: `Bearer ${options.sessionToken}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`StarBridge API request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

function normalizeBaseUrl(value: string) {
  const trimmedValue = value.trim() || '/api'
  return trimmedValue.endsWith('/') ? trimmedValue.slice(0, -1) : trimmedValue
}
