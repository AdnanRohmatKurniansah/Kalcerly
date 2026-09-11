import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { EmailVerificationService } from '../services/email-verification.service'
import { GoogleAuthService } from '../services/google-auth.service'
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
  RefreshTokenSchema,
  GoogleAuthSchema,
  UpdateProfileSchema,
} from '../validations/auth.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const authService = new AuthService()
const emailVerificationService = new EmailVerificationService()
const googleAuthService = new GoogleAuthService()

export const Register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = RegisterSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    const { fullname, email, password } = validation.data
    const result = await authService.register(fullname, email, password)
    return successResponse(res, result.message, { requiresEmailVerification: result.requiresEmailVerification }, 201)
  } catch (err) {
    next(err)
  }
}

export const VerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = VerifyEmailSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    await emailVerificationService.verifyToken(validation.data.token)
    return successResponse(res, 'Email verified successfully')
  } catch (err) {
    next(err)
  }
}

export const ResendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = ResendVerificationSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    await emailVerificationService.resendVerification(validation.data.email)
    return successResponse(res, 'Verification email sent')
  } catch (err) {
    next(err)
  }
}

export const Login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = LoginSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    const result = await authService.login(validation.data.email, validation.data.password)
    return successResponse(res, 'Login successfully', result)
  } catch (err) {
    next(err)
  }
}

export const GoogleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = GoogleAuthSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    const result = await googleAuthService.authenticateWithGoogle(validation.data.credential)
    return successResponse(res, 'Google authentication successful', result)
  } catch (err) {
    next(err)
  }
}

export const Refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = RefreshTokenSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    const result = await authService.refreshTokens(validation.data.refreshToken)
    return successResponse(res, 'Token refreshed', result)
  } catch (err) {
    next(err)
  }
}

export const Logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = RefreshTokenSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }
    await authService.logout(validation.data.refreshToken)
    return successResponse(res, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

export const GetMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const user = await authService.getMe(userId)
    return successResponse(res, 'User data', user)
  } catch (err) {
    next(err)
  }
}

export const UpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = UpdateProfileSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const avatarFile = (req as Request & { file?: Express.Multer.File }).file

    const updated = await authService.updateProfile(userId, validation.data, avatarFile)
    return successResponse(res, 'Profile updated successfully', updated)
  } catch (err) {
    next(err)
  }
}
