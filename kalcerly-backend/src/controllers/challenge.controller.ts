import type { Request, Response, NextFunction } from 'express'
import { ChallengeService } from '../services/challenge.service'
import {
  CreateChallengeSchema,
  ListChallengesSchema,
  AddProgressSchema,
} from '../validations/challenge.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const challengeService = new ChallengeService()

export const CreateChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = CreateChallengeSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const challenge = await challengeService.createChallenge(userId, validation.data)
    return successResponse(res, 'Challenge created', challenge, 201)
  } catch (err) {
    next(err)
  }
}

export const ListChallenges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = ListChallengesSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const { page, limit } = validation.data
    const result = await challengeService.listChallenges(page, limit)
    return successResponse(res, 'Challenges retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}

export const GetChallengeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const challengeId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!challengeId) throw new AppError('Challenge ID required', 400, 'CHALLENGE_ID_REQUIRED')

    const challenge = await challengeService.getChallengeById(challengeId, userId)
    return successResponse(res, 'Challenge retrieved', challenge)
  } catch (err) {
    next(err)
  }
}

export const JoinChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const challengeId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!challengeId) throw new AppError('Challenge ID required', 400, 'CHALLENGE_ID_REQUIRED')

    const participant = await challengeService.joinChallenge(userId, challengeId)
    return successResponse(res, 'Joined challenge successfully', participant, 201)
  } catch (err) {
    next(err)
  }
}

export const LeaveChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const challengeId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!challengeId) throw new AppError('Challenge ID required', 400, 'CHALLENGE_ID_REQUIRED')

    await challengeService.leaveChallenge(userId, challengeId)
    return successResponse(res, 'Left challenge successfully')
  } catch (err) {
    next(err)
  }
}

export const AddProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const challengeId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!challengeId) throw new AppError('Challenge ID required', 400, 'CHALLENGE_ID_REQUIRED')

    const validation = AddProgressSchema.safeParse(req.body)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const result = await challengeService.addProgress(userId, challengeId, validation.data.activityId)
    return successResponse(res, 'Progress added', result)
  } catch (err) {
    next(err)
  }
}

export const GetMyParticipations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const validation = ListChallengesSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const { page, limit } = validation.data
    const result = await challengeService.getMyParticipations(userId, page, limit)
    return successResponse(res, 'My participations retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}

export const GetParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const challengeId = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    if (!challengeId) throw new AppError('Challenge ID required', 400, 'CHALLENGE_ID_REQUIRED')

    const validation = ListChallengesSchema.safeParse(req.query)
    if (!validation.success) {
      throw new AppError('Validation failed', 400, validation.error.flatten().fieldErrors)
    }

    const { page, limit } = validation.data
    const result = await challengeService.getParticipants(challengeId, page, limit)
    return successResponse(res, 'Participants retrieved', result.data, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (err) {
    next(err)
  }
}
