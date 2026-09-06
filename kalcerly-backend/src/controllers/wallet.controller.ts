import type { Request, Response, NextFunction } from 'express'
import { WalletAuthService } from '../services/wallet-auth.service'
import { WalletNonceSchema, WalletVerifySchema, SetPrimaryWalletSchema } from '../validations/wallet.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const walletAuthService = new WalletAuthService()

export const GetWallets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const wallets = await walletAuthService.getUserWallets(userId)
    return successResponse(res, 'Wallets retrieved', wallets)
  } catch (err) {
    next(err)
  }
}

export const GenerateNonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = WalletNonceSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }
    const result = await walletAuthService.generateNonce(validation.data.address)
    return successResponse(res, 'Nonce generated', result)
  } catch (err) {
    next(err)
  }
}

export const VerifyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = WalletVerifySchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }

    const { address, signature, message, chainId } = validation.data
    const wallet = await walletAuthService.verifySignature(userId, address, signature, message, chainId)
    return successResponse(res, 'Wallet verified and linked', wallet)
  } catch (err) {
    next(err)
  }
}

export const SetPrimaryWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = SetPrimaryWalletSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }

    const wallet = await walletAuthService.setPrimaryWallet(userId, validation.data.walletId)
    return successResponse(res, 'Primary wallet updated', wallet)
  } catch (err) {
    next(err)
  }
}

export const DeleteWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const walletId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!walletId) throw new AppError('Wallet ID required', 400, 'WALLET_ID_REQUIRED')

    await walletAuthService.deleteWallet(userId, walletId)
    return successResponse(res, 'Wallet deleted successfully')
  } catch (err) {
    next(err)
  }
}
