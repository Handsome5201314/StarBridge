import type { CSSProperties, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { PageShell, type PageShellActivePath } from '../../shared/components/PageShell'
import { artAssets } from '../../shared/assets/art'

type GameDashboardFrameProps = PropsWithChildren<{
  activeRail: 'map' | 'achievements' | 'buddy'
}>

export function GameDashboardFrame({ activeRail, children }: GameDashboardFrameProps) {
  const shellStyle = {
    '--world-background-image': `url(${artAssets.homeBackground})`,
  } as CSSProperties
  const activePathByRail: Record<GameDashboardFrameProps['activeRail'], PageShellActivePath> = {
    map: '/game',
    achievements: '/achievements',
    buddy: '/buddy-chat',
  }

  return (
    <PageShell
      activePath={activePathByRail[activeRail]}
      activeRail={activeRail}
      className="app-shell-world-bg"
      style={shellStyle}
    >
      <div className="home-main-column">
        <section className="hero-grid hero-grid-only home-hero-slot" aria-labelledby="home-title">
          <Card className="buddy-card">
            <div className="buddy-card-copy">
              <div className="buddy-card-heading">
                <div className="buddy-mark" aria-hidden="true">
                  <Sparkles size={30} />
                </div>
                <div className="buddy-card-title-row">
                  <p className="section-label">星桥小助手</p>
                  <h1 id="home-title">你好，小探险家</h1>
                </div>
              </div>
              <p>今天我们一起收集 3 颗星星，练习表达、情绪和友好问候。</p>
            </div>
            <Link className="buddy-art-link" to="/buddy-chat" aria-label="打开伙伴聊天">
              <img className="buddy-art" src={artAssets.deer} alt="" />
            </Link>
          </Card>
        </section>

        {children}
      </div>
    </PageShell>
  )
}
