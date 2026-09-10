import type { Request, Response, NextFunction } from 'express'
import { ClubService } from '../services/club.service'
import {
  CreateClubSchema,
  UpdateClubSchema,
  UpdateMemberRoleSchema,
  CreateClubPostSchema,
  PaginationSchema,
  SearchSchema,
} from '../validations/club.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const clubService = new ClubService()

function getUserId(req: Request): string {
  const userId = (req as AuthRequest).userId
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  return userId
}

function getParam(req: Request, key: string, label: string): string {
  const val = Array.isArray(req.params[key]) ? req.params[key]![0] : req.params[key]
  if (!val) throw new AppError(`${label} required`, 400, `${label.toUpperCase().replace(/ /g, '_')}_REQUIRED`)
  return val
}

// ─── Clubs ────────────────────────────────────────────────────────────────────

export const CreateClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const v = CreateClubSchema.safeParse(req.body)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const club = await clubService.createClub(userId, v.data)
    return successResponse(res, 'Club created', club, 201)
  } catch (err) { next(err) }
}

export const ListClubs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const v = SearchSchema.safeParse(req.query)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const result = await clubService.listClubs(v.data.page, v.data.limit, v.data.search)
    return successResponse(res, 'Clubs retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const GetClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const club = await clubService.getClubById(clubId, userId)
    return successResponse(res, 'Club retrieved', club)
  } catch (err) { next(err) }
}

export const UpdateClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const v = UpdateClubSchema.safeParse(req.body)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const club = await clubService.updateClub(userId, clubId, v.data)
    return successResponse(res, 'Club updated', club)
  } catch (err) { next(err) }
}

export const DeleteClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    await clubService.deleteClub(userId, clubId)
    return successResponse(res, 'Club deleted')
  } catch (err) { next(err) }
}

// ─── Membership ───────────────────────────────────────────────────────────────

export const JoinClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const member = await clubService.joinClub(userId, clubId)
    return successResponse(res, 'Joined club successfully', member, 201)
  } catch (err) { next(err) }
}

export const LeaveClub = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    await clubService.leaveClub(userId, clubId)
    return successResponse(res, 'Left club successfully')
  } catch (err) { next(err) }
}

export const RemoveMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const targetUserId = getParam(req, 'userId', 'User ID')
    await clubService.removeMember(requesterId, clubId, targetUserId)
    return successResponse(res, 'Member removed')
  } catch (err) { next(err) }
}

export const UpdateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const targetUserId = getParam(req, 'userId', 'User ID')
    const v = UpdateMemberRoleSchema.safeParse(req.body)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const member = await clubService.updateMemberRole(requesterId, clubId, targetUserId, v.data.role)
    return successResponse(res, 'Member role updated', member)
  } catch (err) { next(err) }
}

export const GetMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const v = PaginationSchema.safeParse(req.query)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const result = await clubService.getMembers(clubId, userId, v.data.page, v.data.limit)
    return successResponse(res, 'Members retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const GetMyClubs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const v = PaginationSchema.safeParse(req.query)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const result = await clubService.getMyClubs(userId, v.data.page, v.data.limit)
    return successResponse(res, 'My clubs retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

// ─── Club Posts ───────────────────────────────────────────────────────────────

export const CreateClubPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const v = CreateClubPostSchema.safeParse(req.body)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const post = await clubService.createPost(userId, clubId, v.data)
    return successResponse(res, 'Post created', post, 201)
  } catch (err) { next(err) }
}

export const GetClubPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const v = PaginationSchema.safeParse(req.query)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const result = await clubService.getClubPosts(clubId, userId, v.data.page, v.data.limit)
    return successResponse(res, 'Club posts retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const DeleteClubPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const clubId = getParam(req, 'id', 'Club ID')
    const postId = getParam(req, 'postId', 'Post ID')
    await clubService.deleteClubPost(userId, clubId, postId)
    return successResponse(res, 'Post deleted')
  } catch (err) { next(err) }
}
