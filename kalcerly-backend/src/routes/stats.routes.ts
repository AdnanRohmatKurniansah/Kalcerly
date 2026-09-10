import { Router } from 'express'
import {
  GetMyStats,
  GetUserStats,
  GetMyPersonalRecords,
  GetUserPersonalRecords,
  GetAchievements,
  GetMyAchievements,
  GetUserAchievements,
  GetDistanceLeaderboard,
  GetStreakLeaderboard,
} from '../controllers/stats.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

// ─── Statistics ────────────────────────────────────────────────────────────
router.get('/me', GetMyStats)
router.get('/users/:userId', GetUserStats)

// ─── Personal Records ───────────────────────────────────────────────────────
router.get('/me/records', GetMyPersonalRecords)
router.get('/users/:userId/records', GetUserPersonalRecords)

// ─── Achievements ────────────────────────────────────────────────────────────
router.get('/achievements', GetAchievements)
router.get('/me/achievements', GetMyAchievements)
router.get('/users/:userId/achievements', GetUserAchievements)

// ─── Leaderboards ────────────────────────────────────────────────────────────
router.get('/leaderboard/distance', GetDistanceLeaderboard)
router.get('/leaderboard/streak', GetStreakLeaderboard)

export default router
