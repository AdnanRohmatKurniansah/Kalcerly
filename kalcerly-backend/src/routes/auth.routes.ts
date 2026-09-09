import { Router } from 'express'
import {
  Register,
  VerifyEmail,
  ResendVerification,
  Login,
  GoogleAuth,
  Refresh,
  Logout,
  GetMe,
  UpdateProfile,
} from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authRateLimiter, emailVerificationRateLimiter } from '../middlewares/rate-limit.middleware'
import { upload } from '../middlewares/upload.middleware'

const router = Router()

// Public routes
router.post('/register', authRateLimiter, Register)
router.post('/verify-email', VerifyEmail)
router.post('/resend-verification', emailVerificationRateLimiter, ResendVerification)
router.post('/login', authRateLimiter, Login)
router.post('/google', authRateLimiter, GoogleAuth)

// Protected routes
router.post('/refresh', Refresh)
router.post('/logout', authenticate, Logout)
router.get('/me', authenticate, GetMe)
router.post('/me', authenticate, upload.single('avatar'), UpdateProfile)

export default router
