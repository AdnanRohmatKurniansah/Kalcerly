import { generateSecureToken, sha256 } from '../utils/hash'
import { sendVerificationEmail } from '../utils/email'
import { EMAIL_VERIFICATION_URL } from '../config'
import { AppError } from '../utils/error'
import { EmailVerificationRepository } from '../repositories/email-verification.repository'
import { UserRepository } from '../repositories/user.repository'

const emailVerificationRepo = new EmailVerificationRepository()
const userRepo = new UserRepository()

export class EmailVerificationService {
  async generateAndSendToken(userId: string, email: string) {
    const token = generateSecureToken(32)
    const tokenHash = sha256(token)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Invalidate existing pending tokens for this user
    await emailVerificationRepo.invalidateByUserId(userId)

    // Store hashed token
    await emailVerificationRepo.create({ userId, tokenHash, expiresAt })

    // Send email with raw token
    await sendVerificationEmail(email, token, EMAIL_VERIFICATION_URL)
  }

  async verifyToken(token: string) {
    const tokenHash = sha256(token)
    const record = await emailVerificationRepo.findValidByTokenHash(tokenHash)

    if (!record) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN')
    }

    // Mark token as used
    await emailVerificationRepo.markUsed(record.id)

    // Mark email as verified
    await userRepo.updateEmailVerified(record.userId, new Date())

    return record.userId
  }

  async resendVerification(email: string) {
    const user = await userRepo.findByEmail(email)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    if (user.emailVerifiedAt) {
      throw new AppError('Email already verified', 400, 'ALREADY_VERIFIED')
    }

    await this.generateAndSendToken(user.id, email)
  }
}
