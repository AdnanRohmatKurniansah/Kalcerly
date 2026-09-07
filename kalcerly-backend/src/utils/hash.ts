import { createHash, randomBytes } from 'crypto'
import bcrypt from 'bcrypt'

export const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

export const generateSecureToken = (bytes = 32): string =>
  randomBytes(bytes).toString('hex')

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, 12)

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash)
