import { Sparkles, Trophy } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { useGameStore } from '../../shared/store/useGameStore'
import { getCompletedLevels } from '../../shared/utils/progress'

export function TodayAchievementPanel() {
  const { progress } = useGameStore()
  const completedLevels = getCompletedLevels(progress)
  const bestText = progress.todayStars > 0 ? '棒极了！' : '等待开始'

  return (
    <Card className="achievement-summary">
      <p className="section-label">今日成就</p>
      <div className="metric-row">
        <div>
          <Sparkles />
          <span>今日收集星星</span>
          <strong>{progress.todayStars}</strong>
        </div>
        <div>
          <Trophy />
          <span>完成关卡</span>
          <strong>{completedLevels.length}</strong>
        </div>
        <div>
          <Sparkles />
          <span>最佳表现</span>
          <strong>{bestText}</strong>
        </div>
      </div>
      <p className="achievement-note">
        {progress.todayStars > 0
          ? '你今天做得真棒！继续加油，星星正在为你闪耀。'
          : '完成第一个关卡后，这里会记录今天的成长。'}
      </p>
    </Card>
  )
}
