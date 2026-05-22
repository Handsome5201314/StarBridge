import { CheckCircle2 } from 'lucide-react'
import { Card } from '../../shared/components/Card'
import { useGameStore } from '../../shared/store/useGameStore'
import { skillDescriptions, skillLabels } from '../../shared/utils/progress'

export function TodayLearningSummary() {
  const { progress } = useGameStore()
  const skills = progress.todaySkillTags

  return (
    <Card className="learning-summary">
      <p className="section-label">今日学习摘要</p>
      {skills.length ? (
        <div className="skill-list">
          {skills.map((skill) => (
            <article className="skill-row" key={skill}>
              <CheckCircle2 />
              <div>
                <strong>{skillLabels[skill]}</strong>
                <span>{skillDescriptions[skill]}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>孩子完成关卡后，这里会显示今天练习过的能力。</p>
      )}
    </Card>
  )
}
