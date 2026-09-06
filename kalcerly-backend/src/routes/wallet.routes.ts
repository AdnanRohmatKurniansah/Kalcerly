import { Router } from 'express'
import {
  GetWallets,
  GenerateNonce,
  VerifyWallet,
  SetPrimaryWallet,
  DeleteWallet,
} from '../controllers/wallet.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { walletRateLimiter } from '../middlewares/rate-limit.middleware'

const router = Router()

// All wallet operations require authentication (PRD: wallet linking hanya oleh authenticated user)
router.use(authenticate)

router.post('/nonce', walletRateLimiter, GenerateNonce)
router.get('/', GetWallets)
router.post('/verify', VerifyWallet)
router.patch('/primary', SetPrimaryWallet)
router.delete('/:id', DeleteWallet)

export default router
