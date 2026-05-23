import type { Difficulty } from '../types/game'

const EMOTION_PROGRESS_ENDPOINT = '/api/emotion-progress'
const EMOTION_PROGRESS_STORAGE_KEY = 'starbridge-emotion-progress-file-fallback:v1'

export type EmotionCompletionRecord = {
  levelId: string
  levelTitle: string
  difficulty: Difficulty
  matchedPairs: Array<{
    pairId: string
    animal: string
    emotion: string
    intro: string
  }>
  emotionGemsEarned: 1
  completedAt: string
}

export type EmotionProgressFile = {
  version: 1
  updatedAt: string | null
  emotionGems: number
  completedLevelIds: string[]
  records: EmotionCompletionRecord[]
}

const emptyEmotionProgressFile: EmotionProgressFile = {
  version: 1,
  updatedAt: null,
  emotionGems: 0,
  completedLevelIds: [],
  records: [],
}

export async function loadEmotionProgressFile(): Promise<EmotionProgressFile> {
  try {
    const response = await fetch(EMOTION_PROGRESS_ENDPOINT)
    if (!response.ok) {
      throw new Error(`Failed to load emotion progress: ${response.status}`)
    }

    return normalizeEmotionProgressFile(await response.json())
  } catch {
    return loadFallbackEmotionProgress()
  }
}

export async function saveEmotionCompletionRecord(record: EmotionCompletionRecord) {
  try {
    const response = await fetch(`${EMOTION_PROGRESS_ENDPOINT}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      throw new Error(`Failed to save emotion progress: ${response.status}`)
    }

    return {
      mode: 'file' as const,
      progress: normalizeEmotionProgressFile(await response.json()),
    }
  } catch {
    const progress = appendFallbackEmotionRecord(record)
    return { mode: 'localStorage' as const, progress }
  }
}

function loadFallbackEmotionProgress(): EmotionProgressFile {
  try {
    const rawProgress = window.localStorage.getItem(EMOTION_PROGRESS_STORAGE_KEY)
    if (!rawProgress) {
      return emptyEmotionProgressFile
    }

    return normalizeEmotionProgressFile(JSON.parse(rawProgress))
  } catch {
    return emptyEmotionProgressFile
  }
}

function appendFallbackEmotionRecord(record: EmotionCompletionRecord): EmotionProgressFile {
  const progress = appendEmotionRecord(loadFallbackEmotionProgress(), record)
  window.localStorage.setItem(EMOTION_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  return progress
}

function appendEmotionRecord(
  progress: EmotionProgressFile,
  record: EmotionCompletionRecord,
): EmotionProgressFile {
  const records = [...progress.records, record]
  const completedLevelIds = Array.from(new Set(records.map((item) => item.levelId)))

  return {
    version: 1,
    updatedAt: record.completedAt,
    emotionGems: Math.min(3, completedLevelIds.length),
    completedLevelIds,
    records,
  }
}

function normalizeEmotionProgressFile(value: unknown): EmotionProgressFile {
  if (!value || typeof value !== 'object') {
    return emptyEmotionProgressFile
  }

  const progress = value as Partial<EmotionProgressFile>
  const records = Array.isArray(progress.records)
    ? progress.records.filter(isEmotionCompletionRecord)
    : []
  const completedLevelIds =
    Array.isArray(progress.completedLevelIds) && progress.completedLevelIds.every(isString)
      ? progress.completedLevelIds
      : Array.from(new Set(records.map((record) => record.levelId)))

  return {
    version: 1,
    updatedAt: typeof progress.updatedAt === 'string' ? progress.updatedAt : null,
    emotionGems: Math.min(3, completedLevelIds.length),
    completedLevelIds,
    records,
  }
}

function isEmotionCompletionRecord(value: unknown): value is EmotionCompletionRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as EmotionCompletionRecord
  return (
    isString(record.levelId) &&
    isString(record.levelTitle) &&
    isString(record.difficulty) &&
    Array.isArray(record.matchedPairs) &&
    record.matchedPairs.every(isMatchedPairRecord) &&
    record.emotionGemsEarned === 1 &&
    isString(record.completedAt)
  )
}

function isMatchedPairRecord(value: unknown) {
  if (!value || typeof value !== 'object') {
    return false
  }

  const pair = value as EmotionCompletionRecord['matchedPairs'][number]
  return (
    isString(pair.pairId) &&
    isString(pair.animal) &&
    isString(pair.emotion) &&
    isString(pair.intro)
  )
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
