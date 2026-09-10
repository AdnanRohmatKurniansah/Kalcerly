import { Router } from 'express'
import {
  ProcessActivityReward,
  GetRewardByActivity,
  ListRewards,
  ListTransactions,
  GetFITBalance,
} from '../controllers/reward.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// All reward endpoints require authentication
router.use(authenticate)

// Reward history
router.get('/', ListRewards)

// FIT token balance from primary wallet
router.get('/balance', GetFITBalance)

// Blockchain transaction history
router.get('/transactions', ListTransactions)

// Per-activity reward endpoints
router.post('/activities/:activityId', ProcessActivityReward)
router.get('/activities/:activityId', GetRewardByActivity)

export default router
