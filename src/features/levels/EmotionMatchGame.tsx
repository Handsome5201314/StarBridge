import { useState } from 'react'
import { Button } from '../../shared/components/Button'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { createLevelResult } from '../../shared/utils/rewards'
import type { LevelComponentProps } from '../../shared/types/game'

const emotionLevels: Record<
  string,
  {
    prompt: string
    target: string
    options: string[]
    explanation: string
  }
> = {
  'emotion-basic-01': {
    prompt: '小水滴现在是什么感觉？',
    target: '开心',
    options: ['开心', '难过', '生气'],
    explanation: '笑起来、眼睛亮亮的，常常表示开心。',
  },
  'emotion-medium-01': {
    prompt: '玩具坏了，可能是什么感觉？',
    target: '难过',
    options: ['开心', '难过', '平静'],
    explanation: '喜欢的玩具坏了，可能会感到难过。',
  },
  'emotion-advanced-01': {
    prompt: '深呼吸后，身体慢慢放松，可能是什么感觉？',
    target: '平静',
    options: ['平静', '害怕', '生气'],
    explanation: '身体放松、声音变轻，常常表示平静。',
  },
}

export function EmotionMatchGame({ levelId, onComplete }: LevelComponentProps) {
  const level = emotionLevels[levelId] ?? emotionLevels['emotion-basic-01']
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [feedback, setFeedback] = useState('选择一个你觉得合适的情绪。')

  function handleComplete() {
    if (selectedEmotion !== level.target) {
      setFeedback('我们再试一次，可以听听题目再选择。')
      return
    }

    const result = createLevelResult(levelId)
    if (result) {
      onComplete(result)
    }
  }

  return (
    <section className="mini-game" aria-labelledby="emotion-game-title">
      <div className="game-copy">
        <p className="section-label">情绪消消乐湖</p>
        <h2 id="emotion-game-title">{level.prompt}</h2>
        <SpeakButton text={level.prompt} label="听题目" />
      </div>

      <div className="emotion-scene" aria-hidden="true">
        <span className="emotion-face">{selectedEmotion || '想一想'}</span>
      </div>

      <div className="choice-grid" aria-label="情绪选项">
        {level.options.map((emotion) => (
          <button
            className={emotion === selectedEmotion ? 'choice-card is-selected' : 'choice-card'}
            key={emotion}
            type="button"
            onClick={() => {
              setSelectedEmotion(emotion)
              setFeedback('你选好了，可以点完成关卡。')
            }}
          >
            {emotion}
          </button>
        ))}
      </div>

      <p className="gentle-feedback" aria-live="polite">
        {feedback}
      </p>
      {selectedEmotion === level.target ? <p className="success-note">{level.explanation}</p> : null}

      <Button onClick={handleComplete}>完成关卡</Button>
    </section>
  )
}
