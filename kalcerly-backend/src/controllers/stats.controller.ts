import type { Request, Response, NextFunction } from 'express'
import { StatsService } from '../services/stats.service'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'
import { z } from 'zod'

const statsService = new StatsService()

const ACTIVITY_TYPES = ['WALKING', 'RUNNING', 'CYCLING'] as const
const LEADERBOARD_TYPES = ['WALKING', 'RUNNING', 'CYCLING', 'TOTAL'] as const

const PersonalRecordsQuerySchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES).optional(),
})

const LeaderboardQuerySchema = z.object({
  type: z.enum(LEADERBOARD_TYPES).default('TOTAL'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

function getUserId(req: Request): string {
  const userId = (req as AuthRequest).userId
  if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
  return userId
}

export const GetMyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const stats = await statsService.getUserStats(userId)
    return successResponse(res, 'Statistics retrieved', stats)
  } catch (err) { next(err) }
}

export const GetUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const targetUserId = Array.isArray(req.params['userId']) ? req.params['userId'][0] : req.params['userId']
    if (!targetUserId) throw new AppError('User ID required', 400, 'USER_ID_REQUIRED')
    const stats = await statsService.getUserStats(targetUserId)
    return successResponse(res, 'Statistics retrieved', stats)
  } catch (err) { next(err) }
}

export const GetMyPersonalRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const validationData = PersonalRecordsQuerySchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const records = await statsService.getPersonalRecords(userId, validationData.data.activityType)
    return successResponse(res, 'Personal records retrieved', records)
  } catch (err) { next(err) }
}

export const GetUserPersonalRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const targetUserId = Array.isArray(req.params['userId']) ? req.params['userId'][0] : req.params['userId']
    if (!targetUserId) throw new AppError('User ID required', 400, 'USER_ID_REQUIRED')
    const validationData = PersonalRecordsQuerySchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const records = await statsService.getPersonalRecords(targetUserId, validationData.data.activityType)
    return successResponse(res, 'Personal records retrieved', records)
  } catch (err) { next(err) }
}

export const GetAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const achievements = await statsService.getAllAchievements()
    return successResponse(res, 'Achievements retrieved', achievements)
  } catch (err) { next(err) }
}

export const GetMyAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req)
    const achievements = await statsService.getUserAchievements(userId)
    return successResponse(res, 'My achievements retrieved', achievements)
  } catch (err) { next(err) }
}

export const GetUserAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const targetUserId = Array.isArray(req.params['userId']) ? req.params['userId'][0] : req.params['userId']
    if (!targetUserId) throw new AppError('User ID required', 400, 'USER_ID_REQUIRED')
    const achievements = await statsService.getUserAchievements(targetUserId)
    return successResponse(res, 'User achievements retrieved', achievements)
  } catch (err) { next(err) }
}

export const GetDistanceLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const validationData = LeaderboardQuerySchema.safeParse(req.query)
    if (!validationData.success) throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    const leaderboard = await statsService.getDistanceLeaderboard(validationData.data.type, validationData.data.limit)
    return successResponse(res, 'Distance leaderboard retrieved', leaderboard)
  } catch (err) { next(err) }
}

export const GetStreakLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserId(req)
    const validationData = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) }).safeParse(req.query)
    if (!validationData.success) {
      throw new AppError('Validation failed', 400, validationData.error.flatten().fieldErrors)
    }
    const leaderboard = await statsService.getStreakLeaderboard(validationData.data.limit)
    return successResponse(res, 'Streak leaderboard retrieved', leaderboard)
  } catch (err) { next(err) }
}
