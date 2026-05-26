import express, { type NextFunction, type Request, type Response } from 'express'

import { requireSession, type SessionRequest } from './middleware/session'
import { createInMemoryRepository } from './repositories/inMemoryRepository'
import type { StarBridgeRepository } from './repositories/types'
import {
  appendSensorEventForSession,
  createSceneCoachArtifact,
  createVoiceProfileForSession,
  synthesizeVoiceForSession,
} from './services/aiNativeService'
import {
  buildBootstrap,
  completeLevelForSession,
  completeRealLifeTaskForSession,
  createParentAdvice,
} from './services/gameService'
import { claimInvite, HttpError } from './services/inviteService'
import { createLocalProgressService, type LocalProgressService } from './services/localProgressService'
import {
  respondToSceneStepForSession,
  startSceneForSession,
} from './services/socialScenarioService'

export type ApiAppOptions = {
  localProgress?: LocalProgressService
  repository?: StarBridgeRepository
}

export function createApiApp(options: ApiAppOptions = {}) {
  const app = express()
  const repository =
    options.repository ??
    createInMemoryRepository({
      invites: [{ code: 'STARBRIDGE-DEMO', maxUses: 100, status: 'active' }],
    })
  const localProgress = options.localProgress ?? createLocalProgressService()
  const sessionRequired = requireSession(repository)

  app.disable('x-powered-by')
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true, service: 'starbridge-api' })
  })

  app.post('/api/invites/claim', async (request, response, next) => {
    try {
      const session = await claimInvite(repository, request.body ?? {})
      response.json({
        sessionToken: session.token,
        child: session.child,
      })
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/me', sessionRequired, (request: SessionRequest, response) => {
    response.json({
      child: request.starbridgeSession?.child,
      inviteCode: request.starbridgeSession?.inviteCode,
    })
  })

  app.get('/api/game/bootstrap', sessionRequired, (request: SessionRequest, response) => {
    response.json(buildBootstrap(request.starbridgeSession!))
  })

  app.get('/api/learner-profile', sessionRequired, async (request: SessionRequest, response, next) => {
    try {
      response.json(await repository.getLearnerProfile(request.starbridgeSession!.id))
    } catch (error) {
      next(error)
    }
  })

  app.patch('/api/learner-profile', sessionRequired, async (request: SessionRequest, response, next) => {
    try {
      response.json(
        await repository.saveLearnerProfile(
          request.starbridgeSession!.id,
          await repository.getLearnerProfile(request.starbridgeSession!.id).then((profile) => ({
            ...profile,
            ...(request.body && typeof request.body === 'object' && !Array.isArray(request.body)
              ? request.body
              : {}),
          })),
        ),
      )
    } catch (error) {
      next(error)
    }
  })

  app.post(
    '/api/levels/:levelId/complete',
    sessionRequired,
    async (request: SessionRequest, response, next) => {
      try {
        response.json(
          await completeLevelForSession(
            repository,
            request.starbridgeSession!,
            getRouteParam(request.params.levelId),
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.post(
    '/api/real-life-tasks/:taskId/complete',
    sessionRequired,
    async (request: SessionRequest, response, next) => {
      try {
        response.json(
          await completeRealLifeTaskForSession(
            repository,
            request.starbridgeSession!,
            getRouteParam(request.params.taskId),
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.post('/api/parent-advice', sessionRequired, (request: SessionRequest, response) => {
    response.json(createParentAdvice(request.starbridgeSession!.progress))
  })

  app.post(
    '/api/scenes/:sceneId/start',
    sessionRequired,
    async (request: SessionRequest, response, next) => {
      try {
        response.json(
          await startSceneForSession(
            repository,
            request.starbridgeSession!,
            getRouteParam(request.params.sceneId),
            request.body,
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.post(
    '/api/scenes/:sceneId/steps/:stepId/respond',
    sessionRequired,
    async (request: SessionRequest, response, next) => {
      try {
        response.json(
          await respondToSceneStepForSession(
            repository,
            request.starbridgeSession!,
            getRouteParam(request.params.sceneId),
            getRouteParam(request.params.stepId),
            request.body,
          ),
        )
      } catch (error) {
        next(error)
      }
    },
  )

  app.post('/api/ai/scene-coach', sessionRequired, async (request: SessionRequest, response, next) => {
    try {
      response.json(await createSceneCoachArtifact(repository, request.starbridgeSession!, request.body))
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/voice/profiles', sessionRequired, async (request: SessionRequest, response, next) => {
    try {
      response.json(await createVoiceProfileForSession(repository, request.starbridgeSession!, request.body))
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/sentence-progress', (_request, response) => {
    response.json(localProgress.readSentenceProgress())
  })

  app.post('/api/sentence-progress/complete', (request, response) => {
    const progress = localProgress.appendSentenceRecord(request.body)

    if (!progress) {
      response.status(400).json({ error: 'Invalid sentence completion record' })
      return
    }

    response.json(progress)
  })

  app.get('/api/emotion-progress', (_request, response) => {
    response.json(localProgress.readEmotionProgress())
  })

  app.post('/api/emotion-progress/complete', (request, response) => {
    const progress = localProgress.appendEmotionRecord(request.body)

    if (!progress) {
      response.status(400).json({ error: 'Invalid emotion completion record' })
      return
    }

    response.json(progress)
  })

  app.post('/api/deepseek-chat', (_request, response) => {
    response.json({
      content: '请结合孩子今天的表达练习，选择一个自然生活场景，给出清晰选项并耐心等待孩子表达，再用温和语气复述并回应。练习保持短而稳定。',
      fallback: true,
      fallbackReason: 'provider_not_configured',
    })
  })

  app.post('/api/voice/synthesize', sessionRequired, async (request: SessionRequest, response, next) => {
    try {
      response.json(await synthesizeVoiceForSession(repository, request.starbridgeSession!, request.body))
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/sensor-events', sessionRequired, async (request: SessionRequest, response, next) => {
    try {
      response.json(await appendSensorEventForSession(repository, request.starbridgeSession!, request.body))
    } catch (error) {
      next(error)
    }
  })

  app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
    void next

    if (error instanceof HttpError) {
      response.status(error.statusCode).json({ error: error.message })
      return
    }

    console.error(error)
    response.status(500).json({ error: 'StarBridge API service error' })
  })

  return app
}

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}
