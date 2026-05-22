import { Check, Clock } from 'lucide-react'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { useGameStore } from '../../shared/store/useGameStore'

export function ParentFeedbackPanel() {
  const { progress, actions } = useGameStore()

  return (
    <Card className="feedback-panel">
      <p className="section-label">家长反馈</p>
      <h2>今天的练习情况如何？</h2>
      <div className="feedback-task-list">
        {progress.realLifeTasks.length ? (
          progress.realLifeTasks.map((task) => (
            <article className="feedback-task" key={task.id}>
              <span className={task.status === 'done' ? 'task-status is-done' : 'task-status'}>
                {task.status === 'done' ? <Check /> : <Clock />}
              </span>
              <div>
                <strong>{task.title}</strong>
                <span>{task.suggestion}</span>
              </div>
              <Button
                variant={task.status === 'done' ? 'secondary' : 'primary'}
                onClick={() => actions.completeRealLifeTask(task.id)}
              >
                {task.status === 'done' ? '已练习' : '标记已练习'}
              </Button>
            </article>
          ))
        ) : (
          <p>完成一个儿童端关卡后，家长端会自动生成现实练习任务。</p>
        )}
      </div>
      <p className="feedback-note">
        家长标记“已练习”后，星光小鹿会获得额外成长值，形成现实练习回流。
      </p>
    </Card>
  )
}
