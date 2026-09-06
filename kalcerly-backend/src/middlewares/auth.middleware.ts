import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from '../utils/error'

export interface AuthRequest extends Request {
  userId?: string
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401, 'UNAUTHORIZED')
    }

    const parts = authHeader.split(' ')
    const token = parts[1]
    if (!token) {
      throw new AppError('Access token required', 401, 'UNAUTHORIZED')
    }

    const payload = verifyAccessToken(token)

    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE')
    }

    ;(req as AuthRequest).userId = payload.userId
    next()
  } catch (error) {
    if (error instanceof AppError) {
      return next(error)
    }
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'))
  }
}
