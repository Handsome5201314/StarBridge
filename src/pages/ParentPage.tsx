import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import panelArt from '../assets/parent/parent-advice-panel.png'
import parentBg from '../assets/parent/parent-papercraft-bg.png'
import { AIPracticeSuggestions } from '../features/parent/AIPracticeSuggestions'
import { ParentFeedbackPanel } from '../features/parent/ParentFeedbackPanel'
import { SocialGeneralizationHub } from '../features/parent/SocialGeneralizationHub'
import { PageShell } from '../shared/components/PageShell'
import { useGameStore } from '../shared/store/useGameStore'
import {
  getDeepseekParentAdvice,
  getFallbackParentAdvice,
  getTodaySkillLabels,
  type ParentAdviceResult,
} from '../shared/utils/parentAdvice'

type AdviceState =
  | { status: 'loading'; content: string; source: 'deepseek' | 'fallback' }
  | { status: 'ready'; content: string; source: 'deepseek' | 'fallback' }

type AdviceResultState = {
  key: string
  result: ParentAdviceResult
}

export function ParentPage() {
  const { progress } = useGameStore()
  const skills = useMemo(() => getTodaySkillLabels(progress), [progress])
  const fallbackAdvice = useMemo(() => getFallbackParentAdvice(progress), [progress])
  const adviceKey = useMemo(
    () =>
      JSON.stringify({
        cards: progress.collectedCardIds,
        levels: progress.completedLevelIds,
        skills: progress.todaySkillTags,
      }),
    [progress.collectedCardIds, progress.completedLevelIds, progress.todaySkillTags],
  )
  const [adviceResult, setAdviceResult] = useState<AdviceResultState | null>(null)
  const currentAdviceResult = adviceResult?.key === adviceKey ? adviceResult.result : null
  const advice: AdviceState = currentAdviceResult
    ? { status: 'ready', content: currentAdviceResult.content, source: currentAdviceResult.source }
    : { status: 'loading', content: fallbackAdvice, source: 'fallback' }
  const shellStyle = {
    '--parent-background-image': `url(${parentBg})`,
  } as CSSProperties

  useEffect(() => {
    let isCurrent = true

    getDeepseekParentAdvice(progress)
      .then((result: ParentAdviceResult) => {
        if (!isCurrent) return
        setAdviceResult({ key: adviceKey, result })
      })
      .catch(() => {
        if (!isCurrent) return
        setAdviceResult({
          key: adviceKey,
          result: { content: fallbackAdvice, source: 'fallback' },
        })
      })

    return () => {
      isCurrent = false
    }
  }, [adviceKey, fallbackAdvice, progress])

  return (
    <PageShell
      activePath="/parent"
      className="app-shell-parent-bg"
      contentClassName="parent-advice-main"
      style={shellStyle}
    >
      <section className="parent-advice-hero" aria-labelledby="parent-advice-title">
        <div className="parent-advice-title-block">
          <h1 id="parent-advice-title">AI 陪练建议</h1>
          <div className="parent-advice-divider" aria-hidden="true">
            <span />
          </div>
        </div>

        <article
          className="parent-advice-paper"
          key={advice.content}
          style={{ backgroundImage: `url(${panelArt})` }}
        >
          <p className="parent-ai-kicker">AI 文字建议</p>

          <section className="parent-advice-section" aria-labelledby="today-skills-title">
            <h2 id="today-skills-title">今日在游戏中学习的技能</h2>
            <ul>
              {skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>

          <hr />

          <section className="parent-advice-section" aria-labelledby="transfer-advice-title">
            <h2 id="transfer-advice-title">现实迁移建议</h2>
            <p aria-busy={advice.status === 'loading'}>{advice.content}</p>
          </section>
        </article>
      </section>

      <section className="parent-fallback-practice" aria-label="现实练习与回流">
        <SocialGeneralizationHub />
        <AIPracticeSuggestions />
        <ParentFeedbackPanel />
      </section>
    </PageShell>
  )
}
