import type { NextFunction, Request, Response } from 'express'

import type { FamilySessionRecord, StarBridgeRepository } from '../repositories/types'

export type SessionRequest = Request & {
  starbridgeSession?: FamilySessionRecord
}

export function requireSession(repository: StarBridgeRepository) {
  return async (request: SessionRequest, response: Response, next: NextFunction) => {
    const token = readBearerToken(request.headers.authorization)

    if (!token) {
      response.status(401).json({ error: '缺少体验会话' })
      return
    }

    const session = await repository.findSessionByToken(token)
    if (!session) {
      response.status(401).json({ error: '体验会话已失效' })
      return
    }

    request.starbridgeSession = session
    next()
  }
}

function readBearerToken(header: string | undefined) {
  if (!header?.startsWith('Bearer ')) {
    return ''
  }

  return header.slice('Bearer '.length).trim()
}
