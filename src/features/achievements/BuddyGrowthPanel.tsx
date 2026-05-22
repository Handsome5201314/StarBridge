import { Sparkles } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { ProgressBar } from '../../shared/components/ProgressBar'
import { useGameStore } from '../../shared/store/useGameStore'

const stageNames = ['小星鹿', '成长中', '闪耀星鹿']
const nextStageExp = 30

export function BuddyGrowthPanel() {
  const { progress } = useGameStore()
  const stageIndex = Math.max(0, Math.min(stageNames.length - 1, progress.buddyGrowth.stage - 1))
  const stageExp = progress.buddyGrowth.exp % nextStageExp
  const isMaxStage = progress.buddyGrowth.stage >= stageNames.length

  return (
    <Card className="buddy-growth-panel">
      <p className="section-label">伙伴成长</p>
      <div className="buddy-growth-visual" aria-hidden="true">
        <span className="deer-stage deer-stage-small" />
        <Sparkles />
        <span className="deer-stage deer-stage-large" />
      </div>
      <div className="buddy-growth-copy">
        <strong>成长阶段：{stageNames[stageIndex]}</strong>
        <span>
          {isMaxStage
            ? '星光小鹿已经进入闪耀阶段。'
            : `再获得 ${nextStageExp - stageExp} 点成长值，小鹿就会升级。`}
        </span>
        <ProgressBar
          label="伙伴成长值"
          max={nextStageExp}
          value={isMaxStage ? nextStageExp : stageExp}
        />
      </div>
    </Card>
  )
}
