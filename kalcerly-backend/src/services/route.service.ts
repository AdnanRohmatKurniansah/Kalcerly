import { AppError } from '../utils/error'
import { RouteRepository } from '../repositories/route.repository'
import type { CreateRouteInput } from '../validations/route.validation'

const routeRepo = new RouteRepository()

export class RouteService {
  async createRoute(userId: string, input: CreateRouteInput) {
    return routeRepo.create({
      userId,
      name: input.name,
      description: input.description ?? null,
      activityType: input.activityType,
      distanceMeters: input.distanceMeters,
      estimatedDurationSeconds: input.estimatedDurationSeconds ?? null,
      elevationMeters: input.elevationMeters ?? 0,
      difficulty: input.difficulty ?? null,
      startLatitude: input.startLatitude,
      startLongitude: input.startLongitude,
      endLatitude: input.endLatitude,
      endLongitude: input.endLongitude,
      polyline: input.polyline ?? null,
      isPublic: input.isPublic ?? true,
    })
  }

  async getRouteById(id: string) {
    const route = await routeRepo.findById(id)
    if (!route) throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND')
    return route
  }

  async listPublicRoutes(page: number, limit: number) {
    const offset = (page - 1) * limit
    const [data, total] = await Promise.all([
      routeRepo.findPublic(limit, offset),
      routeRepo.countPublic(),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async updateRoute(userId: string, routeId: string, input: Partial<CreateRouteInput>) {
    const route = await routeRepo.findByIdAndUserId(routeId, userId)
    if (!route) throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND')
    return routeRepo.update(routeId, input)
  }

  async deleteRoute(userId: string, routeId: string) {
    const route = await routeRepo.findByIdAndUserId(routeId, userId)
    if (!route) throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND')
    await routeRepo.delete(routeId)
  }

  async saveRoute(userId: string, routeId: string) {
    const route = await routeRepo.findById(routeId)
    if (!route) throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND')
    await routeRepo.saveRoute(userId, routeId)
    return { saved: true }
  }

  async unsaveRoute(userId: string, routeId: string) {
    await routeRepo.unsaveRoute(userId, routeId)
    return { saved: false }
  }

  async getSavedRoutes(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const rows = await routeRepo.findSavedByUserId(userId, limit, offset)
    return rows.map((r) => r.route)
  }
}
