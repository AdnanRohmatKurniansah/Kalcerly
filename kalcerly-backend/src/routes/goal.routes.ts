import { Router } from 'express'
import {
  CreateGoal,
  ListGoals,
  GetGoalById,
  DeleteGoal,
  UpdateProgress,
} from '../controllers/goal.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// All goal endpoints require authentication
router.use(authenticate)

router.get('/', ListGoals)
router.post('/', CreateGoal)
router.get('/:id', GetGoalById)
router.delete('/:id', DeleteGoal)
router.post('/:id/progress', UpdateProgress)

export default router
