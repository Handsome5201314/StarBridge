import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'

import { createApiApp } from './app'
import { createInMemoryRepository } from './repositories/inMemoryRepository'

type TestServer = {
  baseUrl: string
  close(): Promise<void>
}

before(() => {
  process.env.DEEPSEEK_API_KEY = ''
})

after(() => {
  delete process.env.DEEPSEEK_API_KEY
})

test('invite claim creates a session and bootstrap returns existing StarBridge content', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'DEMO-ONE', status: 'active', maxUses: 1 }],
    }),
  }))

  try {
    const claim = await requestJson<{ sessionToken: string; child: { nickname: string } }>(server, '/api/invites/claim', {
      method: 'POST',
      body: { code: 'DEMO-ONE', childNickname: '小星' },
    })

    assert.equal(claim.child.nickname, '小星')
    assert.match(claim.sessionToken, /^sb_/)

    const bootstrap = await requestJson<{
      islands: unknown[]
      levels: unknown[]
      progress: { totalStars: number }
    }>(server, '/api/game/bootstrap', {
      token: claim.sessionToken,
    })

    assert.equal(bootstrap.islands.length, 6)
    assert.equal(bootstrap.levels.length > 4, true)
    assert.equal(
      bootstrap.islands.some((island) =>
        Boolean(island && typeof island === 'object' && 'id' in island && island.id === 'shopping_market'),
      ),
      true,
    )
    assert.equal(bootstrap.progress.totalStars, 0)
  } finally {
    await server.close()
  }
})

test('invite claim rejects expired, revoked, and exhausted invite codes', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      now: () => new Date('2026-05-26T00:00:00.000Z'),
      invites: [
        { code: 'EXPIRED', status: 'active', maxUses: 1, expiresAt: '2026-01-01T00:00:00.000Z' },
        { code: 'REVOKED', status: 'revoked', maxUses: 1 },
        { code: 'USED', status: 'active', maxUses: 1, usedCount: 1 },
      ],
    }),
  }))

  await requestJson(server, '/api/invites/claim', { method: 'POST', body: { code: 'EXPIRED' }, expectedStatus: 410 })
  await requestJson(server, '/api/invites/claim', { method: 'POST', body: { code: 'REVOKED' }, expectedStatus: 403 })
  await requestJson(server, '/api/invites/claim', { method: 'POST', body: { code: 'USED' }, expectedStatus: 409 })

  await server.close()
})

test('level completion uses current reward rules and creates a parent task once', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'LEVEL', status: 'active', maxUses: 1 }],
    }),
  }))
  const claim = await claimInvite(server, 'LEVEL')

  const completion = await requestJson<{
    alreadyCompleted: boolean
    progress: { totalStars: number; collectedCardIds: string[]; realLifeTasks: Array<{ id: string }> }
  }>(server, '/api/levels/sentence-basic-01/complete', {
    method: 'POST',
    token: claim.sessionToken,
    body: { completedFrom: 'test' },
  })

  assert.equal(completion.alreadyCompleted, false)
  assert.equal(completion.progress.totalStars, 1)
  assert.deepEqual(completion.progress.collectedCardIds, ['want-cookie'])
  assert.equal(completion.progress.realLifeTasks.length, 1)

  const repeat = await requestJson<typeof completion>(server, '/api/levels/sentence-basic-01/complete', {
    method: 'POST',
    token: claim.sessionToken,
    body: { completedFrom: 'test' },
  })

  assert.equal(repeat.alreadyCompleted, true)
  assert.equal(repeat.progress.totalStars, 1)
  assert.equal(repeat.progress.realLifeTasks.length, 1)

  await server.close()
})

