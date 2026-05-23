import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { emotionGameArt } from '../../shared/assets/emotionGameArt'
import {
  loadEmotionProgressFile,
  saveEmotionCompletionRecord,
  type EmotionProgressFile,
} from '../../shared/services/emotionProgressFile'
import { useGameStore } from '../../shared/store/useGameStore'
import type { Difficulty, LevelComponentProps } from '../../shared/types/game'
import { createLevelResult } from '../../shared/utils/rewards'
import { speak } from '../../shared/utils/speech'

type EmotionPairId =
  | 'happy-rabbit'
  | 'sad-cat'
  | 'angry-bear'
  | 'scared-fox'
  | 'calm-turtle'
  | 'surprised-puppy'
  | 'shy-panda'
  | 'proud-duck'

type EmotionPair = {
  id: EmotionPairId
  emotion: string
  animal: string
  image: string
  intro: string
  response: string
}

type EmotionCard = EmotionPair & {
  cardId: string
}

type EmotionLevelId = (typeof emotionLevelOrder)[number]

type EmotionRound = {
  id: EmotionLevelId
  order: number
  title: string
  difficulty: Difficulty
  difficultyLabel: string
  pairIds: EmotionPairId[]
  columns: number
  prompt: string
}

const emotionLevelOrder = [
  'emotion-basic-01',
  'emotion-medium-01',
  'emotion-advanced-01',
] as const

const emotionPairs: Record<EmotionPairId, EmotionPair> = {
  'happy-rabbit': {
    id: 'happy-rabbit',
    emotion: '开心',
    animal: '小兔',
    image: emotionGameArt.cards.happyRabbit,
    intro: '开心时嘴角会上扬，眼睛也会亮亮的。',
    response: '可以一起笑一笑，分享喜欢的事。',
  },
  'sad-cat': {
    id: 'sad-cat',
    emotion: '难过',
    animal: '小猫',
    image: emotionGameArt.cards.sadCat,
    intro: '难过时可能会掉眼泪，声音也会变小。',
    response: '可以轻轻陪伴，问问“你需要抱抱吗”。',
  },
  'angry-bear': {
    id: 'angry-bear',
    emotion: '生气',
    animal: '小熊',
    image: emotionGameArt.cards.angryBear,
    intro: '生气时眉毛会皱起来，身体可能变紧。',
    response: '先停一下，深呼吸，再说出原因。',
  },
  'scared-fox': {
    id: 'scared-fox',
    emotion: '害怕',
    animal: '小狐狸',
    image: emotionGameArt.cards.scaredFox,
    intro: '害怕时眼睛会睁大，想找安全的人。',
    response: '可以说“我有点害怕，请陪陪我”。',
  },
  'calm-turtle': {
    id: 'calm-turtle',
    emotion: '平静',
    animal: '小龟',
    image: emotionGameArt.cards.calmTurtle,
    intro: '平静时身体放松，说话也慢慢的。',
    response: '可以继续安静玩，或慢慢说出想法。',
  },
  'surprised-puppy': {
    id: 'surprised-puppy',
    emotion: '惊讶',
    animal: '小狗',
    image: emotionGameArt.cards.surprisedPuppy,
    intro: '惊讶时嘴巴会张开，想知道发生了什么。',
    response: '可以问“这是怎么回事呀”。',
  },
  'shy-panda': {
    id: 'shy-panda',
    emotion: '害羞',
    animal: '熊猫',
    image: emotionGameArt.cards.shyPanda,
    intro: '害羞时可能低头、脸红，想慢一点加入。',
    response: '可以给一点时间，不用马上催促。',
  },
  'proud-duck': {
    id: 'proud-duck',
    emotion: '自豪',
    animal: '小鸭',
    image: emotionGameArt.cards.proudDuck,
    intro: '自豪时会很想分享“我做到了”。',
    response: '可以一起庆祝，也记得谢谢帮忙的人。',
  },
}

