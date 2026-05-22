import { Lock, Medal } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { ProgressBar } from '../../shared/components/ProgressBar'
import { artAssets } from '../../shared/assets/art'
import { badges } from '../../shared/data/badges'
import { useGameStore } from '../../shared/store/useGameStore'

export function BadgeWall() {
  const { progress } = useGameStore()

  return (
    <Card className="badge-wall">
      <img className="badge-wall-art" src={artAssets.bandage} alt="" />
      <p className="section-label">情绪徽章墙</p>
      <div className="badge-list">
        {badges.map((badge) => {
          const value = progress.badgeProgress[badge.id] ?? 0
          const unlocked = value >= 3

          return (
            <article className="badge-row" key={badge.id}>
              <span className={unlocked ? 'badge-icon is-unlocked' : 'badge-icon'}>
                {unlocked ? <Medal /> : <Lock />}
              </span>
              <div>
                <strong>{badge.name}</strong>
                <span>{badge.description}</span>
                <ProgressBar label={badge.name} max={3} value={value} />
              </div>
              <b>{value}/3</b>
            </article>
          )
        })}
      </div>
    </Card>
  )
}
