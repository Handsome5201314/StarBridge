import { BookOpen } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { cards } from '../../shared/data/cards'
import { useGameStore } from '../../shared/store/useGameStore'

export function CollectionPreview() {
  const { progress } = useGameStore()
  const collectedIds = new Set(progress.collectedCardIds)

  return (
    <Card className="collection-panel">
      <p className="section-label">图鉴收集</p>
      <div className="collection-header">
        <BookOpen />
        <strong>
          已收集 {progress.collectedCardIds.length}/{cards.length} 张卡片
        </strong>
      </div>
      <div className="card-collection">
        {cards.map((card) => {
          const collected = collectedIds.has(card.id)
          return (
            <article
              className={collected ? 'collection-card' : 'collection-card is-locked'}
              key={card.id}
            >
              <strong>{collected ? card.name : '待收集'}</strong>
              <span>{collected ? card.description : '完成对应关卡后解锁'}</span>
              {collected ? <SpeakButton text={card.voiceText} label="朗读" /> : null}
            </article>
          )
        })}
      </div>
    </Card>
  )
}
