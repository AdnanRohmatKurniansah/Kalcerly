import { Router } from 'express'
import {
  CreateActivity,
  GetMyActivities,
  GetActivityById,
  UpdateActivity,
  DeleteActivity,
  UploadPoints,
  GetActivityPoints,
  SubmitForVerification,
} from '../controllers/activity.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// All activity endpoints require authentication
router.use(authenticate)

router.post('/', CreateActivity)
router.get('/', GetMyActivities)
router.get('/:id', GetActivityById)
router.patch('/:id', UpdateActivity)
router.delete('/:id', DeleteActivity)

// GPS points
router.post('/:id/points', UploadPoints)
router.get('/:id/points', GetActivityPoints)

// Verification
router.post('/:id/verify', SubmitForVerification)

export default router