test('real-life task completion is idempotent and scoped to the current session', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [
        { code: 'FAMILY-A', status: 'active', maxUses: 1 },
        { code: 'FAMILY-B', status: 'active', maxUses: 1 },
      ],
    }),
  }))
  const familyA = await claimInvite(server, 'FAMILY-A')
  const familyB = await claimInvite(server, 'FAMILY-B')

  const completion = await requestJson<{
    progress: { buddyGrowth: { exp: number }; realLifeTasks: Array<{ id: string }> }
  }>(server, '/api/levels/help-basic-01/complete', {
    method: 'POST',
    token: familyA.sessionToken,
    body: {},
  })
  const taskId = completion.progress.realLifeTasks[0]?.id
  assert.equal(typeof taskId, 'string')

  const done = await requestJson<{
    alreadyCompleted: boolean
    progress: { buddyGrowth: { exp: number } }
  }>(server, `/api/real-life-tasks/${taskId}/complete`, {
    method: 'POST',
    token: familyA.sessionToken,
    body: {},
  })
  const repeat = await requestJson<typeof done>(server, `/api/real-life-tasks/${taskId}/complete`, {
    method: 'POST',
    token: familyA.sessionToken,
    body: {},
  })

  assert.equal(done.alreadyCompleted, false)
  assert.equal(done.progress.buddyGrowth.exp, 10)
  assert.equal(repeat.alreadyCompleted, true)
  assert.equal(repeat.progress.buddyGrowth.exp, 10)

  await requestJson(server, `/api/real-life-tasks/${taskId}/complete`, {
    method: 'POST',
    token: familyB.sessionToken,
    body: {},
    expectedStatus: 404,
  })

  await server.close()
})

test('parent advice keeps deterministic fallback when no model provider is configured', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'ADVICE', status: 'active', maxUses: 1 }],
    }),
  }))
  const claim = await claimInvite(server, 'ADVICE')

  const advice = await requestJson<{ source: string; content: string }>(server, '/api/parent-advice', {
    method: 'POST',
    token: claim.sessionToken,
    body: {},
  })

  assert.equal(advice.source, 'fallback')
  assert.match(advice.content, /自然生活场景|清晰选项/)

  await server.close()
})

test('shopping scene progresses deterministically and creates transfer work without AI judging the child', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'SCENE', status: 'active', maxUses: 1 }],
    }),
  }))
  try {
    const claim = await claimInvite(server, 'SCENE')

    const learnerProfile = await requestJson<{
      ageBand: string
      generalizationGoals: string[]
      preferredVoice: string
    }>(server, '/api/learner-profile', {
      token: claim.sessionToken,
    })
    assert.equal(learnerProfile.ageBand, '7+')
    assert.deepEqual(learnerProfile.generalizationGoals, ['supermarket_social_generalization'])
    assert.equal(learnerProfile.preferredVoice, 'guardian_familiar')

    const start = await requestJson<{
      attemptId: string
      script: {
        sceneId: string
        title: string
        steps: Array<{ id: string; expectedChoiceId: string }>
      }
      nextStep: { id: string }
    }>(server, '/api/scenes/shopping-market/start', {
      method: 'POST',
      token: claim.sessionToken,
      body: { promptLevel: 'medium', targetSkill: 'social_generalization' },
    })

    assert.match(start.attemptId, /^attempt_/)
    assert.equal(start.script.sceneId, 'shopping-market')
    assert.equal(start.script.title, '购物小镇：买酸奶任务')
    assert.equal(start.script.steps.length, 5)
    assert.equal(start.nextStep.id, 'prepare-list')

    const wrong = await requestJson<{
      accepted: boolean
      completed: boolean
      nextStep: { id: string }
      progress: { totalStars: number; completedLevelIds: string[] }
    }>(server, '/api/scenes/shopping-market/steps/prepare-list/respond', {
      method: 'POST',
      token: claim.sessionToken,
      body: { attemptId: start.attemptId, choiceId: 'ignore-list' },
    })

    assert.equal(wrong.accepted, false)
    assert.equal(wrong.completed, false)
    assert.equal(wrong.nextStep.id, 'prepare-list')
    assert.equal(wrong.progress.totalStars, 0)
    assert.deepEqual(wrong.progress.completedLevelIds, [])

    let nextStepId = 'prepare-list'
    let sceneProgress: {
      totalStars: number
      completedLevelIds: string[]
      collectedCardIds: string[]
      realLifeTasks: Array<{ id: string; title: string; skillTag: string }>
    } = { ...wrong.progress, collectedCardIds: [], realLifeTasks: [] }
    for (const step of start.script.steps) {
      assert.equal(nextStepId, step.id)
      const response = await requestJson<{
        accepted: boolean
        completed: boolean
        nextStep: { id: string } | null
        progress: {
          totalStars: number
          completedLevelIds: string[]
          collectedCardIds: string[]
          realLifeTasks: Array<{ id: string; title: string; skillTag: string }>
        }
      }>(server, `/api/scenes/shopping-market/steps/${step.id}/respond`, {
        method: 'POST',
        token: claim.sessionToken,
        body: { attemptId: start.attemptId, choiceId: step.expectedChoiceId },
      })

      assert.equal(response.accepted, true)
      sceneProgress = response.progress
      nextStepId = response.nextStep?.id ?? ''
    }

    assert.equal(sceneProgress.totalStars, 2)
    assert.deepEqual(sceneProgress.completedLevelIds, ['shopping-market-basic-01'])
    assert.deepEqual(sceneProgress.collectedCardIds, ['shopping-list-helper'])
    assert.equal(sceneProgress.realLifeTasks[0]?.id, 'task-shopping-market-basic-01')
    assert.equal(sceneProgress.realLifeTasks[0]?.skillTag, 'social_generalization')
  } finally {
    await server.close()
  }
})

