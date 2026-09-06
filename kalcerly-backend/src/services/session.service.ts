import { sha256 } from '../utils/hash'
import { SessionRepository } from '../repositories/session.repository'

const sessionRepo = new SessionRepository()

export class SessionService {
  async createSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    deviceId?: string,
    deviceName?: string
  ) {
    const refreshTokenHash = sha256(refreshToken)
    return sessionRepo.create({
      userId,
      refreshTokenHash,
      expiresAt,
      deviceId,
      deviceName,
      lastUsedAt: new Date(),
    })
  }

  async findSessionByRefreshToken(refreshToken: string) {
    const hash = sha256(refreshToken)
    return sessionRepo.findByRefreshTokenHash(hash)
  }

  async updateLastUsed(sessionId: string) {
    await sessionRepo.updateLastUsed(sessionId)
  }

  async revokeSession(sessionId: string) {
    await sessionRepo.revoke(sessionId)
  }

  async revokeAllUserSessions(userId: string) {
    await sessionRepo.revokeAllByUserId(userId)
  }
}
