import type { Request, Response, NextFunction } from 'express'
import { SocialService } from '../services/social.service'
import {
  CreatePostSchema,
  UpdatePostSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  PaginationSchema,
} from '../validations/social.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const socialService = new SocialService()

function getUserId(req: Request): string {
  const userId = (req as AuthRequest).userId
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  return userId
}

function getParam(req: Request, key: string, label: string): string {
  const val = Array.isArray(req.params[key]) ? req.params[key]![0] : req.params[key]
  if (!val) throw new AppError(`${label} required`, 400, `${label.toUpperCase().replace(' ', '_')}_REQUIRED`)
  return val
}

export const GetFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const validation = PaginationSchema.safeParse(req.query)
    if (!validation.success) throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    const result = await socialService.getFeed(userId, validation.data.page, validation.data.limit)
    return successResponse(res, 'Feed retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const CreatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const validationData = CreatePostSchema.safeParse(req.body)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const post = await socialService.createPost(userId, validationData.data)
    return successResponse(res, 'Post created', post, 201)
  } catch (err) { next(err) }
}

export const GetPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    const post = await socialService.getPostById(postId, userId)
    return successResponse(res, 'Post retrieved', post)
  } catch (err) { next(err) }
}

export const GetUserPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const targetUserId = getParam(req, 'userId', 'User ID')
    const validationData = PaginationSchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const result = await socialService.getUserPosts(targetUserId, userId, validationData.data.page, validationData.data.limit)
    return successResponse(res, 'Posts retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const UpdatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    const validationData = UpdatePostSchema.safeParse(req.body)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const post = await socialService.updatePost(userId, postId, validationData.data)
    return successResponse(res, 'Post updated', post)
  } catch (err) { next(err) }
}

export const DeletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    await socialService.deletePost(userId, postId)
    return successResponse(res, 'Post deleted')
  } catch (err) { next(err) }
}

export const FollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = getUserId(req)
    const followingId = getParam(req, 'userId', 'User ID')
    const follow = await socialService.followUser(followerId, followingId)
    return successResponse(res, 'User followed', follow, 201)
  } catch (err) { next(err) }
}

export const UnfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = getUserId(req)
    const followingId = getParam(req, 'userId', 'User ID')
    await socialService.unfollowUser(followerId, followingId)
    return successResponse(res, 'User unfollowed')
  } catch (err) { next(err) }
}

export const GetFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req) 
    const targetUserId = getParam(req, 'userId', 'User ID')
    const validationData = PaginationSchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const result = await socialService.getFollowers(targetUserId, validationData.data.page, validationData.data.limit)
    return successResponse(res, 'Followers retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const GetFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const targetUserId = getParam(req, 'userId', 'User ID')
    const validationData = PaginationSchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const result = await socialService.getFollowing(targetUserId, validationData.data.page, validationData.data.limit)
    return successResponse(res, 'Following retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const GiveKudo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    const kudo = await socialService.giveKudo(userId, postId)
    return successResponse(res, 'Kudos given', kudo, 201)
  } catch (err) { next(err) }
}

export const RemoveKudo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    await socialService.removeKudo(userId, postId)
    return successResponse(res, 'Kudos removed')
  } catch (err) { next(err) }
}

export const CreateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    const validationData = CreateCommentSchema.safeParse(req.body)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const comment = await socialService.createComment(userId, postId, validationData.data)
    return successResponse(res, 'Comment created', comment, 201)
  } catch (err) { next(err) }
}

export const GetComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const postId = getParam(req, 'id', 'Post ID')
    const validationData = PaginationSchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const result = await socialService.getComments(postId, validationData.data.page, validationData.data.limit)
    return successResponse(res, 'Comments retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const UpdateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const commentId = getParam(req, 'commentId', 'Comment ID')
    const validationData = UpdateCommentSchema.safeParse(req.body)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const comment = await socialService.updateComment(userId, commentId, validationData.data.content)
    return successResponse(res, 'Comment updated', comment)
  } catch (err) { next(err) }
}

export const DeleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const commentId = getParam(req, 'commentId', 'Comment ID')
    await socialService.deleteComment(userId, commentId)
    return successResponse(res, 'Comment deleted')
  } catch (err) { next(err) }
}
