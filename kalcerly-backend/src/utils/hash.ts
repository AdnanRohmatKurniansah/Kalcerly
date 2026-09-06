import { createHash, randomBytes } from 'crypto'
import bcrypt from 'bcrypt'

/** Hash an arbitrary string with SHA-256 (for tokens, nonces, etc.) */
export const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

/** Generate a cryptographically secure random token */
export const generateSecureToken = (bytes = 32): string =>
  randomBytes(bytes).toString('hex')

/** Hash a password using bcrypt */
export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, 12)

/** Compare plain password to bcrypt hash */
export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash)
