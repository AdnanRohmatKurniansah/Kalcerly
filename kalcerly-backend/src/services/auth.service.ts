import { hashPassword, comparePassword } from '../utils/hash'
import { AppError } from '../utils/error'
import { EmailVerificationService } from './email-verification.service'
import { TokenService } from './token.service'
import { SessionService } from './session.service'
import { UserRepository } from '../repositories/user.repository'
import { deleteFromCloudinary, uploadToCloudinary } from '../lib/cloudinary'

const userRepo = new UserRepository()

export class AuthService {
  private emailVerificationService = new EmailVerificationService()
  private tokenService = new TokenService()
  private sessionService = new SessionService()

  async register(fullname: string, email: string, password: string) {
    const existingEmail = await userRepo.findByEmail(email)
    if (existingEmail) {
      throw new AppError('Email already exists', 409, 'EMAIL_EXISTS')
    }
    const passwordHash = await hashPassword(password)

    const user = await userRepo.create({
      fullname,
      email,
      password: passwordHash,
      emailVerifiedAt: null,
    })

    await this.emailVerificationService.generateAndSendToken(user!.id, email)

    return {
      requiresEmailVerification: true,
      message: 'Registration successful. Please check your email to verify your account.',
    }
  }

  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email)

    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    if (!user.emailVerifiedAt) {
      throw new AppError('Email verification is required before login.', 403, 'EMAIL_NOT_VERIFIED')
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED')
    }

    const { accessToken, refreshToken } = this.tokenService.createTokenPair(user.id)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await this.sessionService.createSession(user.id, refreshToken, expiresAt)

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

  async logout(refreshToken: string) {
    const session = await this.sessionService.findSessionByRefreshToken(refreshToken)
    if (session) {
      await this.sessionService.revokeSession(session.id)
    }
  }

  async refreshTokens(oldRefreshToken: string) {
    const session = await this.sessionService.findSessionByRefreshToken(oldRefreshToken)
    if (!session) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }

    if (new Date() > session.expiresAt) {
      throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED')
    }

    await this.sessionService.revokeSession(session.id)

    const { accessToken, refreshToken } = this.tokenService.createTokenPair(session.userId)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await this.sessionService.createSession(session.userId, refreshToken, expiresAt)

    return { accessToken, refreshToken }
  }

  async getMe(userId: string) {
    const user = await userRepo.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    return {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      location: user.location,
      isPrivate: user.isPrivate,
      emailVerified: !!user.emailVerifiedAt,
    }
  }

  async updateProfile(
    userId: string,
    data: {
      fullname?: string
      bio?: string
      dateOfBirth?: string
      gender?: string
      location?: string
      isPrivate?: boolean
    },
    avatarFile?: Express.Multer.File
  ) {
    const user = await userRepo.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    let avatarUrl = user.avatarUrl

    if (avatarFile) {
      const newAvatarUrl = await uploadToCloudinary(avatarFile, 'avatars')
      if (user.avatarUrl) {
        await deleteFromCloudinary(user.avatarUrl)
      }

      avatarUrl = newAvatarUrl
    }

    const updated = await userRepo.update(userId, {
      ...data,
      ...(avatarFile ? { avatarUrl } : {}),
    })

    if (!updated) {
      throw new AppError('Failed to update profile', 500, 'UPDATE_FAILED')
    }

    return {
      id: updated.id,
      fullname: updated.fullname,
      email: updated.email,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      dateOfBirth: updated.dateOfBirth,
      gender: updated.gender,
      location: updated.location,
      isPrivate: updated.isPrivate,
      emailVerified: !!updated.emailVerifiedAt,
    }
  }
}
