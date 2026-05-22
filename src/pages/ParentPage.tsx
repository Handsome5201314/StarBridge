import { AIPracticeSuggestions } from '../features/parent/AIPracticeSuggestions'
import { ParentFeedbackPanel } from '../features/parent/ParentFeedbackPanel'
import { TodayLearningSummary } from '../features/parent/TodayLearningSummary'
import { PageShell } from '../shared/components/PageShell'
import { useGameStore } from '../shared/store/useGameStore'
import { getCompletedLevels } from '../shared/utils/progress'

export function ParentPage() {
  const { progress } = useGameStore()
  const completedLevels = getCompletedLevels(progress)

  return (
    <PageShell activePath="/parent">
      <div className="page-heading">
        <p className="section-label">家长端</p>
        <h1>游戏中学习，生活中成长</h1>
      </div>
      <section className="parent-layout" aria-label="家长端概览">
        <TodayLearningSummary />
        <AIPracticeSuggestions />
        <aside className="parent-side">
          <div className="paper-card progress-card">
            <p className="section-label">今天的进度</p>
            <strong>{progress.todayStars} 颗星星</strong>
            <span>{completedLevels.length} 个关卡</span>
            <span>{progress.collectedCardIds.length} 张图鉴卡</span>
          </div>
          <ParentFeedbackPanel />
        </aside>
      </section>
    </PageShell>
  )
}
