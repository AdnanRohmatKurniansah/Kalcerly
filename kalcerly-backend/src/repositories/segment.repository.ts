import { eq, and, desc, sql, asc } from 'drizzle-orm'
import { db } from '../lib/db'
import { segments, segmentEfforts } from '../db/schema/index'

export class SegmentRepository {
  async create(data: typeof segments.$inferInsert) {
    const [segment] = await db.insert(segments).values(data).returning()
    return segment!
  }

  async findById(id: string) {
    const [segment] = await db.select().from(segments).where(eq(segments.id, id)).limit(1)
    return segment ?? null
  }

  async findByIdAndCreatorId(id: string, creatorId: string) {
    const [segment] = await db
      .select()
      .from(segments)
      .where(and(eq(segments.id, id), eq(segments.creatorId, creatorId)))
      .limit(1)
    return segment ?? null
  }

  async findPublic(limit = 20, offset = 0) {
    return db
      .select()
      .from(segments)
      .where(eq(segments.isPublic, true))
      .orderBy(desc(segments.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countPublic() {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(segments)
      .where(eq(segments.isPublic, true))
    return Number(row?.count ?? 0)
  }

  async update(id: string, data: Partial<typeof segments.$inferInsert>) {
    const [segment] = await db
      .update(segments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(segments.id, id))
      .returning()
    return segment ?? null
  }

  async delete(id: string) {
    await db.delete(segments).where(eq(segments.id, id))
  }

  async createEffort(data: typeof segmentEfforts.$inferInsert) {
    const [effort] = await db.insert(segmentEfforts).values(data).returning()
    return effort!
  }

  async findEffortBySegmentAndActivity(segmentId: string, activityId: string) {
    const [effort] = await db
      .select()
      .from(segmentEfforts)
      .where(and(eq(segmentEfforts.segmentId, segmentId), eq(segmentEfforts.activityId, activityId)))
      .limit(1)
    return effort ?? null
  }

  async findLeaderboard(segmentId: string, limit = 20) {
    return db
      .select()
      .from(segmentEfforts)
      .where(eq(segmentEfforts.segmentId, segmentId))
      .orderBy(asc(segmentEfforts.elapsedSeconds))
      .limit(limit)
  }

  async findBestEffortByUser(segmentId: string, userId: string) {
    const [effort] = await db
      .select()
      .from(segmentEfforts)
      .where(and(eq(segmentEfforts.segmentId, segmentId), eq(segmentEfforts.userId, userId)))
      .orderBy(asc(segmentEfforts.elapsedSeconds))
      .limit(1)
    return effort ?? null
  }

  async countLeaderboard(segmentId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(segmentEfforts)
      .where(eq(segmentEfforts.segmentId, segmentId))
    return Number(row?.count ?? 0)
  }

  async updateEffortRanks(segmentId: string) {
    // Re-rank all efforts for a segment by elapsed time (fastest = rank 1)
    const efforts = await db
      .select()
      .from(segmentEfforts)
      .where(eq(segmentEfforts.segmentId, segmentId))
      .orderBy(asc(segmentEfforts.elapsedSeconds))

    for (let i = 0; i < efforts.length; i++) {
      const effort = efforts[i]!
      await db
        .update(segmentEfforts)
        .set({ rank: i + 1, updatedAt: new Date() })
        .where(eq(segmentEfforts.id, effort.id))
    }
  }
}
