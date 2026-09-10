import { Router } from 'express'
import {
  GetFeed,
  CreatePost,
  GetPost,
  GetUserPosts,
  UpdatePost,
  DeletePost,
  FollowUser,
  UnfollowUser,
  GetFollowers,
  GetFollowing,
  GiveKudo,
  RemoveKudo,
  CreateComment,
  GetComments,
  UpdateComment,
  DeleteComment,
} from '../controllers/social.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// All social endpoints require authentication
router.use(authenticate)

router.get('/feed', GetFeed)

router.post('/posts', CreatePost)
router.get('/posts/:id', GetPost)
router.patch('/posts/:id', UpdatePost)
router.delete('/posts/:id', DeletePost)

// Posts by user
router.get('/users/:userId/posts', GetUserPosts)

router.post('/users/:userId/follow', FollowUser)
router.delete('/users/:userId/follow', UnfollowUser)
router.get('/users/:userId/followers', GetFollowers)
router.get('/users/:userId/following', GetFollowing)

router.post('/posts/:id/kudos', GiveKudo)
router.delete('/posts/:id/kudos', RemoveKudo)

router.post('/posts/:id/comments', CreateComment)
router.get('/posts/:id/comments', GetComments)
router.patch('/posts/:id/comments/:commentId', UpdateComment)
router.delete('/posts/:id/comments/:commentId', DeleteComment)

export default router
