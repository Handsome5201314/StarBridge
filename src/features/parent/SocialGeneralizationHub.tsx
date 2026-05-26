import { useEffect, useState } from 'react'
import { BrainCircuit, Mic2, Radar, SlidersHorizontal } from 'lucide-react'
import {
  createSceneCoachRemote,
  createVoiceProfileRemote,
  getStoredSessionToken,
  loadLearnerProfile,
  sendSensorEventRemote,
  type SceneCoachResponse,
} from '../../shared/services/apiClient'
import type { LearnerProfile, PromptLevel, SensorMetric, SensorModality } from '../../shared/types/game'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'

const promptLevels: Array<{ label: string; value: PromptLevel }> = [
  { label: '少提示', value: 'low' },
  { label: '中提示', value: 'medium' },
  { label: '多提示', value: 'high' },
]

const sensorSamples: Array<{
  label: string
  metric: SensorMetric
  modality: SensorModality
  value: number | string
}> = [
  { label: '视觉：看向任务', modality: 'camera', metric: 'gaze_on_task', value: 0.82 },
  { label: '麦克风：轮流回应', modality: 'microphone', metric: 'turn_taking', value: 0.7 },
  { label: '可穿戴：唤醒区间', modality: 'wearable', metric: 'hr_zone', value: 'calm' },
  { label: '环境：噪声较低', modality: 'environment', metric: 'noise_level', value: 42 },
]

export function SocialGeneralizationHub() {
  const [promptLevel, setPromptLevel] = useState<PromptLevel>('medium')
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [coach, setCoach] = useState<SceneCoachResponse | null>(null)
  const [voiceStatus, setVoiceStatus] = useState('未创建声音档案')
  const [sensorStatus, setSensorStatus] = useState('传感器接口处于模拟模式')

  useEffect(() => {
    const sessionToken = getStoredSessionToken()
    if (!sessionToken) return

    loadLearnerProfile(sessionToken)
      .then(setProfile)
      .catch(() => {
        setProfile(null)
      })
  }, [])

  async function generateCoach() {
    const sessionToken = getStoredSessionToken()
    if (!sessionToken) {
      setCoach({
        source: 'fallback',
        artifact: {
          sceneId: 'shopping-market',
          title: '购物小镇课前脚本',
          targetSkill: 'social_generalization',
          promptLevel,
          roleCards: [],
          homePractice: '服务端未连接时，仍可用固定超市任务做家庭练习。',
          reflectionQuestions: ['孩子在哪一步最需要提示？'],
          safetyNotes: ['不做诊断或疗效承诺。'],
        },
      })
      return
    }

    const result = await createSceneCoachRemote(sessionToken, {
      sceneId: 'shopping-market',
      targetSkill: 'social_generalization',
      promptLevel,
    })
    setCoach(result)
  }

  async function createVoiceProfile() {
    const sessionToken = getStoredSessionToken()
    if (!sessionToken) {
      setVoiceStatus('当前没有服务端会话，暂用浏览器默认朗读。')
      return
    }

    try {
      const profile = await createVoiceProfileRemote(sessionToken, {
        displayName: '熟悉家人声音',
        consentGranted: true,
        purpose: 'guardian_prompt',
      })
      setVoiceStatus(`${profile.displayName} 已创建，供应商密钥仍只在服务端使用。`)
    } catch {
      setVoiceStatus('声音档案创建失败，请确认监护人同意和 API 服务状态。')
    }
  }

  async function sendSensorSample(sample: (typeof sensorSamples)[number]) {
    const sessionToken = getStoredSessionToken()
    if (!sessionToken) {
      setSensorStatus(`${sample.label} 已在本地模拟，不保存原始音视频。`)
      return
    }

    try {
      const response = await sendSensorEventRemote(sessionToken, {
        modality: sample.modality,
        metric: sample.metric,
        value: sample.value,
        confidence: 0.76,
      })
      setSensorStatus(
        response.accepted
          ? `${sample.label} 已记录为脱敏派生指标。`
          : '传感器事件未被接受。',
      )
    } catch {
      setSensorStatus('传感器模拟事件发送失败，真实硬件接入前不影响练习。')
    }
  }

  return (
    <section className="social-hub-grid" aria-label="社交泛化设置">
      <Card className="social-hub-card">
        <div className="social-hub-heading">
          <BrainCircuit size={24} />
          <div>
            <p className="section-label">AI 原生教具</p>
            <h2>超市社交泛化设置</h2>
          </div>
        </div>
        <p>
          当前定位：{profile?.ageBand ?? '7+'}，目标是把游戏内的清单、询问、排队和礼貌结束迁移到真实生活。
        </p>
        <div className="prompt-level-control" aria-label="提示强度">
          {promptLevels.map((level) => (
            <button
              className={promptLevel === level.value ? 'is-selected' : ''}
              key={level.value}
              type="button"
              onClick={() => setPromptLevel(level.value)}
            >
              {level.label}
            </button>
          ))}
        </div>
        <Button icon={<SlidersHorizontal size={18} />} onClick={() => void generateCoach()}>
          生成课前脚本与复盘
        </Button>
      </Card>

      <Card className="social-hub-card coach-artifact-card">
        <p className="section-label">AI Scene Coach</p>
        <h2>{coach?.artifact.title ?? '等待生成建议'}</h2>
        <p>{coach?.artifact.homePractice ?? '生成后会得到角色卡、家庭练习和复盘问题；AI 不做儿童能力诊断。'}</p>
        {coach ? (
          <>
            <div className="role-card-list">
              {coach.artifact.roleCards.map((role) => (
                <span key={role.id}>{role.role}</span>
              ))}
            </div>
            <ul className="reflection-list">
              {coach.artifact.reflectionQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Card>

      <Card className="social-hub-card">
        <div className="social-hub-heading">
          <Mic2 size={23} />
          <div>
            <p className="section-label">熟悉声音</p>
            <h2>声音克隆接口预留</h2>
          </div>
        </div>
        <p>{voiceStatus}</p>
        <Button variant="secondary" onClick={() => void createVoiceProfile()}>
          创建监护人同意档案
        </Button>
      </Card>

      <Card className="social-hub-card">
        <div className="social-hub-heading">
          <Radar size={23} />
          <div>
            <p className="section-label">SensorBridge</p>
            <h2>硬件辅助模拟</h2>
          </div>
        </div>
        <p>{sensorStatus}</p>
        <div className="sensor-sample-grid">
          {sensorSamples.map((sample) => (
            <button key={`${sample.modality}-${sample.metric}`} type="button" onClick={() => void sendSensorSample(sample)}>
              {sample.label}
            </button>
          ))}
        </div>
      </Card>
    </section>
  )
}
