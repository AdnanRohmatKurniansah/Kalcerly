import { AppError } from '../utils/error'
import { SegmentRepository } from '../repositories/segment.repository'
import { ActivityRepository } from '../repositories/activity.repository'
import type { CreateSegmentInput, CreateSegmentEffortInput } from '../validations/segment.validation'

const segmentRepo = new SegmentRepository()
const activityRepo = new ActivityRepository()

export class SegmentService {
  async createSegment(userId: string, input: CreateSegmentInput) {
    return segmentRepo.create({
      creatorId: userId,
      name: input.name,
      activityType: input.activityType,
      distanceMeters: input.distanceMeters,
      elevationGainMeters: input.elevationGainMeters ?? 0,
      startLatitude: input.startLatitude,
      startLongitude: input.startLongitude,
      endLatitude: input.endLatitude,
      endLongitude: input.endLongitude,
      polyline: input.polyline ?? null,
      isPublic: input.isPublic ?? true,
    })
  }

  async getSegmentById(id: string) {
    const segment = await segmentRepo.findById(id)
    if (!segment) throw new AppError('Segment not found', 404, 'SEGMENT_NOT_FOUND')
    return segment
  }

  async listSegments(page: number, limit: number) {
    const offset = (page - 1) * limit
    const [data, total] = await Promise.all([
      segmentRepo.findPublic(limit, offset),
      segmentRepo.countPublic(),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async deleteSegment(userId: string, segmentId: string) {
    const segment = await segmentRepo.findByIdAndCreatorId(segmentId, userId)
    if (!segment) throw new AppError('Segment not found', 404, 'SEGMENT_NOT_FOUND')
    await segmentRepo.delete(segmentId)
  }

  async recordEffort(userId: string, segmentId: string, input: CreateSegmentEffortInput) {
    const segment = await segmentRepo.findById(segmentId)
    if (!segment) throw new AppError('Segment not found', 404, 'SEGMENT_NOT_FOUND')

    // Verify the activity belongs to this user and is VERIFIED
    const activity = await activityRepo.findByIdAndUserId(input.activityId, userId)
    if (!activity) throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    if (activity.status !== 'VERIFIED') {
      throw new AppError('Only VERIFIED activities can record segment efforts', 400, 'ACTIVITY_NOT_VERIFIED')
    }

    // Prevent duplicate effort for same segment + activity
    const existing = await segmentRepo.findEffortBySegmentAndActivity(segmentId, input.activityId)
    if (existing) {
      throw new AppError('Effort already recorded for this activity on this segment', 409, 'EFFORT_EXISTS')
    }

    // Check if this is user's personal best on this segment
    const bestEffort = await segmentRepo.findBestEffortByUser(segmentId, userId)
    const isPersonalBest = !bestEffort || input.elapsedSeconds < bestEffort.elapsedSeconds

    // If new personal best, unset previous personal best
    if (isPersonalBest && bestEffort) {
      await segmentRepo.update(segmentId, {}) // just trigger rank update below
    }

    const effort = await segmentRepo.createEffort({
      segmentId,
      activityId: input.activityId,
      userId,
      elapsedSeconds: input.elapsedSeconds,
      averageSpeedMps: input.averageSpeedMps ?? null,
      isPersonalBest,
    })

    // Re-rank all efforts for this segment
    await segmentRepo.updateEffortRanks(segmentId)

    return effort
  }

  async getLeaderboard(segmentId: string, limit: number) {
    const segment = await segmentRepo.findById(segmentId)
    if (!segment) throw new AppError('Segment not found', 404, 'SEGMENT_NOT_FOUND')

    const [efforts, total] = await Promise.all([
      segmentRepo.findLeaderboard(segmentId, limit),
      segmentRepo.countLeaderboard(segmentId),
    ])

    return { segment, efforts, total }
  }
}
