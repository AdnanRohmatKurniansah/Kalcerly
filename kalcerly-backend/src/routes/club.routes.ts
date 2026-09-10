import { Router } from 'express'
import {
  CreateClub,
  ListClubs,
  GetClub,
  UpdateClub,
  DeleteClub,
  JoinClub,
  LeaveClub,
  RemoveMember,
  UpdateMemberRole,
  GetMembers,
  GetMyClubs,
  CreateClubPost,
  GetClubPosts,
  DeleteClubPost,
} from '../controllers/club.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// All club endpoints require authentication
router.use(authenticate)

// ─── Clubs ─────────────────────────────────────────────────────────────────
router.get('/', ListClubs)
router.post('/', CreateClub)
router.get('/me', GetMyClubs)
router.get('/:id', GetClub)
router.patch('/:id', UpdateClub)
router.delete('/:id', DeleteClub)

// ─── Membership ─────────────────────────────────────────────────────────────
router.post('/:id/join', JoinClub)
router.delete('/:id/leave', LeaveClub)
router.get('/:id/members', GetMembers)
router.delete('/:id/members/:userId', RemoveMember)
router.patch('/:id/members/:userId/role', UpdateMemberRole)

// ─── Club Posts ─────────────────────────────────────────────────────────────
router.post('/:id/posts', CreateClubPost)
router.get('/:id/posts', GetClubPosts)
router.delete('/:id/posts/:postId', DeleteClubPost)

export default router