const roundsByLevel: Record<EmotionLevelId, EmotionRound> = {
  'emotion-basic-01': {
    id: 'emotion-basic-01',
    order: 1,
    title: '开心和难过',
    difficulty: 'basic',
    difficultyLabel: '简单',
    pairIds: ['happy-rabbit', 'sad-cat'],
    columns: 2,
    prompt: '第一关是 2×2 棋盘，找出两组相同动物情绪卡。',
  },
  'emotion-medium-01': {
    id: 'emotion-medium-01',
    order: 2,
    title: '更多情绪',
    difficulty: 'medium',
    difficultyLabel: '进阶',
    pairIds: ['happy-rabbit', 'sad-cat', 'angry-bear', 'scared-fox', 'calm-turtle', 'surprised-puppy'],
    columns: 4,
    prompt: '第二关加入更多情绪，配对后读一读文字介绍。',
  },
  'emotion-advanced-01': {
    id: 'emotion-advanced-01',
    order: 3,
    title: '情绪挑战',
    difficulty: 'advanced',
    difficultyLabel: '挑战',
    pairIds: [
      'happy-rabbit',
      'sad-cat',
      'angry-bear',
      'scared-fox',
      'calm-turtle',
      'surprised-puppy',
      'shy-panda',
      'proud-duck',
    ],
    columns: 4,
    prompt: '第三关是 4×4 棋盘，全部配对完成就收集宝石。',
  },
}