test('AI scene coach falls back safely and blocks unsafe scene tags', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'COACH', status: 'active', maxUses: 1 }],
    }),
  }))
  try {
    const claim = await claimInvite(server, 'COACH')

    const coach = await requestJson<{
      source: string
      artifact: {
        sceneId: string
        title: string
        roleCards: Array<{ role: string }>
        homePractice: string
        safetyNotes: string[]
      }
    }>(server, '/api/ai/scene-coach', {
      method: 'POST',
      token: claim.sessionToken,
      body: {
        sceneId: 'shopping-market',
        targetSkill: 'social_generalization',
        promptLevel: 'medium',
      },
    })

    assert.equal(coach.source, 'fallback')
    assert.equal(coach.artifact.sceneId, 'shopping-market')
    assert.equal(coach.artifact.roleCards.length >= 3, true)
    assert.match(coach.artifact.homePractice, /真实超市|小卖部/)
    assert.equal(coach.artifact.safetyNotes.some((note) => note.includes('诊断')), true)

    await requestJson(server, '/api/ai/scene-coach', {
      method: 'POST',
      token: claim.sessionToken,
      body: {
        sceneId: 'lake-crossing',
        unsafeTags: ['water'],
        targetSkill: 'social_generalization',
      },
      expectedStatus: 400,
    })
  } finally {
    await server.close()
  }
})

test('voice profiles require guardian consent and synthesis degrades without provider secrets', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'VOICE', status: 'active', maxUses: 1 }],
    }),
  }))
  try {
    const claim = await claimInvite(server, 'VOICE')

    await requestJson(server, '/api/voice/profiles', {
      method: 'POST',
      token: claim.sessionToken,
      body: { displayName: '妈妈声音', consentGranted: false, purpose: 'guardian_prompt' },
      expectedStatus: 400,
    })

    const profile = await requestJson<{
      id: string
      displayName: string
      consentGranted: boolean
      status: string
      providerProfileId?: string
    }>(server, '/api/voice/profiles', {
      method: 'POST',
      token: claim.sessionToken,
      body: { displayName: '妈妈声音', consentGranted: true, purpose: 'guardian_prompt' },
    })

    assert.match(profile.id, /^voice_/)
    assert.equal(profile.displayName, '妈妈声音')
    assert.equal(profile.consentGranted, true)
    assert.equal(profile.status, 'ready')
    assert.equal('providerProfileId' in profile, false)

    const synthesis = await requestJson<{
      fallback: boolean
      fallbackReason: string
      audioUrl: string | null
      safeText: string
    }>(server, '/api/voice/synthesize', {
      method: 'POST',
      token: claim.sessionToken,
      body: { voiceProfileId: profile.id, text: '请看购物清单。' },
    })

    assert.equal(synthesis.fallback, true)
    assert.equal(synthesis.fallbackReason, 'provider_not_configured')
    assert.equal(synthesis.audioUrl, null)
    assert.equal(synthesis.safeText, '请看购物清单。')
  } finally {
    await server.close()
  }
})

