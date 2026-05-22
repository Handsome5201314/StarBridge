import { useState } from 'react'
import { Button } from '../../shared/components/Button'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { createLevelResult } from '../../shared/utils/rewards'
import type { LevelComponentProps } from '../../shared/types/game'

const politeLevels: Record<
  string,
  {
    scene: string
    target: string
    options: string[]
    reason: string
  }
> = {
  'polite-basic-01': {
    scene: '别人把积木递给你，你可以说什么？',
    target: '谢谢',
    options: ['谢谢', '走开', '不要'],
    reason: '得到帮助后，说谢谢能让对方知道你收到了善意。',
  },
  'polite-medium-01': {
    scene: '玩具在高处，想请大人帮忙，你可以说什么？',
    target: '请帮帮我',
    options: ['请帮帮我', '快点', '给我'],
    reason: '请求帮助时加上“请”，表达会更友好。',
  },
  'polite-advanced-01': {
    scene: '朋友正在玩小车，你也想玩，可以怎么说？',
    target: '我们轮流玩',
    options: ['我们轮流玩', '我抢走', '不许玩'],
    reason: '轮流能让两个人都参与，也能让互动更舒服。',
  },
}

export function PoliteRunnerGame({ levelId, onComplete }: LevelComponentProps) {
  const level = politeLevels[levelId] ?? politeLevels['polite-basic-01']
  const [selectedPhrase, setSelectedPhrase] = useState('')
  const [feedback, setFeedback] = useState('选择一句适合这个场景的话。')

  function handleComplete() {
    if (selectedPhrase !== level.target) {
      setFeedback('我们再试一次，小鹿会陪你慢慢选。')
      return
    }

    const result = createLevelResult(levelId)
    if (result) {
      onComplete(result)
    }
  }

  return (
    <section className="mini-game runner-game" aria-labelledby="polite-game-title">
      <div className="game-copy">
        <p className="section-label">礼貌语跑酷镇</p>
        <h2 id="polite-game-title">{level.scene}</h2>
        <SpeakButton text={level.scene} label="听场景" />
      </div>

      <div className="runner-track" aria-hidden="true">
        <span className="runner-character" />
        <span className="runner-flag" />
      </div>

      <div className="choice-grid" aria-label="礼貌语选项">
        {level.options.map((phrase) => (
          <button
            className={phrase === selectedPhrase ? 'choice-card is-selected' : 'choice-card'}
            key={phrase}
            type="button"
            onClick={() => {
              setSelectedPhrase(phrase)
              setFeedback('你选好了，可以点完成关卡。')
            }}
          >
            {phrase}
          </button>
        ))}
      </div>

      <p className="gentle-feedback" aria-live="polite">
        {feedback}
      </p>
      {selectedPhrase === level.target ? <p className="success-note">{level.reason}</p> : null}

      <Button onClick={handleComplete}>完成关卡</Button>
    </section>
  )
}
