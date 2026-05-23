import { Link } from 'react-router-dom'
import { Medal, Sparkles } from 'lucide-react'
import { Button } from '../shared/components/Button'
import { Card } from '../shared/components/Card'
import { PageShell } from '../shared/components/PageShell'
import { artAssets, islandArtById } from '../shared/assets/art'
import { islands } from '../shared/data/islands'

export function GameHomePage() {
  return (
    <PageShell activePath="/game">
      <div className="home-layout">
        <Card className="side-rail page-nav-cards home-side-nav" aria-label="功能入口">
          <Link className="rail-item is-active" to="/game">
            <img className="rail-art" src={artAssets.map} alt="" />
            地图
          </Link>
          <Link className="rail-item" to="/achievements">
            <Medal />
            徽章
          </Link>
          <Link className="rail-item" to="/parent">
            <Sparkles />
            伙伴
          </Link>
        </Card>

        <div className="home-main-column">
          <section className="hero-grid hero-grid-only home-hero-slot" aria-labelledby="home-title">
            <Card className="buddy-card">
              <div className="buddy-card-copy">
                <div className="buddy-mark" aria-hidden="true">
                  <Sparkles size={34} />
                </div>
                <p className="section-label">星桥小助手</p>
                <h1 id="home-title">你好，小探险家</h1>
                <p>
                  今天我们一起收集 3 颗星星，练习表达、情绪和礼貌互动。
                </p>
                <div className="hero-actions">
                  <Button as={Link} to="/level/sentence-basic-01">
                    开始今日任务
                  </Button>
                </div>
              </div>
              <img className="buddy-art" src={artAssets.deer} alt="" />
            </Card>
          </section>

          <section className="world-layout world-layout-map-only home-world-slot" aria-labelledby="map-title">
            <Card className="map-panel">
              <div className="section-heading">
                <p className="section-label">游戏世界</p>
                <h2 id="map-title">三座表达成长岛屿</h2>
              </div>
              <div className="island-grid">
                {islands.map((island, index) => (
                  <Link
                    className={index === 0 ? 'island-card island-card-primary' : 'island-card'}
                    key={island.id}
                    to={island.route}
                  >
                    <img className="island-art" src={islandArtById[island.id]} alt="" />
                    <strong>{island.name}</strong>
                    <span>{island.description}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
