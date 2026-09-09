import { Router } from 'express'
import {
  CreateChallenge,
  ListChallenges,
  GetChallengeById,
  JoinChallenge,
  LeaveChallenge,
  AddProgress,
  GetMyParticipations,
  GetParticipants,
} from '../controllers/challenge.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// All challenge endpoints require authentication
router.use(authenticate)

// Challenge management
router.get('/', ListChallenges)
router.post('/', CreateChallenge)
router.get('/me', GetMyParticipations)
router.get('/:id', GetChallengeById)

// Participation
router.post('/:id/join', JoinChallenge)
router.delete('/:id/leave', LeaveChallenge)

// Progress
router.post('/:id/progress', AddProgress)

// Participants
router.get('/:id/participants', GetParticipants)

export default router
