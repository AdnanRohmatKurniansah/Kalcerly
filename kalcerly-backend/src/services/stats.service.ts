import { AppError } from '../utils/error'
import { StatsRepository } from '../repositories/stats.repository'
import { ActivityRepository } from '../repositories/activity.repository'

const statsRepo = new StatsRepository()
const activityRepo = new ActivityRepository()

// ─── Achievement definitions (seeded in DB, referenced by code) ───────────────
// These map achievement codes to the condition used to check unlock
const ACHIEVEMENT_CODES = {
  FIRST_ACTIVITY: 'FIRST_ACTIVITY',
  FIRST_RUN: 'FIRST_RUN',
  FIRST_WALK: 'FIRST_WALK',
  FIRST_CYCLING: 'FIRST_CYCLING',
  DISTANCE_10K: 'DISTANCE_10K',
  DISTANCE_50K: 'DISTANCE_50K',
  DISTANCE_100K: 'DISTANCE_100K',
  DISTANCE_500K: 'DISTANCE_500K',
  STREAK_7: 'STREAK_7',
  STREAK_30: 'STREAK_30',
  ACTIVITIES_10: 'ACTIVITIES_10',
  ACTIVITIES_50: 'ACTIVITIES_50',
  ACTIVITIES_100: 'ACTIVITIES_100',
} as const

export class StatsService {
  // ─── User Statistics ──────────────────────────────────────────────────────

  async getUserStats(userId: string) {
    const stats = await statsRepo.findUserStats(userId)
    if (!stats) {
      // Return default zeroed stats if not yet initialised
      return {
        userId,
        totalActivities: 0,
        totalDistanceMeters: 0,
        totalDurationSeconds: 0,
        totalElevationMeters: 0,
        totalCalories: 0,
        totalWalkingDistanceMeters: 0,
        totalRunningDistanceMeters: 0,
        totalCyclingDistanceMeters: 0,
        currentStreak: 0,
        longestStreak: 0,
      }
    }
    return stats
  }

  // Called after a VERIFIED activity — updates cumulative user stats
  async updateUserStatsFromActivity(
    userId: string,
    activity: {
      type: string
      distanceMeters: number
      durationSeconds: number
      elevationMeters: number | null
      calories: number | null
    }
  ) {
    const existing = (await statsRepo.findUserStats(userId)) ?? {
      totalActivities: 0,
      totalDistanceMeters: 0,
      totalDurationSeconds: 0,
      totalElevationMeters: 0,
      totalCalories: 0,
      totalWalkingDistanceMeters: 0,
      totalRunningDistanceMeters: 0,
      totalCyclingDistanceMeters: 0,
      currentStreak: 0,
      longestStreak: 0,
    }

    const updates = {
      totalActivities: (existing.totalActivities ?? 0) + 1,
      totalDistanceMeters: (existing.totalDistanceMeters ?? 0) + Number(activity.distanceMeters),
      totalDurationSeconds: (existing.totalDurationSeconds ?? 0) + activity.durationSeconds,
      totalElevationMeters: (existing.totalElevationMeters ?? 0) + (activity.elevationMeters ?? 0),
      totalCalories: (existing.totalCalories ?? 0) + (activity.calories ?? 0),
      totalWalkingDistanceMeters:
        activity.type === 'WALKING'
          ? (existing.totalWalkingDistanceMeters ?? 0) + Number(activity.distanceMeters)
          : existing.totalWalkingDistanceMeters ?? 0,
      totalRunningDistanceMeters:
        activity.type === 'RUNNING'
          ? (existing.totalRunningDistanceMeters ?? 0) + Number(activity.distanceMeters)
          : existing.totalRunningDistanceMeters ?? 0,
      totalCyclingDistanceMeters:
        activity.type === 'CYCLING'
          ? (existing.totalCyclingDistanceMeters ?? 0) + Number(activity.distanceMeters)
          : existing.totalCyclingDistanceMeters ?? 0,
    }

    return statsRepo.upsertUserStats(userId, updates)
  }

  // ─── Personal Records ─────────────────────────────────────────────────────

  async getPersonalRecords(userId: string, activityType?: string) {
    return statsRepo.findPersonalRecords(userId, activityType)
  }

