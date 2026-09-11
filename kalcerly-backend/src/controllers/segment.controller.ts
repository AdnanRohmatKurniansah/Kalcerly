import type { Request, Response, NextFunction } from 'express'
import { SegmentService } from '../services/segment.service'
import {
  CreateSegmentSchema,
  CreateSegmentEffortSchema,
  ListSegmentsSchema,
} from '../validations/segment.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const segmentService = new SegmentService()

const getId = (req: Request) =>
  Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']

export const CreateSegment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const validation = CreateSegmentSchema.safeParse(req.body)
    if (!validation.success) throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    const segment = await segmentService.createSegment(userId, validation.data)
    return successResponse(res, 'Segment created', segment, 201)
  } catch (err) { next(err) }
}

export const GetSegments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = ListSegmentsSchema.safeParse(req.query)
    if (!validation.success) throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    const result = await segmentService.listSegments(validation.data.page, validation.data.limit)
    return successResponse(res, 'Segments retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const GetSegmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getId(req)
    if (!id) throw new AppError('Segment ID required', 400, 'SEGMENT_ID_REQUIRED')
    const segment = await segmentService.getSegmentById(id)
    return successResponse(res, 'Segment retrieved', segment)
  } catch (err) { next(err) }
}

export const DeleteSegment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const id = getId(req)
    if (!id) throw new AppError('Segment ID required', 400, 'SEGMENT_ID_REQUIRED')
    await segmentService.deleteSegment(userId, id)
    return successResponse(res, 'Segment deleted')
  } catch (err) { next(err) }
}

export const RecordEffort = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const id = getId(req)
    if (!id) throw new AppError('Segment ID required', 400, 'SEGMENT_ID_REQUIRED')
    const validation = CreateSegmentEffortSchema.safeParse(req.body)
    if (!validation.success) throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    const effort = await segmentService.recordEffort(userId, id, validation.data)
    return successResponse(res, 'Segment effort recorded', effort, 201)
  } catch (err) { next(err) }
}

export const GetLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getId(req)
    if (!id) throw new AppError('Segment ID required', 400, 'SEGMENT_ID_REQUIRED')
    const limit = Math.min(Number(req.query['limit'] ?? 20), 100)
    const result = await segmentService.getLeaderboard(id, limit)
    return successResponse(res, 'Leaderboard retrieved', result)
  } catch (err) { next(err) }
}
