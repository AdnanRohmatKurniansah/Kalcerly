import type { Request, Response, NextFunction } from 'express'
import { RouteService } from '../services/route.service'
import { CreateRouteSchema, UpdateRouteSchema, ListRoutesSchema } from '../validations/route.validation'
import { successResponse } from '../utils/response'
import { AppError } from '../utils/error'
import type { AuthRequest } from '../middlewares/auth.middleware'

const routeService = new RouteService()

const getId = (req: Request) =>
  Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']

export const CreateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const v = CreateRouteSchema.safeParse(req.body)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const route = await routeService.createRoute(userId, v.data)
    return successResponse(res, 'Route created', route, 201)
  } catch (err) { next(err) }
}

export const GetRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = ListRoutesSchema.safeParse(req.query)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const result = await routeService.listPublicRoutes(v.data.page, v.data.limit)
    return successResponse(res, 'Routes retrieved', result.data, 200, {
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    })
  } catch (err) { next(err) }
}

export const GetRouteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getId(req)
    if (!id) throw new AppError('Route ID required', 400, 'ROUTE_ID_REQUIRED')
    const route = await routeService.getRouteById(id)
    return successResponse(res, 'Route retrieved', route)
  } catch (err) { next(err) }
}

export const UpdateRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const id = getId(req)
    if (!id) throw new AppError('Route ID required', 400, 'ROUTE_ID_REQUIRED')
    const v = UpdateRouteSchema.safeParse(req.body)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const route = await routeService.updateRoute(userId, id, v.data)
    return successResponse(res, 'Route updated', route)
  } catch (err) { next(err) }
}

export const DeleteRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const id = getId(req)
    if (!id) throw new AppError('Route ID required', 400, 'ROUTE_ID_REQUIRED')
    await routeService.deleteRoute(userId, id)
    return successResponse(res, 'Route deleted')
  } catch (err) { next(err) }
}

export const SaveRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const id = getId(req)
    if (!id) throw new AppError('Route ID required', 400, 'ROUTE_ID_REQUIRED')
    const result = await routeService.saveRoute(userId, id)
    return successResponse(res, 'Route saved', result, 201)
  } catch (err) { next(err) }
}

export const UnsaveRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const id = getId(req)
    if (!id) throw new AppError('Route ID required', 400, 'ROUTE_ID_REQUIRED')
    const result = await routeService.unsaveRoute(userId, id)
    return successResponse(res, 'Route unsaved', result)
  } catch (err) { next(err) }
}

export const GetSavedRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    const v = ListRoutesSchema.safeParse(req.query)
    if (!v.success) throw new AppError('Validation failed', 400, v.error.issues)
    const routes = await routeService.getSavedRoutes(userId, v.data.page, v.data.limit)
    return successResponse(res, 'Saved routes retrieved', routes)
  } catch (err) { next(err) }
}