export function EmotionMatchGame({ levelId, onComplete, onExit }: LevelComponentProps) {
  const navigate = useNavigate()
  const { progress } = useGameStore()
  const activeLevelId = isEmotionLevelId(levelId) ? levelId : 'emotion-basic-01'
  const round = roundsByLevel[activeLevelId]
  const [deckSeed, setDeckSeed] = useState(0)
  const [firstPickId, setFirstPickId] = useState<string | null>(null)
  const [matchedPairIds, setMatchedPairIds] = useState<Set<EmotionPairId>>(new Set())
  const [mismatchCardIds, setMismatchCardIds] = useState<Set<string>>(new Set())
  const [justCompleted, setJustCompleted] = useState(false)
  const [feedback, setFeedback] = useState(round.prompt)
  const [fileProgress, setFileProgress] = useState<EmotionProgressFile | null>(null)
  const [saveStatus, setSaveStatus] = useState('完成后会保存到 local-data/emotion-progress.json')

  useEffect(() => {
    let cancelled = false

    loadEmotionProgressFile().then((nextProgress) => {
      if (!cancelled) {
        setFileProgress(nextProgress)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const deck = useMemo(() => buildDeck(round, deckSeed), [deckSeed, round])
  const cardsById = useMemo(() => new Map(deck.map((card) => [card.cardId, card])), [deck])
  const fileCompletedIds = useMemo(
    () => new Set(fileProgress?.completedLevelIds ?? []),
    [fileProgress],
  )
  const completedEmotionIds = useMemo(
    () =>
      new Set(
        emotionLevelOrder.filter(
          (id) => progress.completedLevelIds.includes(id) || fileCompletedIds.has(id),
        ),
      ),
    [fileCompletedIds, progress.completedLevelIds],
  )
  const displayedCompletedIds = useMemo(() => {
    const nextIds = new Set(completedEmotionIds)
    if (justCompleted) {
      nextIds.add(activeLevelId)
    }

    return nextIds
  }, [activeLevelId, completedEmotionIds, justCompleted])

  const currentLevelCompleted = displayedCompletedIds.has(activeLevelId)
  const collectedGems = Math.min(3, displayedCompletedIds.size)
  const nextLevelId = emotionLevelOrder[round.order]
  const matchedCount = matchedPairIds.size
  const allMatched = matchedCount === round.pairIds.length

  useEffect(() => {
    if (!mismatchCardIds.size) {
      return
    }

    const timer = window.setTimeout(() => {
      setMismatchCardIds(new Set())
      setFirstPickId(null)
    }, 650)

    return () => window.clearTimeout(timer)
  }, [mismatchCardIds])

  function pickCard(card: EmotionCard) {
    if (matchedPairIds.has(card.id) || mismatchCardIds.has(card.cardId)) {
      return
    }

    if (!firstPickId) {
      setFirstPickId(card.cardId)
      setFeedback(`你选了${card.animal}的“${card.emotion}”，再找一张一样的。`)
      return
    }

    if (firstPickId === card.cardId) {
      return
    }

    const firstCard = cardsById.get(firstPickId)
    if (!firstCard) {
      setFirstPickId(card.cardId)
      return
    }

    if (firstCard.id === card.id) {
      const nextMatched = new Set(matchedPairIds)
      nextMatched.add(card.id)
      setMatchedPairIds(nextMatched)
      setFirstPickId(null)
      setFeedback(`配对成功：${card.emotion}。${card.intro}`)
      speak(`${card.emotion}。${card.intro}`)

      if (nextMatched.size === round.pairIds.length) {
        void completeRound(nextMatched)
      }
      return
    }

    setMismatchCardIds(new Set([firstPickId, card.cardId]))
    setFeedback('这两张不一样，观察动物表情再试一次。')
  }

  function applyHint() {
    const nextPair = round.pairIds.find((pairId) => !matchedPairIds.has(pairId))
    if (!nextPair) {
      setFeedback('已经全部配对完成啦，可以继续下一关。')
      return
    }

    const card = emotionPairs[nextPair]
    setFeedback(`提示：找两张${card.animal}的“${card.emotion}”卡。`)
  }

  function resetDeck() {
    setDeckSeed((seed) => seed + 1)
    setFirstPickId(null)
    setMatchedPairIds(new Set())
    setMismatchCardIds(new Set())
    setJustCompleted(false)
    setFeedback('已经换一组位置，重新观察动物表情吧。')
  }

  async function completeRound(completedPairs: Set<EmotionPairId>) {
    const completedAt = new Date().toISOString()
    const record = {
      levelId: round.id,
      levelTitle: round.title,
      difficulty: round.difficulty,
      matchedPairs: round.pairIds
        .filter((pairId) => completedPairs.has(pairId))
        .map((pairId) => {
          const pair = emotionPairs[pairId]
          return {
            pairId,
            animal: pair.animal,
            emotion: pair.emotion,
            intro: pair.intro,
          }
        }),
      emotionGemsEarned: 1 as const,
      completedAt,
    }

    setJustCompleted(true)
    setFeedback(`全部配对完成！你收集到第 ${round.order} 颗情绪宝石。`)
    setSaveStatus('正在保存本地完成记录...')

    const result = createLevelResult(activeLevelId)
    if (result) {
      onComplete(result)
    }

    const saveResult = await saveEmotionCompletionRecord(record)
    setFileProgress(saveResult.progress)
    setSaveStatus(
      saveResult.mode === 'file'
        ? '已保存到 local-data/emotion-progress.json'
        : '本地文件接口不可用，已暂存到浏览器本地记录',
    )
  }

  return (
    <main className="emotion-game-screen" style={{ backgroundImage: `url(${emotionGameArt.bg})` }}>
      <div className="emotion-game-stage">
        <button className="emotion-back-button" type="button" onClick={onExit}>
          返回地图
        </button>

        <header className="emotion-game-header">
          <img className="emotion-island-badge" src={emotionGameArt.island} alt="" />
          <div className="emotion-title-paper">
            <h1>情绪宝石消消乐</h1>
            <p>把相同动物情绪卡配成一组，翻开文字情绪介绍</p>
          </div>
          <div className="emotion-helper">
            <img src={emotionGameArt.helperDeer} alt="" />
            <p>
              第 {round.order} 关 · {round.difficultyLabel}：{round.prompt}
            </p>
          </div>
        </header>

        <section className="emotion-main-panel" aria-label="情绪消消乐游戏">
          <div className="emotion-level-strip" aria-label="情绪消消乐关卡">
            {emotionLevelOrder.map((id, index) => {
              const levelRound = roundsByLevel[id]
              const isCurrent = id === activeLevelId
              const isDone = displayedCompletedIds.has(id)

              return (
                <button
                  className={`emotion-level-pill ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
                  key={id}
                  type="button"
                  onClick={() => navigate(`/level/${id}`)}
                >
                  <span>{isDone ? '✓' : index + 1}</span>
                  <strong>{levelRound.difficultyLabel}</strong>
                  <small>{levelRound.title}</small>
                </button>
              )
            })}
          </div>

          <div
            className="emotion-card-board"
            style={{ '--emotion-cols': round.columns } as CSSProperties}
            aria-label={`${round.difficultyLabel}情绪棋盘`}
          >
            {deck.map((card) => {
              const isMatched = matchedPairIds.has(card.id)
              const isSelected = firstPickId === card.cardId
              const isMismatch = mismatchCardIds.has(card.cardId)

              return (
                <button
                  className={`emotion-memory-card ${isMatched ? 'is-matched' : ''} ${
                    isSelected ? 'is-selected' : ''
                  } ${isMismatch ? 'is-mismatch' : ''}`}
                  key={card.cardId}
                  type="button"
                  onClick={() => pickCard(card)}
                >
                  <span className="emotion-card-inner">
                    <span className="emotion-card-face emotion-card-animal">
                      <img src={card.image} alt="" />
                      <strong>{card.animal}</strong>
                      <em>{card.emotion}</em>
                    </span>
                    <span className="emotion-card-face emotion-card-intro">
                      <img src={emotionGameArt.cardBack} alt="" />
                      <strong>{card.emotion}</strong>
                      <span>{card.intro}</span>
                      <small>{card.response}</small>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <p className="visually-hidden" aria-live="polite">
            {feedback}
          </p>

          <div className="emotion-actions">
            <button className="emotion-art-button is-hint" type="button" onClick={applyHint}>
              <img src={emotionGameArt.hintButton} alt="" />
              <span>提示</span>
            </button>
            <button className="emotion-art-button is-refresh" type="button" onClick={resetDeck}>
              <img src={emotionGameArt.refreshButton} alt="" />
              <span>换一组</span>
            </button>
            {allMatched && nextLevelId ? (
              <Button variant="secondary" onClick={() => navigate(`/level/${nextLevelId}`)}>
                下一关
              </Button>
            ) : null}
          </div>
        </section>

        <aside className="emotion-reward-panel" aria-label="情绪宝石奖励">
          <div className="emotion-ribbon">情绪宝石</div>
          <img className="emotion-big-gem" src={emotionGameArt.gem} alt="" />
          <div className="emotion-gem-card">
            <strong>已收集宝石</strong>
            <div className="emotion-gem-list" aria-label={`已收集 ${collectedGems} 颗情绪宝石`}>
              {[0, 1, 2].map((index) => (
                <span className={index < collectedGems ? 'is-earned' : ''} key={index}>
                  ◆
                </span>
              ))}
            </div>
            <p>{collectedGems} / 3 颗</p>
          </div>
          <p className="emotion-listen-note">
            {currentLevelCompleted
              ? `${round.title}完成啦！${nextLevelId ? '继续挑战下一关。' : '三关全部完成，解锁小奖励！'}`
              : `已配对 ${matchedCount} / ${round.pairIds.length} 组，全部配对后获得 1 颗宝石。`}
          </p>
          <p className="emotion-save-note">{saveStatus}</p>
          <div className="emotion-gift-note">
            <img src={emotionGameArt.gift} alt="" />
            <span>集齐 3 颗，解锁小奖励</span>
          </div>
        </aside>
      </div>
    </main>
  )
}

function buildDeck(round: EmotionRound, seed: number): EmotionCard[] {
  const cards = round.pairIds.flatMap((pairId) => {
    const pair = emotionPairs[pairId]
    return [
      { ...pair, cardId: `${pair.id}-a` },
      { ...pair, cardId: `${pair.id}-b` },
    ]
  })

  return shuffleCards(cards, seed)
}

function shuffleCards(cards: EmotionCard[], seed: number) {
  const nextCards = [...cards]
  let value = seed + 11

  for (let index = nextCards.length - 1; index > 0; index -= 1) {
    value = (value * 9301 + 49297) % 233280
    const swapIndex = value % (index + 1)
    ;[nextCards[index], nextCards[swapIndex]] = [nextCards[swapIndex], nextCards[index]]
  }

  return nextCards
}

function isEmotionLevelId(levelId: string): levelId is EmotionLevelId {
  return emotionLevelOrder.includes(levelId as EmotionLevelId)
}
