type SentenceCompletionRecord = {
  levelId: string
  levelTitle: string
  difficulty: string
  sentence: string
  selectedLabels: string[]
  expressionStarsEarned: 1
  completedAt: string
}

type SentenceProgressFile = {
  version: 1
  updatedAt: string | null
  expressionStars: number
  completedLevelIds: string[]
  records: SentenceCompletionRecord[]
}

type EmotionCompletionRecord = {
  levelId: string
  levelTitle: string
  difficulty: string
  matchedPairs: Array<{
    pairId: string
    animal: string
    emotion: string
    intro: string
  }>
  emotionGemsEarned: 1
  completedAt: string
}

type EmotionProgressFile = {
  version: 1
  updatedAt: string | null
  emotionGems: number
  completedLevelIds: string[]
  records: EmotionCompletionRecord[]
}

export type LocalProgressService = {
  appendEmotionRecord(record: unknown): EmotionProgressFile | null
  appendSentenceRecord(record: unknown): SentenceProgressFile | null
  readEmotionProgress(): EmotionProgressFile
  readSentenceProgress(): SentenceProgressFile
}

export function createLocalProgressService(): LocalProgressService {
  let sentenceProgress = createEmptySentenceProgress()
  let emotionProgress = createEmptyEmotionProgress()

  return {
    readSentenceProgress() {
      return cloneSentenceProgress(sentenceProgress)
    },
    appendSentenceRecord(record) {
      if (!isSentenceCompletionRecord(record)) {
        return null
      }

      const records = [...sentenceProgress.records, normalizeSentenceRecord(record)]
      const completedLevelIds = Array.from(new Set(records.map((item) => item.levelId)))
      sentenceProgress = {
        version: 1,
        updatedAt: record.completedAt,
        expressionStars: Math.min(3, completedLevelIds.length),
        completedLevelIds,
        records,
      }

      return cloneSentenceProgress(sentenceProgress)
    },
    readEmotionProgress() {
      return cloneEmotionProgress(emotionProgress)
    },
    appendEmotionRecord(record) {
      if (!isEmotionCompletionRecord(record)) {
        return null
      }

      const records = [...emotionProgress.records, normalizeEmotionRecord(record)]
      const completedLevelIds = Array.from(new Set(records.map((item) => item.levelId)))
      emotionProgress = {
        version: 1,
        updatedAt: record.completedAt,
        emotionGems: Math.min(3, completedLevelIds.length),
        completedLevelIds,
        records,
      }

      return cloneEmotionProgress(emotionProgress)
    },
  }
}

function createEmptySentenceProgress(): SentenceProgressFile {
  return {
    version: 1,
    updatedAt: null,
    expressionStars: 0,
    completedLevelIds: [],
    records: [],
  }
}

function createEmptyEmotionProgress(): EmotionProgressFile {
  return {
    version: 1,
    updatedAt: null,
    emotionGems: 0,
    completedLevelIds: [],
    records: [],
  }
}

function normalizeSentenceRecord(record: SentenceCompletionRecord): SentenceCompletionRecord {
  return {
    levelId: record.levelId,
    levelTitle: record.levelTitle,
    difficulty: record.difficulty,
    sentence: record.sentence,
    selectedLabels: [...record.selectedLabels],
    expressionStarsEarned: 1,
    completedAt: record.completedAt,
  }
}

function normalizeEmotionRecord(record: EmotionCompletionRecord): EmotionCompletionRecord {
  return {
    levelId: record.levelId,
    levelTitle: record.levelTitle,
    difficulty: record.difficulty,
    matchedPairs: record.matchedPairs.map((pair) => ({ ...pair })),
    emotionGemsEarned: 1,
    completedAt: record.completedAt,
  }
}

function cloneSentenceProgress(progress: SentenceProgressFile): SentenceProgressFile {
  return {
    ...progress,
    completedLevelIds: [...progress.completedLevelIds],
    records: progress.records.map(normalizeSentenceRecord),
  }
}

function cloneEmotionProgress(progress: EmotionProgressFile): EmotionProgressFile {
  return {
    ...progress,
    completedLevelIds: [...progress.completedLevelIds],
    records: progress.records.map(normalizeEmotionRecord),
  }
}

function isSentenceCompletionRecord(value: unknown): value is SentenceCompletionRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as SentenceCompletionRecord
  return (
    isString(record.levelId) &&
    isString(record.levelTitle) &&
    isString(record.difficulty) &&
    isString(record.sentence) &&
    Array.isArray(record.selectedLabels) &&
    record.selectedLabels.every(isString) &&
    record.expressionStarsEarned === 1 &&
    isString(record.completedAt)
  )
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
