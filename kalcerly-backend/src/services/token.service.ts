import { generateAccessToken, generateRefreshToken } from '../utils/jwt'

export class TokenService {
  createAccessToken(userId: string): string {
    return generateAccessToken(userId)
  }

  createRefreshToken(userId: string): string {
    return generateRefreshToken(userId)
  }

  createTokenPair(userId: string) {
    return {
      accessToken: this.createAccessToken(userId),
      refreshToken: this.createRefreshToken(userId),
    }
  }
}
