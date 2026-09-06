import { createHash } from 'crypto'
import { AppError } from '../utils/error'
import { ActivityRepository } from '../repositories/activity.repository'
import { AIService } from './ai.service'
import type { CreateActivityInput, UploadPointsInput } from '../validations/activity.validation'

const activityRepo = new ActivityRepository()
const aiService = new AIService()

// Activity status lifecycle per PRD:
// PENDING → VERIFYING → VERIFIED | NEEDS_REVIEW | REJECTED

export class ActivityService {
  async createActivity(userId: string, input: CreateActivityInput) {
    const startedAt = new Date(input.startedAt)
    const endedAt = new Date(input.endedAt)

    if (endedAt <= startedAt) {
      throw new AppError('endedAt must be after startedAt', 400, 'INVALID_DATE_RANGE')
    }

    const activity = await activityRepo.create({
      userId,
      type: input.type,
      status: 'PENDING',
      title: input.title ?? null,
      description: input.description ?? null,
      distanceMeters: input.distanceMeters,
      durationSeconds: input.durationSeconds,
      elevationMeters: input.elevationMeters ?? 0,
      calories: input.calories ?? 0,
      averagePaceSeconds: input.averagePaceSeconds ?? null,
      averageSpeedMps: input.averageSpeedMps ?? null,
      maxSpeedMps: input.maxSpeedMps ?? null,
      startLatitude: input.startLatitude ?? null,
      startLongitude: input.startLongitude ?? null,
      endLatitude: input.endLatitude ?? null,
      endLongitude: input.endLongitude ?? null,
      startedAt,
      endedAt,
    })

    return activity
  }

