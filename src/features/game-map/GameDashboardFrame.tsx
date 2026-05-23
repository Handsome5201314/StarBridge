import type { CSSProperties, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { PageShell } from '../../shared/components/PageShell'
import { artAssets } from '../../shared/assets/art'

type GameDashboardFrameProps = PropsWithChildren<{
  activeRail: 'map' | 'achievements' | 'buddy'
}>

const railItems = [
  {
    id: 'map',
    to: '/game',
    label: '地图',
    art: artAssets.railMapIcon,
  },
  {
    id: 'achievements',
    to: '/achievements',
    label: '徽章',
    art: artAssets.railBadgeIcon,
  },
  {
    id: 'buddy',
    to: '/buddy-chat',
    label: '伙伴',
    art: artAssets.railBuddyIcon,
  },
] as const

export function GameDashboardFrame({ activeRail, children }: GameDashboardFrameProps) {
  const shellStyle = {
    '--world-background-image': `url(${artAssets.homeBackground})`,
  } as CSSProperties

  return (
    <PageShell activePath="/game" className="app-shell-world-bg" style={shellStyle}>
      <div className="home-layout">
        <Card className="side-rail page-nav-cards home-side-nav" aria-label="功能入口">
          {railItems.map((item) => {
            const isActive = item.id === activeRail

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'rail-item is-active' : 'rail-item'}
                key={item.id}
                to={item.to}
              >
                <img className="rail-art" src={item.art} alt="" />
                {item.label}
              </Link>
            )
          })}
        </Card>

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
      </div>
    </PageShell>
  )
}
