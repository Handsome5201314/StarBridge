import { BadgeWall } from '../features/achievements/BadgeWall'
import { BuddyGrowthPanel } from '../features/achievements/BuddyGrowthPanel'
import { CollectionPreview } from '../features/achievements/CollectionPreview'
import { TodayAchievementPanel } from '../features/achievements/TodayAchievementPanel'
import { PageShell } from '../shared/components/PageShell'

export function AchievementsPage() {
  return (
    <PageShell activePath="/achievements">
      <div className="page-heading">
        <p className="section-label">游戏成就</p>
        <h1>每一次进步，都是你的成长脚印</h1>
      </div>
      <section className="achievement-layout" aria-label="成就概览">
        <TodayAchievementPanel />
        <BadgeWall />
        <CollectionPreview />
        <BuddyGrowthPanel />
      </section>
    </PageShell>
  )
}
