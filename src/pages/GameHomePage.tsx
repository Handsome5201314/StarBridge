import { Link } from 'react-router-dom'
import { Medal, Sparkles, Star } from 'lucide-react'
import { Button } from '../shared/components/Button'
import { Card } from '../shared/components/Card'
import { PageShell } from '../shared/components/PageShell'
import { artAssets, islandArtById } from '../shared/assets/art'
import { islands } from '../shared/data/islands'
import { useGameStore } from '../shared/store/useGameStore'
import { getRecommendedLevel } from '../shared/utils/progress'

export function GameHomePage() {
  const { progress, actions } = useGameStore()
  const recommendedLevel = getRecommendedLevel(progress)
  const recommendedIsland = islands.find((island) => island.id === recommendedLevel.islandId)

  return (
    <PageShell activePath="/game">
      <section className="hero-grid" aria-labelledby="home-title">
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
              <Button as={Link} to={`/level/${recommendedLevel.id}`} icon={<Star size={22} />}>
                开始今日任务
              </Button>
              <Button variant="ghost" onClick={actions.resetDemoProgress}>
                重置 Demo 进度
              </Button>
            </div>
          </div>
          <img className="buddy-art" src={artAssets.deer} alt="" />
        </Card>

        <Card className="goal-card">
          <p className="section-label">今日目标</p>
          <div className="goal-stars" aria-label="今日目标 3 颗星">
            <Star />
            <Star />
            <Star />
          </div>
          <strong>收集 3 颗星星</strong>
          <span>今日已收集：{progress.todayStars} 颗</span>
        </Card>
      </section>

      <section className="world-layout" aria-labelledby="map-title">
        <Card className="side-rail" aria-label="功能入口">
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

        <Card className="current-level-card">
          <img className="current-level-art" src={artAssets.currentLevel} alt="" />
          <p className="section-label">当前关卡</p>
          <h2>{recommendedIsland?.name}</h2>
          <p>{recommendedLevel.title}</p>
          <Button as={Link} to={`/level/${recommendedLevel.id}`}>
            进入关卡
          </Button>
        </Card>
      </section>
    </PageShell>
  )
}
