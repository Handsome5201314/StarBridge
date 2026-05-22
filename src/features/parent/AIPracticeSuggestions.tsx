import { Bot } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { useGameStore } from '../../shared/store/useGameStore'
import { getFallbackPracticeSuggestions } from '../../shared/utils/practice'
import { skillLabels } from '../../shared/utils/progress'

export function AIPracticeSuggestions() {
  const { progress } = useGameStore()
  const suggestions = getFallbackPracticeSuggestions({
    completedLevelIds: progress.completedLevelIds,
    skillTags: progress.todaySkillTags,
    collectedCardIds: progress.collectedCardIds,
  })

  return (
    <Card className="practice-panel">
      <div className="practice-heading">
        <Bot />
        <div>
          <p className="section-label">AI 陪练建议</p>
          <h2>基于今天的学习表现，为您推荐 3 个生活练习</h2>
        </div>
      </div>
      <div className="practice-list">
        {suggestions.map((suggestion, index) => (
          <article className="practice-item" key={suggestion.id}>
            <span className="practice-index">{index + 1}</span>
            <div>
              <strong>{suggestion.title}</strong>
              <p>{suggestion.scenario}</p>
              <ol>
                {suggestion.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <span className="practice-tip">
                {skillLabels[suggestion.relatedSkill]}：{suggestion.parentTip}
              </span>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
