import type { Request, Response, NextFunction } from 'express'
import { RewardService } from '../services/reward.service'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'
import { z } from 'zod'

const rewardService = new RewardService()

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// POST /api/rewards/activities/:activityId
// Trigger reward processing for a verified activity
export const ProcessActivityReward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['activityId'])
      ? req.params['activityId'][0]
      : req.params['activityId']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const reward = await rewardService.processActivityReward(userId, activityId)
    return successResponse(res, 'Reward processed', reward, 200)
  } catch (err) {
    next(err)
  }
}

// GET /api/rewards/activities/:activityId
// Get reward status for a specific activity
export const GetRewardByActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['activityId'])
      ? req.params['activityId'][0]
      : req.params['activityId']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const reward = await rewardService.getRewardByActivity(userId, activityId)
    return successResponse(res, 'Reward retrieved', reward)
  } catch (err) {
    next(err)
  }
}

// GET /api/rewards
// Reward history for authenticated user
export const ListRewards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = PaginationSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const { page, limit } = validation.data
    const result = await rewardService.listRewards(userId, page, limit)
    return successResponse(res, 'Rewards retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/rewards/transactions
// Blockchain transaction history for authenticated user
export const ListTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = PaginationSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const { page, limit } = validation.data
    const result = await rewardService.listTransactions(userId, page, limit)
    return successResponse(res, 'Transactions retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/rewards/balance
// FIT token balance from primary wallet on-chain
export const GetFITBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const balance = await rewardService.getFITBalance(userId)
    return successResponse(res, 'FIT balance retrieved', balance)
  } catch (err) {
    next(err)
  }
}
