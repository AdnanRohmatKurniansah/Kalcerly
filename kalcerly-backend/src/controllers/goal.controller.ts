import type { Request, Response, NextFunction } from 'express'
import { GoalService } from '../services/goal.service'
import {
  CreateGoalSchema,
  ListGoalsSchema,
  UpdateGoalProgressSchema,
} from '../validations/goal.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const goalService = new GoalService()

export const CreateGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = CreateGoalSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const goal = await goalService.createGoal(userId, validation.data)
    return successResponse(res, 'Goal created', goal, 201)
  } catch (err) {
    next(err)
  }
}

export const ListGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = ListGoalsSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const { page, limit } = validation.data
    const result = await goalService.listGoals(userId, page, limit)
    return successResponse(res, 'Goals retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}

export const GetGoalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const goalId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!goalId) throw new AppError('Goal ID required', 400, 'GOAL_ID_REQUIRED')

    const goal = await goalService.getGoalById(userId, goalId)
    return successResponse(res, 'Goal retrieved', goal)
  } catch (err) {
    next(err)
  }
}

export const DeleteGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const goalId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!goalId) throw new AppError('Goal ID required', 400, 'GOAL_ID_REQUIRED')

    await goalService.deleteGoal(userId, goalId)
    return successResponse(res, 'Goal deleted')
  } catch (err) {
    next(err)
  }
}

export const UpdateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const goalId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!goalId) throw new AppError('Goal ID required', 400, 'GOAL_ID_REQUIRED')

    const validation = UpdateGoalProgressSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const result = await goalService.updateProgress(userId, goalId, validation.data.activityId)
    return successResponse(res, 'Goal progress updated', result)
  } catch (err) {
    next(err)
  }
}
