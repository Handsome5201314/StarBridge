import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ListChecks, Mic2, ShoppingBasket, Sparkles } from 'lucide-react'
import { shoppingMarketScript } from '../../shared/data/sceneScripts'
import {
  getStoredSessionToken,
  respondToSceneStepRemote,
  startSceneRemote,
  synthesizeVoiceRemote,
  type SceneStartResponse,
} from '../../shared/services/apiClient'
import type { LevelComponentProps, SceneStep } from '../../shared/types/game'
import { Button } from '../../shared/components/Button'
import { SpeakButton } from '../../shared/components/SpeakButton'

type ScenarioState =
  | { status: 'loading' }
  | { status: 'ready'; attemptId: string; currentStep: SceneStep; script: SceneStartResponse['script'] }
  | { status: 'completed'; script: SceneStartResponse['script'] }
  | { status: 'offline'; currentStep: SceneStep; completedStepIds: string[] }

export function SocialScenarioGame({ levelId, onComplete, onExit }: LevelComponentProps) {
  const [scenario, setScenario] = useState<ScenarioState>({
    status: 'offline',
    currentStep: shoppingMarketScript.steps[0],
    completedStepIds: [],
  })
  const [feedback, setFeedback] = useState('先看清单，再开始购物任务。')
  const [voiceStatus, setVoiceStatus] = useState('熟悉声音接口已预留，本地会用安全默认朗读。')
  const completedCount = useMemo(() => {
    if (scenario.status === 'ready') {
      const currentIndex = scenario.script.steps.findIndex((step) => step.id === scenario.currentStep.id)
      return Math.max(0, currentIndex)
    }
    if (scenario.status === 'completed') {
      return scenario.script.steps.length
    }
    if (scenario.status === 'offline') {
      return scenario.completedStepIds.length
    }
    return 0
  }, [scenario])
  const totalSteps =
    scenario.status === 'ready' || scenario.status === 'completed'
      ? scenario.script.steps.length
      : shoppingMarketScript.steps.length
  const currentStep =
    scenario.status === 'ready' || scenario.status === 'offline' ? scenario.currentStep : null

  useEffect(() => {
    let isCurrent = true
    const sessionToken = getStoredSessionToken()

    if (!sessionToken) {
      return
    }

    startSceneRemote(sessionToken, 'shopping-market', {
      promptLevel: 'medium',
      targetSkill: 'social_generalization',
    })
      .then((response) => {
        if (!isCurrent) return
        setScenario({
          status: 'ready',
          attemptId: response.attemptId,
          currentStep: response.nextStep,
          script: response.script,
        })
      })
      .catch(() => {
        if (!isCurrent) return
        setScenario({
          status: 'offline',
          currentStep: shoppingMarketScript.steps[0],
          completedStepIds: [],
        })
      })

    return () => {
      isCurrent = false
    }
  }, [])

  async function chooseOption(choiceId: string) {
    if (!currentStep) return
    const choice = currentStep.choices.find((item) => item.id === choiceId)
    setFeedback(choice?.feedback ?? '我们再看一次场景。')

    if (scenario.status === 'ready') {
      const sessionToken = getStoredSessionToken()
      if (!sessionToken) return

      try {
        const response = await respondToSceneStepRemote(
          sessionToken,
          'shopping-market',
          currentStep.id,
          { attemptId: scenario.attemptId, choiceId },
        )

        if (!response.accepted) {
          setFeedback(choice?.feedback ?? '这个选择还不适合当前场景，我们再试一次。')
          return
        }

        setFeedback(choice?.npcReply ?? choice?.feedback ?? '完成这一步。')
        if (response.completed) {
          onComplete({
            levelId,
            islandId: 'shopping_market',
            difficulty: 'advanced',
            starsEarned: 2,
            cardsEarned: ['shopping-list-helper'],
            skillTags: ['social_generalization'],
            completedAt: new Date().toISOString(),
          })
          setScenario({ status: 'completed', script: scenario.script })
          return
        }

        if (response.nextStep) {
          setScenario({ ...scenario, currentStep: response.nextStep })
        }
      } catch {
        setFeedback('网络暂时不稳定，这次选择先保存在本地体验里。')
      }
      return
    }

    if (scenario.status === 'offline') {
      if (choiceId !== currentStep.expectedChoiceId) {
        return
      }
      const completedStepIds = [...scenario.completedStepIds, currentStep.id]
      const nextStep = shoppingMarketScript.steps.find((step) => !completedStepIds.includes(step.id))
      if (!nextStep) {
        onComplete({
          levelId,
          islandId: 'shopping_market',
          difficulty: 'advanced',
          starsEarned: 2,
          cardsEarned: ['shopping-list-helper'],
          skillTags: ['social_generalization'],
          completedAt: new Date().toISOString(),
        })
        setScenario({ status: 'completed', script: shoppingMarketScript })
        return
      }
      setScenario({ status: 'offline', currentStep: nextStep, completedStepIds })
    }
  }

  async function previewFamiliarVoice() {
    const text = currentStep?.prompt ?? '我们一起练习真实超市里的表达。'
    const sessionToken = getStoredSessionToken()
    if (!sessionToken) {
      setVoiceStatus('当前没有服务端会话，浏览器会使用默认朗读。')
      return
    }

    try {
      const response = await synthesizeVoiceRemote(sessionToken, { text })
      setVoiceStatus(
        response.fallback
          ? '声音克隆供应商未配置，已降级为安全默认朗读。'
          : '已使用服务端声音代理生成朗读。',
      )
    } catch {
      setVoiceStatus('声音代理暂不可用，儿童端仍可用默认朗读。')
    }
  }

  return (
    <main className="social-scenario-screen" aria-labelledby="shopping-scenario-title">
      <div className="scenario-topbar">
        <Button variant="ghost" icon={<ArrowLeft size={20} />} onClick={onExit}>
          返回地图
        </Button>
        <div className="scenario-progress" aria-label={`已完成 ${completedCount} / ${totalSteps} 步`}>
          <span style={{ width: `${Math.round((completedCount / totalSteps) * 100)}%` }} />
        </div>
      </div>

      <section className="scenario-market-stage">
        <div className="scenario-market-visual" aria-hidden="true">
          <div className="scenario-market-awning" />
          <div className="scenario-market-shelf scenario-shelf-a">
            <span>牛奶</span>
            <span>酸奶</span>
            <span>果汁</span>
          </div>
          <div className="scenario-market-shelf scenario-shelf-b">
            <span>苹果</span>
            <span>纸巾</span>
            <span>小票</span>
          </div>
          <div className="scenario-market-counter">结账台</div>
          <div className="scenario-market-helper">
            <ShoppingBasket size={36} />
          </div>
        </div>

        <article className="scenario-panel">
          <p className="section-label">7岁以上 · 社交泛化</p>
          <h1 id="shopping-scenario-title">购物小镇</h1>
          {scenario.status === 'loading' ? (
            <p>正在进入超市场景...</p>
          ) : currentStep ? (
            <>
              <div className="scenario-step-meta">
                <ListChecks size={20} />
                <span>
                  第 {completedCount + 1} 步 / {totalSteps}：{currentStep.title}
                </span>
              </div>
              <p className="scenario-text">{currentStep.sceneText}</p>
              <div className="scenario-prompt-row">
                <p>{currentStep.prompt}</p>
                <SpeakButton text={currentStep.prompt} label="朗读提示" />
              </div>
              <div className="scenario-choice-grid">
                {currentStep.choices.map((choice) => (
                  <button
                    className="scenario-choice"
                    key={choice.id}
                    type="button"
                    onClick={() => void chooseOption(choice.id)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="scenario-complete">
              <CheckCircle2 size={44} />
              <h2>完成购物小镇任务</h2>
              <p>星星、卡片和真实超市打卡任务已经同步到成就页和家长端。</p>
            </div>
          )}

          <div className="scenario-feedback" aria-live="polite">
            <Sparkles size={18} />
            <span>{feedback}</span>
          </div>

          <div className="scenario-voice-box">
            <Mic2 size={18} />
            <span>{voiceStatus}</span>
            <Button variant="secondary" onClick={() => void previewFamiliarVoice()}>
              试用声音代理
            </Button>
          </div>
        </article>
      </section>
    </main>
  )
}
