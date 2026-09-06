import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../config'

export interface TokenPayload {
  userId: string
  type: 'access' | 'refresh'
}

export const generateAccessToken = (userId: string): string =>
  jwt.sign({ userId, type: 'access' } as TokenPayload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN as StringValue,
  })

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId, type: 'refresh' } as TokenPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as StringValue,
  })

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
