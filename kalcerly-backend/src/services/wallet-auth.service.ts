import { generateSecureToken } from '../utils/hash'
import { verifyMessage } from 'viem'
import { AppError } from '../utils/error'
import { APP_DOMAIN, BLOCKCHAIN_CHAIN_ID } from '../config'
import { WalletRepository } from '../repositories/wallet.repository'
import { AuthNonceRepository } from '../repositories/auth-nonce.repository'

const walletRepo = new WalletRepository()
const nonceRepo = new AuthNonceRepository()

export class WalletAuthService {
  async generateNonce(walletAddress: string) {
    // Normalize address to lowercase for consistent comparison
    const normalizedAddress = walletAddress.toLowerCase()

    const nonce = generateSecureToken(16)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate old pending nonces for this address
    await nonceRepo.invalidateByWalletAddress(normalizedAddress)

    await nonceRepo.create({
      walletAddress: normalizedAddress,
      nonce,
      chainId: BLOCKCHAIN_CHAIN_ID,
      domain: APP_DOMAIN,
      expiresAt,
    })

    return {
      nonce,
      expiresAt,
      domain: APP_DOMAIN,
      chainId: BLOCKCHAIN_CHAIN_ID,
    }
  }

  async verifySignature(
    userId: string,
    walletAddress: string,
    signature: string,
    message: string,
    chainId: number
  ) {
    const normalizedAddress = walletAddress.toLowerCase()

    // Extract nonce from SIWE message
    const nonceMatch = message.match(/Nonce:\s*([a-f0-9]+)/i)
    if (!nonceMatch || !nonceMatch[1]) {
      throw new AppError('Invalid SIWE message format', 400, 'INVALID_SIWE_MESSAGE')
    }
    const nonce = nonceMatch[1]

    // Find valid nonce — must match address, be unused, and not expired
    const nonceRecord = await nonceRepo.findValidByNonce(nonce)

    if (!nonceRecord) {
      throw new AppError('Invalid or expired nonce', 400, 'INVALID_NONCE')
    }

    if (nonceRecord.walletAddress.toLowerCase() !== normalizedAddress) {
      throw new AppError('Invalid or expired nonce', 400, 'INVALID_NONCE')
    }

    // Verify the SIWE signature using viem
    let valid = false
    try {
      valid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })
    } catch {
      throw new AppError('Signature verification failed', 401, 'INVALID_SIGNATURE')
    }

    if (!valid) {
      throw new AppError('Invalid signature', 401, 'INVALID_SIGNATURE')
    }

    // Mark nonce as used immediately after verification (prevent replay)
    await nonceRepo.markUsed(nonceRecord.id)

    // Check if wallet already exists
    const existingWallet = await walletRepo.findByAddress(normalizedAddress)

    if (existingWallet) {
      // Wallet linked to a different user account — ownership conflict
      if (existingWallet.userId !== userId) {
        throw new AppError('Wallet is already linked to another account', 409, 'WALLET_OWNED_BY_OTHER')
      }
      // Wallet already linked to this user — return existing (idempotent)
      return existingWallet
    }

    // First wallet for this user — set as primary automatically
    const userWallets = await walletRepo.findByUserId(userId)
    const isPrimary = userWallets.length === 0

    return walletRepo.create({
      userId,
      address: normalizedAddress,
      chainId,
      isPrimary,
      verifiedAt: new Date(),
    })
  }

  async getUserWallets(userId: string) {
    return walletRepo.findByUserId(userId)
  }

  async setPrimaryWallet(userId: string, walletId: string) {
    // Check wallet belongs to user first
    const wallet = await walletRepo.findByIdAndUserId(walletId, userId)
    if (!wallet) {
      throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND')
    }

    // Unset all primary for this user, then set the target
    await walletRepo.unsetPrimaryForUser(userId)
    const updated = await walletRepo.setPrimary(walletId, userId)

    if (!updated) {
      throw new AppError('Failed to update primary wallet', 500, 'UPDATE_FAILED')
    }

    return updated
  }

  async deleteWallet(userId: string, walletId: string) {
    const wallet = await walletRepo.findByIdAndUserId(walletId, userId)

    if (!wallet) {
      throw new AppError('Wallet not found', 404, 'WALLET_NOT_FOUND')
    }

    await walletRepo.deleteById(walletId)

    // If deleted wallet was primary and user has other wallets, auto-set the oldest as primary
    if (wallet.isPrimary) {
      const remaining = await walletRepo.findByUserId(userId)
      if (remaining.length > 0 && remaining[0]) {
        await walletRepo.setPrimary(remaining[0].id, userId)
      }
    }
  }
}