test('sensor bridge accepts derived metrics and rejects raw media payloads', async () => {
  const server = await listen(createApiApp({
    repository: createInMemoryRepository({
      invites: [{ code: 'SENSOR', status: 'active', maxUses: 1 }],
    }),
  }))
  try {
    const claim = await claimInvite(server, 'SENSOR')

    const event = await requestJson<{
      accepted: boolean
      event: { modality: string; metric: string; confidence: number; rawMediaStored: boolean }
    }>(server, '/api/sensor-events', {
      method: 'POST',
      token: claim.sessionToken,
      body: {
        modality: 'camera',
        metric: 'gaze_on_task',
        value: 0.82,
        confidence: 0.74,
        recordedAt: '2026-05-26T10:00:00.000Z',
      },
    })

    assert.equal(event.accepted, true)
    assert.equal(event.event.modality, 'camera')
    assert.equal(event.event.metric, 'gaze_on_task')
    assert.equal(event.event.confidence, 0.74)
    assert.equal(event.event.rawMediaStored, false)

    await requestJson(server, '/api/sensor-events', {
      method: 'POST',
      token: claim.sessionToken,
      body: {
        modality: 'camera',
        metric: 'gaze_on_task',
        value: 0.5,
        confidence: 0.6,
        rawVideoBase64: 'AAAA',
      },
      expectedStatus: 400,
    })
  } finally {
    await server.close()
  }
})

test('legacy sentence and emotion progress endpoints remain available behind the API proxy', async () => {
  const server = await listen(createApiApp())

  try {
    const emptySentence = await requestJson<{
      expressionStars: number
      completedLevelIds: string[]
    }>(server, '/api/sentence-progress')

    assert.equal(emptySentence.expressionStars, 0)
    assert.deepEqual(emptySentence.completedLevelIds, [])

    const sentenceProgress = await requestJson<{
      expressionStars: number
      completedLevelIds: string[]
      records: unknown[]
    }>(server, '/api/sentence-progress/complete', {
      method: 'POST',
      body: {
        levelId: 'sentence-basic-01',
        levelTitle: '我想要水',
        difficulty: 'basic',
        sentence: '我想要水。',
        selectedLabels: ['我', '想要', '水'],
        expressionStarsEarned: 1,
        completedAt: '2026-05-26T00:00:00.000Z',
      },
    })

    assert.equal(sentenceProgress.expressionStars, 1)
    assert.deepEqual(sentenceProgress.completedLevelIds, ['sentence-basic-01'])
    assert.equal(sentenceProgress.records.length, 1)

    const emptyEmotion = await requestJson<{
      emotionGems: number
      completedLevelIds: string[]
    }>(server, '/api/emotion-progress')

    assert.equal(emptyEmotion.emotionGems, 0)
    assert.deepEqual(emptyEmotion.completedLevelIds, [])

    const emotionProgress = await requestJson<{
      emotionGems: number
      completedLevelIds: string[]
      records: unknown[]
    }>(server, '/api/emotion-progress/complete', {
      method: 'POST',
      body: {
        levelId: 'emotion-basic-01',
        levelTitle: '开心和难过',
        difficulty: 'basic',
        matchedPairs: [
          {
            pairId: 'happy-rabbit',
            animal: '小兔',
            emotion: '开心',
            intro: '开心时嘴角会上扬，眼睛也会亮亮的。',
          },
        ],
        emotionGemsEarned: 1,
        completedAt: '2026-05-26T00:00:00.000Z',
      },
    })

    assert.equal(emotionProgress.emotionGems, 1)
    assert.deepEqual(emotionProgress.completedLevelIds, ['emotion-basic-01'])
    assert.equal(emotionProgress.records.length, 1)
  } finally {
    await server.close()
  }
})

async function claimInvite(server: TestServer, code: string) {
  return requestJson<{ sessionToken: string }>(server, '/api/invites/claim', {
    method: 'POST',
    body: { code, childNickname: '星桥小朋友' },
  })
}

async function listen(app: { listen: (port: number, callback: () => void) => Server }): Promise<TestServer> {
  const server = await new Promise<Server>((resolve) => {
    const nextServer = app.listen(0, () => resolve(nextServer))
  })

  const address = server.address() as AddressInfo
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  }
}

async function requestJson<T = unknown>(
  server: TestServer,
  path: string,
  options: {
    body?: unknown
    expectedStatus?: number
    method?: string
    token?: string
  } = {},
): Promise<T> {
  const response = await fetch(`${server.baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  assert.equal(response.status, options.expectedStatus ?? 200)
  return (await response.json()) as T
}
