import { useMemo, useState } from 'react'
import { ArrowLeft, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '../../shared/components/Button'
import { sentenceGameArt } from '../../shared/assets/sentenceGameArt'
import type { LevelComponentProps } from '../../shared/types/game'
import { speak } from '../../shared/utils/speech'
import { createLevelResult } from '../../shared/utils/rewards'

type BlockKind = 'person' | 'expression' | 'object'

type BlockOption = {
  id: string
  kind: BlockKind
  label: string
  image: string
}

type SentenceRound = {
  prompt: string
  target: Record<BlockKind, string>
  encouragement: string
}

const people: BlockOption[] = [
  { id: 'me', kind: 'person', label: '我', image: sentenceGameArt.tiles.boy },
  { id: 'mom', kind: 'person', label: '妈妈', image: sentenceGameArt.tiles.mom },
  { id: 'teacher', kind: 'person', label: '老师', image: sentenceGameArt.tiles.teacher },
  { id: 'friend', kind: 'person', label: '小朋友', image: sentenceGameArt.tiles.friend },
]

const expressions: BlockOption[] = [
  { id: 'want', kind: 'expression', label: '想要', image: sentenceGameArt.tiles.wantWater },
  { id: 'no', kind: 'expression', label: '不要', image: sentenceGameArt.tiles.noThanks },
  { id: 'more', kind: 'expression', label: '还要', image: sentenceGameArt.tiles.plate },
]

const objects: BlockOption[] = [
  { id: 'rice', kind: 'object', label: '饭', image: sentenceGameArt.tiles.rice },
  { id: 'water', kind: 'object', label: '水', image: sentenceGameArt.tiles.water },
  { id: 'spoon', kind: 'object', label: '勺子', image: sentenceGameArt.tiles.spoon },
  { id: 'veggies', kind: 'object', label: '青菜', image: sentenceGameArt.tiles.veggies },
  { id: 'cookies', kind: 'object', label: '饼干', image: sentenceGameArt.tiles.cookies },
]

const roundsByLevel: Record<string, SentenceRound> = {
  'sentence-basic-01': {
    prompt: '先选谁在说，再选怎么表达，最后选要什么哦！',
    target: { person: 'me', expression: 'want', object: 'water' },
    encouragement: '你用积木告诉我你想喝水，我听懂了。',
  },
  'sentence-medium-01': {
    prompt: '把请求帮助的话拼完整，说清楚会更容易被听见。',
    target: { person: 'me', expression: 'more', object: 'cookies' },
    encouragement: '你把“我还要饼干”拼出来了，表达很清楚。',
  },
  'sentence-advanced-01': {
    prompt: '试试看用温和的方式表达不想要的东西。',
    target: { person: 'me', expression: 'no', object: 'veggies' },
    encouragement: '你会说“我不要青菜”，也能好好表达自己的想法。',
  },
}

const groups = [
  { kind: 'person' as const, label: '人物积木', tone: 'blue', options: people },
  { kind: 'expression' as const, label: '表达积木', tone: 'green', options: expressions },
  { kind: 'object' as const, label: '食物和餐具积木', tone: 'coral', options: objects },
]

const kindLabels: Record<BlockKind, string> = {
  person: '先选谁',
  expression: '再选怎么说',
  object: '最后选什么',
}

export function SentenceBlocksGame({ levelId, onComplete, onExit }: LevelComponentProps) {
  const round = roundsByLevel[levelId] ?? roundsByLevel['sentence-basic-01']
  const [selected, setSelected] = useState<Partial<Record<BlockKind, string>>>({})
  const [hintCount, setHintCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const [feedback, setFeedback] = useState(round.prompt)

  const selectedOptions = useMemo(
    () => ({
      person: findOption('person', selected.person),
      expression: findOption('expression', selected.expression),
      object: findOption('object', selected.object),
    }),
    [selected],
  )

  const targetSentence = useMemo(() => {
    const person = findOption('person', round.target.person)?.label ?? ''
    const expression = findOption('expression', round.target.expression)?.label ?? ''
    const object = findOption('object', round.target.object)?.label ?? ''
    return `${person}${expression}${object}。`
  }, [round])

  const currentSentence = [
    selectedOptions.person?.label,
    selectedOptions.expression?.label,
    selectedOptions.object?.label,
  ].every(Boolean)
    ? `${selectedOptions.person?.label}${selectedOptions.expression?.label}${selectedOptions.object?.label}。`
    : targetSentence

  const isTarget =
    selected.person === round.target.person &&
    selected.expression === round.target.expression &&
    selected.object === round.target.object

  function pick(option: BlockOption) {
    setSelected((current) => ({ ...current, [option.kind]: option.id }))
    setComplete(false)
    setFeedback(`${kindLabels[option.kind]}：${option.label}`)
  }

  function applyHint() {
    const nextKind = (['person', 'expression', 'object'] as BlockKind[]).find((kind) => selected[kind] !== round.target[kind])

    if (!nextKind) {
      setFeedback('已经拼对啦，可以点亮表达星。')
      return
    }

    setSelected((current) => ({ ...current, [nextKind]: round.target[nextKind] }))
    setHintCount((count) => count + 1)
    setFeedback(`提示：${kindLabels[nextKind]}，试试“${findOption(nextKind, round.target[nextKind])?.label}”。`)
  }

  function shufflePreset() {
    const presets: Array<Record<BlockKind, string>> = [
      { person: 'me', expression: 'no', object: 'veggies' },
      { person: 'me', expression: 'more', object: 'cookies' },
      { person: 'me', expression: 'want', object: 'water' },
    ]
    const preset = presets[(hintCount + 1) % presets.length]
    setSelected(preset)
    setHintCount((count) => count + 1)
    setComplete(false)
    setFeedback('换了一组句子积木，读一读看看意思变了吗？')
  }

  function finishRound() {
    if (!isTarget) {
      setFeedback(`目标句子是“${targetSentence}”，我们再调一调积木顺序。`)
      return
    }

    setComplete(true)
    setFeedback(round.encouragement)
    const result = createLevelResult(levelId)
    if (result) {
      onComplete(result)
    }
  }

  return (
    <main className="sentence-game-screen" style={{ backgroundImage: `url(${sentenceGameArt.bg})` }}>
      <div className="sentence-game-stage">
        <button className="sentence-back-button" type="button" onClick={onExit}>
          <ArrowLeft size={20} />
          返回地图
        </button>

        <header className="sentence-game-header">
          <img className="sentence-island-badge" src={sentenceGameArt.island} alt="" />
          <div className="sentence-title-paper">
            <h1>句子积木岛</h1>
            <p>把人物积木、表达积木、食物积木拼成一句话</p>
          </div>
          <div className="sentence-helper">
            <img src={sentenceGameArt.helperDeer} alt="" />
            <p>{round.prompt}</p>
          </div>
        </header>

        <section className="sentence-main-panel" aria-label="句子积木游戏">
          <div className="sentence-builder-top">
            <div className="sentence-slot-row" aria-label="已经选择的句子积木">
              {(['person', 'expression', 'object'] as BlockKind[]).map((kind) => {
                const option = selectedOptions[kind]
                return (
                  <div className={`sentence-image-slot ${option ? 'is-filled' : ''}`} key={kind}>
                    {option ? <img src={option.image} alt="" /> : <span>{kindLabels[kind]}</span>}
                    <strong>{option?.label ?? '待选择'}</strong>
                  </div>
                )
              })}
            </div>

            <button className="sentence-speak-card" type="button" onClick={() => speak(currentSentence)}>
              <img src={sentenceGameArt.speaker} alt="" />
              <span>{currentSentence}</span>
            </button>
          </div>

          <div className="sentence-block-board">
            {groups.map((group) => (
              <div className="sentence-block-row" key={group.kind}>
                <div className={`sentence-row-label is-${group.tone}`}>{group.label}</div>
                <div className="sentence-options">
                  {group.options.map((option) => (
                    <button
                      className={`sentence-option-card is-${group.tone} ${
                        selected[option.kind] === option.id ? 'is-selected' : ''
                      }`}
                      key={option.id}
                      type="button"
                      onClick={() => pick(option)}
                    >
                      <img src={option.image} alt="" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sentence-example-row" aria-label="句子示例">
            <SentenceFormula parts={['我', '不要', '青菜']} />
            <SentenceFormula parts={['我', '还要', '饼干']} />
          </div>

          <p className="sentence-feedback" aria-live="polite">
            {feedback}
          </p>

          <div className="sentence-actions">
            <Button variant="secondary" icon={<Lightbulb size={22} />} onClick={applyHint}>
              提示
            </Button>
            <Button variant="ghost" icon={<RotateCcw size={22} />} onClick={shufflePreset}>
              换一组
            </Button>
            <Button onClick={finishRound}>点亮表达星</Button>
          </div>
        </section>

        <aside className="sentence-reward-panel" aria-label="表达星奖励">
          <div className="sentence-ribbon">表达星</div>
          <img className="sentence-big-star" src={sentenceGameArt.rewardStar} alt="" />
          <div className="sentence-star-card">
            <strong>已收集表达星</strong>
            <div className="sentence-star-list" aria-label={complete ? '已收集 1 颗表达星' : '暂未收集表达星'}>
              {[0, 1, 2].map((index) => (
                <span className={complete && index === 0 ? 'is-earned' : ''} key={index}>
                  ★
                </span>
              ))}
            </div>
            <p>{complete ? '1 / 3 颗' : '0 / 3 颗'}</p>
          </div>
          <p className="sentence-listen-note">
            {complete ? '你用积木告诉我你想喝水，我听懂了。' : '选好三块积木后，点亮第一颗表达星。'}
          </p>
        </aside>
      </div>
    </main>
  )
}

function SentenceFormula({ parts }: { parts: string[] }) {
  return (
    <div className="sentence-formula">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 ? <b>+</b> : null}
          {part}
        </span>
      ))}
    </div>
  )
}

function findOption(kind: BlockKind, id?: string) {
  if (!id) {
    return undefined
  }

  return [...people, ...expressions, ...objects].find((option) => option.kind === kind && option.id === id)
}
