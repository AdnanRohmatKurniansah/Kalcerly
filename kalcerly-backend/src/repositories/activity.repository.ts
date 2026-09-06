import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../lib/db'
import {
  activities,
  activityPoints,
  activityVerifications,
  activityStatistics,
} from '../db/schema/index'

export class ActivityRepository {
  // ── Activities ──────────────────────────────────────────────────────────────

  async create(data: typeof activities.$inferInsert) {
    const [activity] = await db.insert(activities).values(data).returning()
    return activity!
  }

  async findById(id: string) {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id)).limit(1)
    return activity ?? null
  }

  async findByIdAndUserId(id: string, userId: string) {
    const [activity] = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .limit(1)
    return activity ?? null
  }

  async findByUserId(
    userId: string,
    limit = 20,
    offset = 0
  ) {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.startedAt))
      .limit(limit)
      .offset(offset)
  }

  async countByUserId(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(eq(activities.userId, userId))
    return Number(row?.count ?? 0)
  }

  async update(id: string, data: Partial<typeof activities.$inferInsert>) {
    const [activity] = await db
      .update(activities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning()
    return activity ?? null
  }

  async delete(id: string) {
    await db.delete(activities).where(eq(activities.id, id))
  }

  // ── Activity Points (GPS) ────────────────────────────────────────────────────

  async createPoints(points: (typeof activityPoints.$inferInsert)[]) {
    if (points.length === 0) return []
    return db.insert(activityPoints).values(points).returning()
  }

  async findPointsByActivityId(activityId: string) {
    return db
      .select()
      .from(activityPoints)
      .where(eq(activityPoints.activityId, activityId))
      .orderBy(activityPoints.sequence)
  }

  async countPoints(activityId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(activityPoints)
      .where(eq(activityPoints.activityId, activityId))
    return Number(row?.count ?? 0)
  }

  // ── Activity Verifications ───────────────────────────────────────────────────

  async createVerification(data: typeof activityVerifications.$inferInsert) {
    const [record] = await db.insert(activityVerifications).values(data).returning()
    return record!
  }

  async findVerificationByActivityId(activityId: string) {
    const [record] = await db
      .select()
      .from(activityVerifications)
      .where(eq(activityVerifications.activityId, activityId))
      .limit(1)
    return record ?? null
  }

  async updateVerification(id: string, data: Partial<typeof activityVerifications.$inferInsert>) {
    const [record] = await db
      .update(activityVerifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(activityVerifications.id, id))
      .returning()
    return record ?? null
  }

  // ── Activity Statistics ──────────────────────────────────────────────────────

  async createStatistics(data: typeof activityStatistics.$inferInsert) {
    const [record] = await db.insert(activityStatistics).values(data).returning()
    return record!
  }

  async findStatsByActivityId(activityId: string) {
    const [record] = await db
      .select()
      .from(activityStatistics)
      .where(eq(activityStatistics.activityId, activityId))
      .limit(1)
    return record ?? null
  }
}
