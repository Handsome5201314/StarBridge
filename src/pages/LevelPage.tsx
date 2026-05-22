import type { ReactElement } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Gift, Sparkles } from 'lucide-react'
import { EmotionMatchGame } from '../features/levels/EmotionMatchGame'
import { PoliteRunnerGame } from '../features/levels/PoliteRunnerGame'
import { SentenceBlocksGame } from '../features/levels/SentenceBlocksGame'
import { Button } from '../shared/components/Button'
import { Card } from '../shared/components/Card'
import { PageShell } from '../shared/components/PageShell'
import { SpeakButton } from '../shared/components/SpeakButton'
import { getCardById } from '../shared/data/cards'
import { getIslandById } from '../shared/data/islands'
import { getLevelById } from '../shared/data/levels'
import { useGameStore } from '../shared/store/useGameStore'
import type { LevelComponentProps, LevelResult } from '../shared/types/game'

export function LevelPage() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const { progress, actions } = useGameStore()
  const level = getLevelById(levelId ?? '')
  const island = level ? getIslandById(level.islandId) : undefined
  const completed = level ? progress.completedLevelIds.includes(level.id) : false

  function handleComplete(result: LevelResult) {
    actions.completeLevel(result)
  }

  const GameComponent = level ? levelComponents[level.mechanic] : null

  return (
    <PageShell activePath="/game">
      <Button as={Link} to="/game" variant="ghost" icon={<ArrowLeft size={20} />}>
        返回地图
      </Button>

      {!level || !GameComponent ? (
        <Card className="level-shell">
          <p className="section-label">当前关卡</p>
          <h1>没有找到这个关卡</h1>
          <p>可以回到地图，选择一个已经开放的岛屿任务。</p>
        </Card>
      ) : (
        <div className="level-layout">
          <Card className="level-shell">
            <div className="level-title-row">
              <div>
                <p className="section-label">{island?.name}</p>
                <h1>{level.title}</h1>
              </div>
              <SpeakButton text={`${island?.name ?? ''}，${level.title}`} label="朗读关卡" />
            </div>
            <GameComponent
              difficulty={level.difficulty}
              levelId={level.id}
              onComplete={handleComplete}
              onExit={() => navigate('/game')}
            />
          </Card>

          <Card className="reward-panel">
            <p className="section-label">通关奖励</p>
            <div className="reward-row">
              <Sparkles />
              <span>{level.rewardStars} 颗星星</span>
            </div>
            {level.rewardCardIds.map((cardId) => {
              const card = getCardById(cardId)
              if (!card) {
                return null
              }

              return (
                <div className="reward-card-mini" key={card.id}>
                  <Gift />
                  <div>
                    <strong>{card.name}</strong>
                    <span>{card.description}</span>
                  </div>
                </div>
              )
            })}
            {completed ? (
              <div className="completion-callout" aria-live="polite">
                <strong>已经完成</strong>
                <span>奖励已进入成就页，家长端也生成了现实练习任务。</span>
                <Button onClick={() => navigate('/achievements')}>查看成就</Button>
                <Button variant="secondary" onClick={() => navigate('/parent')}>
                  去家长端
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </PageShell>
  )
}

const levelComponents: Record<string, (props: LevelComponentProps) => ReactElement> = {
  sentence_blocks: SentenceBlocksGame,
  emotion_match: EmotionMatchGame,
  polite_runner: PoliteRunnerGame,
}
