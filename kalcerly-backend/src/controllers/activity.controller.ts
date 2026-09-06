import type { Request, Response, NextFunction } from 'express'
import { ActivityService } from '../services/activity.service'
import {
  CreateActivitySchema,
  UploadPointsSchema,
  UpdateActivitySchema,
  ListActivitiesSchema,
} from '../validations/activity.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const activityService = new ActivityService()

export const CreateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = CreateActivitySchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }

    const activity = await activityService.createActivity(userId, validation.data)
    return successResponse(res, 'Activity created', activity, 201)
  } catch (err) {
    next(err)
  }
}

export const GetMyActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = ListActivitiesSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }

    const { page, limit } = validation.data
    const result = await activityService.listActivities(userId, page, limit)
    return successResponse(res, 'Activities retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}

export const GetActivityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const activity = await activityService.getActivityById(userId, activityId)
    return successResponse(res, 'Activity retrieved', activity)
  } catch (err) {
    next(err)
  }
}

export const UpdateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const validation = UpdateActivitySchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }

    const updated = await activityService.updateActivity(userId, activityId, validation.data)
    return successResponse(res, 'Activity updated', updated)
  } catch (err) {
    next(err)
  }
}

export const DeleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    await activityService.deleteActivity(userId, activityId)
    return successResponse(res, 'Activity deleted')
  } catch (err) {
    next(err)
  }
}

export const UploadPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const validation = UploadPointsSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.issues)
    }

    const result = await activityService.uploadPoints(userId, activityId, validation.data)
    return successResponse(res, 'GPS points uploaded', result)
  } catch (err) {
    next(err)
  }
}

export const GetActivityPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const points = await activityService.getActivityPoints(userId, activityId)
    return successResponse(res, 'GPS points retrieved', points)
  } catch (err) {
    next(err)
  }
}

export const SubmitForVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const activityId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!activityId) throw new AppError('Activity ID required', 400, 'ACTIVITY_ID_REQUIRED')

    const activity = await activityService.submitForVerification(userId, activityId)
    return successResponse(res, 'Activity submitted for verification', activity)
  } catch (err) {
    next(err)
  }
}
