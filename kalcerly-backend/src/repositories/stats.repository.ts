import { eq, desc, and, sql } from 'drizzle-orm'
import { db } from '../lib/db'
import {
  userStatistics,
  activityStatistics,
  personalRecords,
  achievements,
  userAchievements,
} from '../db/schema/index'

export class StatsRepository {
  // ─── User Statistics ──────────────────────────────────────────────────────

  async findUserStats(userId: string) {
    const [row] = await db
      .select()
      .from(userStatistics)
      .where(eq(userStatistics.userId, userId))
      .limit(1)
    return row ?? null
  }

  async upsertUserStats(userId: string, data: Partial<typeof userStatistics.$inferInsert>) {
    const existing = await this.findUserStats(userId)
    if (existing) {
      const [updated] = await db
        .update(userStatistics)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userStatistics.userId, userId))
        .returning()
      return updated!
    }
    const [created] = await db
      .insert(userStatistics)
      .values({ userId, ...data })
      .returning()
    return created!
  }

  // ─── Activity Statistics ──────────────────────────────────────────────────

  async findActivityStats(activityId: string) {
    const [row] = await db
      .select()
      .from(activityStatistics)
      .where(eq(activityStatistics.activityId, activityId))
      .limit(1)
    return row ?? null
  }

  // ─── Personal Records ─────────────────────────────────────────────────────

  async findPersonalRecords(userId: string, activityType?: string) {
    const query = db
      .select()
      .from(personalRecords)
      .where(
        activityType
          ? and(eq(personalRecords.userId, userId), eq(personalRecords.activityType, activityType))
          : eq(personalRecords.userId, userId)
      )
      .orderBy(desc(personalRecords.achievedAt))
    return query
  }

  async findPersonalRecord(userId: string, activityType: string, recordType: string) {
    const [row] = await db
      .select()
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.userId, userId),
          eq(personalRecords.activityType, activityType),
          eq(personalRecords.recordType, recordType)
        )
      )
      .limit(1)
    return row ?? null
  }

  async upsertPersonalRecord(data: typeof personalRecords.$inferInsert) {
    const existing = await this.findPersonalRecord(
      data.userId,
      data.activityType,
      data.recordType
    )
    if (existing) {
      const [updated] = await db
        .update(personalRecords)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(personalRecords.id, existing.id))
        .returning()
      return updated!
    }
    const [created] = await db.insert(personalRecords).values(data).returning()
    return created!
  }

  // ─── Achievements ─────────────────────────────────────────────────────────

  async findAllAchievements() {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.type, achievements.name)
  }

  async findUserAchievements(userId: string) {
    return db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt))
  }

  async findUserAchievement(userId: string, achievementId: string) {
    const [row] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .limit(1)
    return row ?? null
  }

  async upsertUserAchievement(
    userId: string,
    achievementId: string,
    progressValue: number,
    unlockedAt?: Date
  ) {
    const existing = await this.findUserAchievement(userId, achievementId)
    if (existing) {
      const [updated] = await db
        .update(userAchievements)
        .set({
          progressValue,
          ...(unlockedAt && { unlockedAt }),
          updatedAt: new Date(),
        })
        .where(eq(userAchievements.id, existing.id))
        .returning()
      return updated!
    }
    const [created] = await db
      .insert(userAchievements)
      .values({ userId, achievementId, progressValue, unlockedAt })
      .returning()
    return created!
  }

  // ─── Leaderboard (user stats ranked by total distance) ───────────────────

  async getLeaderboard(activityType: 'WALKING' | 'RUNNING' | 'CYCLING' | 'TOTAL', limit = 50) {
    const distanceColumn =
      activityType === 'WALKING'
        ? userStatistics.totalWalkingDistanceMeters
        : activityType === 'RUNNING'
          ? userStatistics.totalRunningDistanceMeters
          : activityType === 'CYCLING'
            ? userStatistics.totalCyclingDistanceMeters
            : userStatistics.totalDistanceMeters

    return db
      .select({
        userId: userStatistics.userId,
        totalDistanceMeters: distanceColumn,
        totalActivities: userStatistics.totalActivities,
        currentStreak: userStatistics.currentStreak,
      })
      .from(userStatistics)
      .orderBy(desc(distanceColumn))
      .limit(limit)
  }

  async getStreakLeaderboard(limit = 50) {
    return db
      .select({
        userId: userStatistics.userId,
        currentStreak: userStatistics.currentStreak,
        longestStreak: userStatistics.longestStreak,
        totalActivities: userStatistics.totalActivities,
      })
      .from(userStatistics)
      .where(sql`${userStatistics.currentStreak} > 0`)
      .orderBy(desc(userStatistics.currentStreak))
      .limit(limit)
  }
}
