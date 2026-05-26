import { shoppingMarketScript } from '../../src/shared/data/sceneScripts'
import type {
  AICoachArtifact,
  PromptLevel,
  SensorBridgeEvent,
  SensorMetric,
  SensorModality,
  SkillTag,
  VoicePurpose,
} from '../../src/shared/types/game'
import type { FamilySessionRecord, StarBridgeRepository } from '../repositories/types'
import { HttpError } from './inviteService'

const blockedUnsafeTags = new Set(['water', 'electricity', 'traffic', 'fire', 'height'])
const sensorModalities = new Set<SensorModality>([
  'camera',
  'microphone',
  'wearable',
  'environment',
])
const sensorMetrics = new Set<SensorMetric>([
  'gaze_on_task',
  'head_pose_stable',
  'turn_taking',
  'speech_volume',
  'noise_level',
  'hr_zone',
  'eda_arousal',
  'movement_level',
  'ambient_light',
])

export async function createSceneCoachArtifact(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  payload: unknown,
) {
  const input = parseCoachRequest(payload)
  const artifact: AICoachArtifact = {
    sceneId: 'shopping-market',
    title: '购物小镇课前脚本',
    targetSkill: input.targetSkill,
    promptLevel: input.promptLevel,
    roleCards: shoppingMarketScript.roleCards,
    homePractice: shoppingMarketScript.generalizationTask.scenario,
    reflectionQuestions: [
      '孩子在哪一步最需要成人提示？',
      '下一次是否可以减少一个提示，或换一个同类商品？',
      '真实场景里哪些声音、灯光或排队变化影响了完成度？',
    ],
    safetyNotes: [
      '本建议只用于特教、康复师和家长的辅助练习，不做诊断或疗效承诺。',
      '儿童端答案由固定规则判定，AI 只提供成人复盘材料和受控台词。',
      '避免把水域、电力、交通等危险场景做成有吸引力的游戏任务。',
    ],
  }

  const savedArtifact = await repository.saveAICoachArtifact(session.id, artifact)
  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'ai_scene_coach_generated',
    details: {
      sceneId: savedArtifact.sceneId,
      source: 'fallback',
      promptLevel: savedArtifact.promptLevel,
    },
  })

  return { source: 'fallback' as const, artifact: savedArtifact }
}

export async function createVoiceProfileForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  payload: unknown,
) {
  const input = parseVoiceProfileRequest(payload)
  const profile = await repository.saveVoiceProfile(session.id, input)
  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'voice_profile_created',
    details: { voiceProfileId: profile.id, purpose: profile.purpose },
  })
  return profile
}

export async function synthesizeVoiceForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  payload: unknown,
) {
  const input = parseSynthesisRequest(payload)
  const profile = input.voiceProfileId
    ? await repository.findVoiceProfile(session.id, input.voiceProfileId)
    : null

  if (input.voiceProfileId && !profile) {
    throw new HttpError(404, '没有找到这个声音档案')
  }

  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'voice_synthesis_fallback',
    details: { voiceProfileId: input.voiceProfileId ?? null },
  })

  return {
    fallback: true,
    fallbackReason: 'provider_not_configured',
    audioUrl: null,
    safeText: input.text,
  }
}

export async function appendSensorEventForSession(
  repository: StarBridgeRepository,
  session: FamilySessionRecord,
  payload: unknown,
) {
  const event = parseSensorEvent(payload, repository.now())
  const savedEvent = await repository.appendSensorEvent(session.id, event)
  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'sensor_event_received',
    details: {
      modality: savedEvent.modality,
      metric: savedEvent.metric,
      confidence: savedEvent.confidence,
      rawMediaStored: false,
    },
  })
  return { accepted: true, event: savedEvent }
}

function parseCoachRequest(payload: unknown) {
  const input = objectPayload(payload)
  const unsafeTags = Array.isArray(input.unsafeTags)
    ? input.unsafeTags.filter((item): item is string => typeof item === 'string')
    : []

  if (unsafeTags.some((tag) => blockedUnsafeTags.has(tag))) {
    throw new HttpError(400, '该场景包含不适合做成吸引性游戏任务的危险元素')
  }

  if (typeof input.sceneId === 'string' && input.sceneId !== 'shopping-market') {
    throw new HttpError(400, '当前 MVP 只开放购物小镇场景')
  }

  return {
    targetSkill:
      typeof input.targetSkill === 'string' && input.targetSkill.trim()
        ? (input.targetSkill.trim() as SkillTag)
        : ('social_generalization' as SkillTag),
    promptLevel: parsePromptLevel(input.promptLevel),
  }
}

function parseVoiceProfileRequest(payload: unknown) {
  const input = objectPayload(payload)
  const displayName =
    typeof input.displayName === 'string' && input.displayName.trim()
      ? input.displayName.trim().slice(0, 32)
      : '熟悉家人声音'
  const consentGranted = input.consentGranted === true
  const purpose = parseVoicePurpose(input.purpose)

  if (!consentGranted) {
    throw new HttpError(400, '创建熟悉声音档案前需要监护人明确同意')
  }

  return { displayName, consentGranted, purpose }
}

function parseSynthesisRequest(payload: unknown) {
  const input = objectPayload(payload)
  const text = typeof input.text === 'string' ? input.text.trim().slice(0, 240) : ''
  const voiceProfileId =
    typeof input.voiceProfileId === 'string' && input.voiceProfileId.trim()
      ? input.voiceProfileId.trim()
      : undefined

  if (!text) {
    throw new HttpError(400, '请提供需要朗读的文本')
  }

  return { text, voiceProfileId }
}

function parseSensorEvent(payload: unknown, now: Date): SensorBridgeEvent {
  const input = objectPayload(payload)

  if ('rawVideoBase64' in input || 'rawAudioBase64' in input || 'rawImageBase64' in input) {
    throw new HttpError(400, 'SensorBridge 只接受脱敏派生指标，不接收原始音视频')
  }

  const modality = input.modality
  const metric = input.metric
  const value = input.value
  const confidence = typeof input.confidence === 'number' ? input.confidence : Number.NaN

  if (!sensorModalities.has(modality as SensorModality)) {
    throw new HttpError(400, '不支持的传感器类型')
  }

  if (!sensorMetrics.has(metric as SensorMetric)) {
    throw new HttpError(400, '不支持的传感器指标')
  }

  if (!(typeof value === 'number' || typeof value === 'string')) {
    throw new HttpError(400, '传感器指标值必须是数字或短文本')
  }

  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new HttpError(400, '传感器置信度必须在 0 到 1 之间')
  }

  return {
    modality: modality as SensorModality,
    metric: metric as SensorMetric,
    value,
    confidence,
    recordedAt:
      typeof input.recordedAt === 'string' && !Number.isNaN(new Date(input.recordedAt).getTime())
        ? new Date(input.recordedAt).toISOString()
        : now.toISOString(),
    rawMediaStored: false,
  }
}

function parsePromptLevel(value: unknown): PromptLevel {
  if (value === 'low' || value === 'high') {
    return value
  }
  return 'medium'
}

function parseVoicePurpose(value: unknown): VoicePurpose {
  if (value === 'npc_line' || value === 'coach_preview') {
    return value
  }
  return 'guardian_prompt'
}

function objectPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }
  return payload as Record<string, unknown>
}
