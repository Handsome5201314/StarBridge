import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { GameDashboardFrame } from '../features/game-map/GameDashboardFrame'
import { Card } from '../shared/components/Card'
import { artAssets, mapIslandAssets } from '../shared/assets/art'

type MapNode = {
  id: string
  title: string
  description: string
  status: string
  route?: string
  art: string
  x: string
  y: string
  width: string
}

const mapNodes: MapNode[] = [
  {
    id: 'greeting',
    title: '问候岛',
    description: '练习看见别人时的友好表达。',
    status: '已开放',
    route: '/level/greeting-basic-01',
    art: mapIslandAssets.greeting,
    x: '23%',
    y: '30%',
    width: '22%',
  },
  {
    id: 'emotion-lake',
    title: '情绪湖',
    description: '认识情绪，也学习说出自己的感受。',
    status: '已开放',
    route: '/level/emotion-basic-01',
    art: mapIslandAssets.emotionLake,
    x: '76%',
    y: '31%',
    width: '24%',
  },
  {
    id: 'help-valley',
    title: '求助山谷',
    description: '看见困难，找到可靠的人，清楚说出需要的帮助。',
    status: '已开放',
    route: '/level/help-basic-01',
    art: mapIslandAssets.helpValley,
    x: '48%',
    y: '51%',
    width: '22%',
  },
  {
    id: 'starlight-market',
    title: '星光超市',
    description: '根据任务选择合适商品，拖进购物车。',
    status: '已开放',
    route: '/level/market-basic-01',
    art: mapIslandAssets.starlightMarket,
    x: '24%',
    y: '70%',
    width: '23%',
  },
  {
    id: 'shopping-town',
    title: '购物小镇',
    description: '在超市里练习看清单、询问店员、排队结账和礼貌结束。',
    status: '新开放',
    route: '/level/shopping-market-basic-01',
    art: mapIslandAssets.queueCastle,
    x: '50%',
    y: '73%',
    width: '21%',
  },
  {
    id: 'sentence-blocks',
    title: '句子积木岛',
    description: '用词语积木拼出自己的想法。',
    status: '已开放',
    route: '/level/sentence-basic-01',
    art: mapIslandAssets.sentenceBlocks,
    x: '74%',
    y: '70%',
    width: '24%',
  },
]

export function GameHomePage() {
  const [selectedNodeId, setSelectedNodeId] = useState(mapNodes[0].id)
  const selectedNode = mapNodes.find((node) => node.id === selectedNodeId) ?? mapNodes[0]

  return (
    <GameDashboardFrame activeRail="map">
      <section className="world-layout world-layout-map-only home-world-slot" aria-label="星桥地图">
        <Card className="adventure-map-panel">
          <div className="storybook-map" aria-label="星桥计划岛屿地图">
            <div
              className="map-paper-stage"
              style={{ '--map-stage-background': `url(${artAssets.mapBackground})` } as CSSProperties}
            >
              {mapNodes.map((node) => {
                const isActive = selectedNode.id === node.id
                const nodeStyle = {
                  left: node.x,
                  top: node.y,
                  width: node.width,
                } as CSSProperties

                return (
                  <div className="map-node-shell" key={node.id} style={nodeStyle}>
                    <button
                      className={isActive ? 'map-node is-active' : 'map-node'}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={`选择${node.title}，${node.status}`}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      <img className="map-node-image" src={node.art} alt="" />
                      <span className="map-node-label">
                        <MapPin size={18} aria-hidden="true" />
                        <strong>{node.title}</strong>
                        <small>{node.status}</small>
                      </span>
                    </button>
                    {isActive && node.route ? (
                      <Link className="map-node-play" to={node.route} aria-label={`开始探索${node.title}`}>
                        ▷
                      </Link>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </section>
    </GameDashboardFrame>
  )
}
