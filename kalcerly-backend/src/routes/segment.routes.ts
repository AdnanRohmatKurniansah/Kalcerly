import { Router } from 'express'
import {
  CreateSegment, GetSegments, GetSegmentById,
  DeleteSegment, RecordEffort, GetLeaderboard,
} from '../controllers/segment.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Public read
router.get('/', GetSegments)
router.get('/:id', GetSegmentById)
router.get('/:id/leaderboard', GetLeaderboard)

// Protected write
router.post('/', authenticate, CreateSegment)
router.delete('/:id', authenticate, DeleteSegment)
router.post('/:id/efforts', authenticate, RecordEffort)

export default router