  async uploadPoints(userId: string, activityId: string, input: UploadPointsInput) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status === 'VERIFIED' || activity.status === 'REJECTED') {
      throw new AppError('Cannot upload GPS points to a finalized activity', 400, 'ACTIVITY_FINALIZED')
    }

    const points = input.points.map((p) => ({
      activityId,
      sequence: p.sequence,
      latitude: p.latitude,
      longitude: p.longitude,
      altitudeMeters: p.altitudeMeters ?? null,
      accuracyMeters: p.accuracyMeters ?? null,
      speedMps: p.speedMps ?? null,
      timestamp: new Date(p.timestamp),
    }))

    await activityRepo.createPoints(points)
    const totalPoints = await activityRepo.countPoints(activityId)

    return { uploaded: points.length, total: totalPoints }
  }

  async getActivityById(userId: string, activityId: string) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    const [points, verification, stats] = await Promise.all([
      activityRepo.findPointsByActivityId(activityId),
      activityRepo.findVerificationByActivityId(activityId),
      activityRepo.findStatsByActivityId(activityId),
    ])

    return { ...activity, points, verification, stats }
  }

  async listActivities(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      activityRepo.findByUserId(userId, limit, offset),
      activityRepo.countByUserId(userId),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async updateActivity(userId: string, activityId: string, data: { title?: string; description?: string }) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status === 'VERIFIED') {
      throw new AppError('Cannot edit a verified activity', 400, 'ACTIVITY_VERIFIED')
    }

    const updated = await activityRepo.update(activityId, data)
    return updated
  }

  async deleteActivity(userId: string, activityId: string) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status === 'VERIFIED') {
      throw new AppError('Cannot delete a verified activity', 400, 'ACTIVITY_VERIFIED')
    }

    await activityRepo.delete(activityId)
  }

  async submitForVerification(userId: string, activityId: string) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status !== 'PENDING') {
      throw new AppError('Only PENDING activities can be submitted for verification', 400, 'INVALID_STATUS')
    }

    const pointCount = await activityRepo.countPoints(activityId)
    if (pointCount === 0) {
      throw new AppError('Activity has no GPS points. Upload GPS data before verifying.', 400, 'NO_GPS_POINTS')
    }

    // Generate activity hash from key fields (used for blockchain proof)
    const hashPayload = `${activity.userId}:${activity.type}:${activity.distanceMeters}:${activity.durationSeconds}:${activity.startedAt.toISOString()}:${activity.endedAt.toISOString()}`
    const activityHash = '0x' + createHash('sha256').update(hashPayload).digest('hex')

    // Transition to VERIFYING
    await activityRepo.update(activityId, { status: 'VERIFYING', activityHash })

    // Fetch sample GPS points for AI analysis (first, some middle, last — max 20)
    const allPoints = await activityRepo.findPointsByActivityId(activityId)
    const samplePoints = sampleGpsPoints(allPoints, 20)

    // Upsert verification record as PENDING before calling AI
    const existingVerification = await activityRepo.findVerificationByActivityId(activityId)
    if (!existingVerification) {
      await activityRepo.createVerification({
        activityId,
        provider: 'PENDING',
        result: 'PENDING',
      })
    }

    // Call AI verification (async — does not block response but we await for immediate result)
    let aiResult
    try {
      aiResult = await aiService.verifyActivity({
        type: activity.type as 'WALKING' | 'RUNNING' | 'CYCLING',
        distanceMeters: Number(activity.distanceMeters),
        durationSeconds: activity.durationSeconds,
        elevationMeters: activity.elevationMeters ?? 0,
        startedAt: activity.startedAt.toISOString(),
        endedAt: activity.endedAt.toISOString(),
        pointCount,
        samplePoints: samplePoints.map((p) => ({
          sequence: p.sequence,
          latitude: String(p.latitude),
          longitude: String(p.longitude),
          altitudeMeters: p.altitudeMeters ? String(p.altitudeMeters) : null,
          speedMps: p.speedMps ? String(p.speedMps) : null,
          timestamp: p.timestamp.toISOString(),
        })),
      })
    } catch (err) {
      // If AI call itself throws unexpectedly, leave as VERIFYING for manual review
      console.error('[submitForVerification] AI service error:', err)
      const current = await activityRepo.findById(activityId)
      return current
    }

    // Apply AI result
    const now = new Date()
    const statusUpdate: Record<string, unknown> = { status: aiResult.result }
    if (aiResult.result === 'VERIFIED') statusUpdate['verifiedAt'] = now
    if (aiResult.result === 'REJECTED') statusUpdate['rejectedAt'] = now

    const updated = await activityRepo.update(activityId, statusUpdate)

    // Update verification record with AI result
    const verificationRecord = await activityRepo.findVerificationByActivityId(activityId)
    if (verificationRecord) {
      await activityRepo.updateVerification(verificationRecord.id, {
        result: aiResult.result,
        provider: aiResult.provider,
        model: aiResult.model,
        confidence: String(aiResult.confidence),
        score: String(aiResult.score),
        reason: aiResult.reason,
        verifiedAt: now,
      })
    }

    return { ...updated, verification: { result: aiResult.result, provider: aiResult.provider, reason: aiResult.reason } }
  }

  // Called internally or by AI/admin when verification result is available
  async processVerificationResult(
    activityId: string,
    result: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED',
    details?: {
      provider?: string
      model?: string
      confidence?: string
      score?: string
      reason?: string
    }
  ) {
    const activity = await activityRepo.findById(activityId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status !== 'VERIFYING') {
      throw new AppError('Activity is not in VERIFYING status', 400, 'INVALID_STATUS')
    }

    const now = new Date()
    const activityUpdate: Record<string, unknown> = { status: result }

    if (result === 'VERIFIED') {
      activityUpdate['verifiedAt'] = now
    } else if (result === 'REJECTED') {
      activityUpdate['rejectedAt'] = now
    }

    await activityRepo.update(activityId, activityUpdate)

    const verification = await activityRepo.findVerificationByActivityId(activityId)
    if (verification) {
      await activityRepo.updateVerification(verification.id, {
        result,
        provider: details?.provider ?? verification.provider,
        model: details?.model ?? null,
        confidence: details?.confidence ?? null,
        score: details?.score ?? null,
        reason: details?.reason ?? null,
        verifiedAt: now,
      })
    }

    return { activityId, result }
  }

  async getActivityPoints(userId: string, activityId: string) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    return activityRepo.findPointsByActivityId(activityId)
  }
}

// ── Helper ──────────────────────────────────────────────────────────────────

import type { ActivityPoint } from '../db/schema/activity-points'

/**
 * Pick a representative sample of GPS points (first, evenly-spaced middle, last).
 * Keeps the token cost low when sending to AI provider.
 */
function sampleGpsPoints(points: ActivityPoint[], maxSamples: number): ActivityPoint[] {
  if (points.length <= maxSamples) return points

  const result: ActivityPoint[] = []
  const step = (points.length - 1) / (maxSamples - 1)

  for (let i = 0; i < maxSamples; i++) {
    const index = Math.round(i * step)
    const point = points[index]
    if (point) result.push(point)
  }

  return result
}
