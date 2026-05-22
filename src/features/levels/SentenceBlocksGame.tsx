import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../../shared/components/Button'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { createLevelResult } from '../../shared/utils/rewards'
import type { LevelComponentProps } from '../../shared/types/game'

const sentenceLevels: Record<
  string,
  {
    prompt: string
    targetWords: string[]
    options: string[]
    encouragement: string
  }
> = {
  'sentence-basic-01': {
    prompt: '请按顺序拼出句子：我想要饼干',
    targetWords: ['我想要', '饼干'],
    options: ['饼干', '我想要', '玩具'],
    encouragement: '你把自己的需求说清楚了。',
  },
  'sentence-medium-01': {
    prompt: '请按顺序拼出句子：我需要帮助',
    targetWords: ['我', '需要', '帮助'],
    options: ['帮助', '我', '需要', '等一下'],
    encouragement: '遇到困难时，请求帮助很棒。',
  },
  'sentence-advanced-01': {
    prompt: '请按顺序拼出句子：你好，我可以一起玩吗',
    targetWords: ['你好', '我可以', '一起玩吗'],
    options: ['一起玩吗', '你好', '我可以', '不想玩'],
    encouragement: '你用了友好的方式开始互动。',
  },
}

export function SentenceBlocksGame({ levelId, onComplete }: LevelComponentProps) {
  const level = sentenceLevels[levelId] ?? sentenceLevels['sentence-basic-01']
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [feedback, setFeedback] = useState('慢慢选择词块，拼好后可以朗读。')
  const selectedSentence = selectedWords.join('')
  const targetSentence = useMemo(() => level.targetWords.join(''), [level.targetWords])
  const isComplete = selectedSentence === targetSentence

  function handlePick(word: string) {
    if (selectedWords.length >= level.targetWords.length) {
      return
    }

    setSelectedWords((currentWords) => [...currentWords, word])
    setFeedback('很好，继续把句子拼完整。')
  }

  function handleCheck() {
    if (!isComplete) {
      setFeedback('我们再试一次，可以先听一听目标句子。')
      return
    }

    const result = createLevelResult(levelId)
    if (result) {
      onComplete(result)
    }
  }

  return (
    <section className="mini-game" aria-labelledby="sentence-game-title">
      <div className="game-copy">
        <p className="section-label">句子积木</p>
        <h2 id="sentence-game-title">{level.prompt}</h2>
        <SpeakButton text={targetSentence} label="听句子" />
      </div>

      <div className="sentence-board" aria-label="已经选择的词块">
        {level.targetWords.map((_, index) => (
          <span className="sentence-slot" key={index}>
            {selectedWords[index] ?? '等待选择'}
          </span>
        ))}
      </div>

      <div className="word-bank" aria-label="可选择的词块">
        {level.options.map((word) => (
          <button
            className="word-block"
            key={word}
            type="button"
            disabled={selectedWords.includes(word)}
            onClick={() => handlePick(word)}
          >
            {word}
          </button>
        ))}
      </div>

      <p className="gentle-feedback" aria-live="polite">
        {feedback}
      </p>

      <div className="game-actions">
        <Button
          variant="ghost"
          icon={<RotateCcw size={20} />}
          onClick={() => {
            setSelectedWords([])
            setFeedback('没关系，我们慢慢来。')
          }}
        >
          重新选择
        </Button>
        <Button onClick={handleCheck}>完成关卡</Button>
      </div>

      {isComplete ? (
        <p className="success-note" aria-live="polite">
          {level.encouragement}
        </p>
      ) : null}
    </section>
  )
}