  // Called after a VERIFIED activity — checks and updates personal records
  async checkAndUpdatePersonalRecords(
    userId: string,
    activity: {
      id: string
      type: string
      distanceMeters: number
      durationSeconds: number
      averageSpeedMps: string | null
      averagePaceSeconds: number | null
      startedAt: Date
    }
  ) {
    const updated: string[] = []
    const achievedAt = activity.startedAt

    // LONGEST_DISTANCE
    const existingDist = await statsRepo.findPersonalRecord(userId, activity.type, 'LONGEST_DISTANCE')
    if (!existingDist || Number(activity.distanceMeters) > (existingDist.distanceMeters ?? 0)) {
      await statsRepo.upsertPersonalRecord({
        userId,
        activityType: activity.type,
        recordType: 'LONGEST_DISTANCE',
        distanceMeters: Number(activity.distanceMeters),
        activityId: activity.id,
        achievedAt,
      })
      updated.push('LONGEST_DISTANCE')
    }

    // LONGEST_DURATION
    const existingDur = await statsRepo.findPersonalRecord(userId, activity.type, 'LONGEST_DURATION')
    if (!existingDur || activity.durationSeconds > (existingDur.durationSeconds ?? 0)) {
      await statsRepo.upsertPersonalRecord({
        userId,
        activityType: activity.type,
        recordType: 'LONGEST_DURATION',
        durationSeconds: activity.durationSeconds,
        activityId: activity.id,
        achievedAt,
      })
      updated.push('LONGEST_DURATION')
    }

    // HIGHEST_SPEED
    if (activity.averageSpeedMps) {
      const existingSpeed = await statsRepo.findPersonalRecord(userId, activity.type, 'HIGHEST_SPEED')
      const currentSpeed = parseFloat(activity.averageSpeedMps)
      if (!existingSpeed || currentSpeed > parseFloat(String(existingSpeed.speedMps ?? '0'))) {
        await statsRepo.upsertPersonalRecord({
          userId,
          activityType: activity.type,
          recordType: 'HIGHEST_SPEED',
          speedMps: String(currentSpeed),
          activityId: activity.id,
          achievedAt,
        })
        updated.push('HIGHEST_SPEED')
      }
    }

    // Distance-based pace records for RUNNING (FASTEST_1K, FASTEST_5K, FASTEST_10K)
    if (activity.type === 'RUNNING' && activity.averagePaceSeconds && activity.distanceMeters >= 1000) {
      const paceRecords = [
        { type: 'FASTEST_1K', minDistance: 1000 },
        { type: 'FASTEST_5K', minDistance: 5000 },
        { type: 'FASTEST_10K', minDistance: 10000 },
      ]

      for (const { type: rType, minDistance } of paceRecords) {
        if (Number(activity.distanceMeters) >= minDistance) {
          const existing = await statsRepo.findPersonalRecord(userId, activity.type, rType)
          // Lower pace = faster
          if (!existing || activity.averagePaceSeconds < (existing.paceSeconds ?? Infinity)) {
            await statsRepo.upsertPersonalRecord({
              userId,
              activityType: activity.type,
              recordType: rType,
              paceSeconds: activity.averagePaceSeconds,
              distanceMeters: Number(activity.distanceMeters),
              activityId: activity.id,
              achievedAt,
            })
            updated.push(rType)
          }
        }
      }
    }

    return updated
  }

  // ─── Achievements ─────────────────────────────────────────────────────────

  async getAllAchievements() {
    return statsRepo.findAllAchievements()
  }

  async getUserAchievements(userId: string) {
    return statsRepo.findUserAchievements(userId)
  }

  // Called after stats update — checks which achievements should unlock
  async checkAndUnlockAchievements(
    userId: string,
    stats: {
      totalActivities: number
      totalDistanceMeters: number
      currentStreak: number
      activityType: string
    }
  ) {
    const allAchievements = await statsRepo.findAllAchievements()
    const unlocked: string[] = []

    for (const achievement of allAchievements) {
      const existing = await statsRepo.findUserAchievement(userId, achievement.id)
      if (existing?.unlockedAt) continue // already unlocked

      let progress = 0
      let shouldUnlock = false
      const req = achievement.requirementValue ?? 0

      switch (achievement.code) {
        case ACHIEVEMENT_CODES.FIRST_ACTIVITY:
          progress = stats.totalActivities
          shouldUnlock = stats.totalActivities >= 1
          break
        case ACHIEVEMENT_CODES.FIRST_RUN:
          progress = stats.activityType === 'RUNNING' ? 1 : 0
          shouldUnlock = stats.activityType === 'RUNNING'
          break
        case ACHIEVEMENT_CODES.FIRST_WALK:
          progress = stats.activityType === 'WALKING' ? 1 : 0
          shouldUnlock = stats.activityType === 'WALKING'
          break
        case ACHIEVEMENT_CODES.FIRST_CYCLING:
          progress = stats.activityType === 'CYCLING' ? 1 : 0
          shouldUnlock = stats.activityType === 'CYCLING'
          break
        case ACHIEVEMENT_CODES.ACTIVITIES_10:
        case ACHIEVEMENT_CODES.ACTIVITIES_50:
        case ACHIEVEMENT_CODES.ACTIVITIES_100:
          progress = stats.totalActivities
          shouldUnlock = req > 0 && stats.totalActivities >= req
          break
        case ACHIEVEMENT_CODES.DISTANCE_10K:
        case ACHIEVEMENT_CODES.DISTANCE_50K:
        case ACHIEVEMENT_CODES.DISTANCE_100K:
        case ACHIEVEMENT_CODES.DISTANCE_500K:
          progress = stats.totalDistanceMeters
          shouldUnlock = req > 0 && stats.totalDistanceMeters >= req
          break
        case ACHIEVEMENT_CODES.STREAK_7:
        case ACHIEVEMENT_CODES.STREAK_30:
          progress = stats.currentStreak
          shouldUnlock = req > 0 && stats.currentStreak >= req
          break
      }

      await statsRepo.upsertUserAchievement(
        userId,
        achievement.id,
        progress,
        shouldUnlock ? new Date() : undefined
      )

      if (shouldUnlock) unlocked.push(achievement.code)
    }

    return unlocked
  }

  // ─── Leaderboards ─────────────────────────────────────────────────────────

  async getDistanceLeaderboard(
    activityType: 'WALKING' | 'RUNNING' | 'CYCLING' | 'TOTAL',
    limit: number
  ) {
    const rows = await statsRepo.getLeaderboard(activityType, limit)
    return rows.map((row, index) => ({ rank: index + 1, ...row }))
  }

  async getStreakLeaderboard(limit: number) {
    const rows = await statsRepo.getStreakLeaderboard(limit)
    return rows.map((row, index) => ({ rank: index + 1, ...row }))
  }
}
