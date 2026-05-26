import { initialProgress } from '../../src/shared/store/gameStoreCore'
import type { FamilySessionRecord, StarBridgeRepository } from '../repositories/types'

export class HttpError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

export async function claimInvite(
  repository: StarBridgeRepository,
  payload: unknown,
): Promise<FamilySessionRecord> {
  const input = parseInviteClaim(payload)
  const invite = await repository.findInvite(input.code)

  if (!invite) {
    throw new HttpError(404, '邀请码不存在')
  }

  if (invite.status === 'revoked') {
    throw new HttpError(403, '邀请码已撤销')
  }

  if (invite.expiresAt && new Date(invite.expiresAt).getTime() <= repository.now().getTime()) {
    throw new HttpError(410, '邀请码已过期')
  }

  if (invite.usedCount >= invite.maxUses) {
    throw new HttpError(409, '邀请码已被使用')
  }

  await repository.incrementInviteUse(input.code)
  const session = await repository.createSession({
    childNickname: input.childNickname,
    inviteCode: input.code,
    progress: initialProgress,
  })
  await repository.appendBehaviorEvent({
    sessionId: session.id,
    eventType: 'invite_claimed',
    details: { inviteCode: input.code },
  })
  return session
}

function parseInviteClaim(payload: unknown): { childNickname: string; code: string } {
  if (!payload || typeof payload !== 'object') {
    throw new HttpError(400, '请求格式不正确')
  }

  const input = payload as Record<string, unknown>
  const code = typeof input.code === 'string' ? input.code.trim().toUpperCase() : ''
  const childNickname =
    typeof input.childNickname === 'string' && input.childNickname.trim()
      ? input.childNickname.trim()
      : '星桥小朋友'

  if (!code) {
    throw new HttpError(400, '请输入邀请码')
  }

  return { childNickname, code }
}
