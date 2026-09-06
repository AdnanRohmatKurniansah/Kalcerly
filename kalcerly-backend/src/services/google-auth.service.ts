import { OAuth2Client } from 'google-auth-library'
import { db } from '../lib/db'
import { authAccounts } from '../db/schema/index'
import { eq, and } from 'drizzle-orm'
import { GOOGLE_CLIENT_ID } from '../config'
import { AppError } from '../utils/error'
import { TokenService } from './token.service'
import { SessionService } from './session.service'
import { UserRepository } from '../repositories/user.repository'

const client = new OAuth2Client(GOOGLE_CLIENT_ID)
const userRepo = new UserRepository()

export class GoogleAuthService {
  private tokenService = new TokenService()
  private sessionService = new SessionService()

  async verifyGoogleToken(credential: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      if (!payload) throw new Error('Invalid token payload')

      return {
        googleId: payload.sub,
        email: payload.email ?? '',
        name: payload.name ?? '',
        picture: payload.picture ?? '',
      }
    } catch {
      throw new AppError('Invalid Google credential', 401, 'INVALID_GOOGLE_CREDENTIAL')
    }
  }

  async authenticateWithGoogle(credential: string) {
    const googleData = await this.verifyGoogleToken(credential)

    // Find existing auth account
    const [existingAuth] = await db
      .select()
      .from(authAccounts)
      .where(
        and(
          eq(authAccounts.provider, 'GOOGLE'),
          eq(authAccounts.providerAccountId, googleData.googleId)
        )
      )
      .limit(1)

    let userId: string

    if (existingAuth) {
      userId = existingAuth.userId
    } else {
      const fullname = `google_${googleData.googleId.slice(0, 20)}_${Date.now()}`
      const newUser = await userRepo.create({
        fullname,
        email: googleData.email,
        avatarUrl: googleData.picture,
        emailVerifiedAt: new Date(), // Google already verified
      })

      await db.insert(authAccounts).values({
        userId: newUser.id,
        provider: 'GOOGLE',
        providerAccountId: googleData.googleId,
        email: googleData.email,
      })

      userId = newUser.id
    }

    const { accessToken, refreshToken } = this.tokenService.createTokenPair(userId)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await this.sessionService.createSession(userId, refreshToken, expiresAt)

    const user = await userRepo.findById(userId)
    if (!user) throw new AppError('User not found after authentication', 500)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    }
  }
}
