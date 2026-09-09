import { eq, and, desc, sql, gte, lte } from 'drizzle-orm'
import { db } from '../lib/db'
import { challenges, challengeParticipants, challengeActivityUsages } from '../db/schema/index'

export class ChallengeRepository {
  // ─── Challenges ───────────────────────────────────────────────────────────

  async create(data: typeof challenges.$inferInsert) {
    const [challenge] = await db.insert(challenges).values(data).returning()
    return challenge!
  }

  async findById(id: string) {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1)
    return challenge ?? null
  }

  async findActive(limit = 20, offset = 0) {
    const now = new Date()
    return db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.isActive, true),
          lte(challenges.startAt, now),
          gte(challenges.endAt, now)
        )
      )
      .orderBy(desc(challenges.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countActive() {
    const now = new Date()
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(challenges)
      .where(
        and(
          eq(challenges.isActive, true),
          lte(challenges.startAt, now),
          gte(challenges.endAt, now)
        )
      )
    return Number(row?.count ?? 0)
  }

  async update(id: string, data: Partial<typeof challenges.$inferInsert>) {
    const [challenge] = await db
      .update(challenges)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(challenges.id, id))
      .returning()
    return challenge ?? null
  }

  // ─── Participants ─────────────────────────────────────────────────────────

  async findParticipant(challengeId: string, userId: string) {
    const [participant] = await db
      .select()
      .from(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, userId)
        )
      )
      .limit(1)
    return participant ?? null
  }

  async findParticipantById(id: string) {
    const [participant] = await db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.id, id))
      .limit(1)
    return participant ?? null
  }

  async createParticipant(data: typeof challengeParticipants.$inferInsert) {
    const [participant] = await db.insert(challengeParticipants).values(data).returning()
    return participant!
  }

  async updateParticipant(id: string, data: Partial<typeof challengeParticipants.$inferInsert>) {
    const [participant] = await db
      .update(challengeParticipants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(challengeParticipants.id, id))
      .returning()
    return participant ?? null
  }

  async deleteParticipant(challengeId: string, userId: string) {
    await db
      .delete(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, userId)
        )
      )
  }

  async findParticipantsByChallenge(challengeId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challengeId))
      .orderBy(desc(challengeParticipants.progressDistanceMeters))
      .limit(limit)
      .offset(offset)
  }

  async countParticipants(challengeId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challengeId))
    return Number(row?.count ?? 0)
  }

  async findMyParticipations(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.userId, userId))
      .orderBy(desc(challengeParticipants.joinedAt))
      .limit(limit)
      .offset(offset)
  }

  async countMyParticipations(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.userId, userId))
    return Number(row?.count ?? 0)
  }

  // ─── Activity Usages ──────────────────────────────────────────────────────

  async findActivityUsage(challengeId: string, activityId: string) {
    const [usage] = await db
      .select()
      .from(challengeActivityUsages)
      .where(
        and(
          eq(challengeActivityUsages.challengeId, challengeId),
          eq(challengeActivityUsages.activityId, activityId)
        )
      )
      .limit(1)
    return usage ?? null
  }

  async createActivityUsage(data: typeof challengeActivityUsages.$inferInsert) {
    const [usage] = await db.insert(challengeActivityUsages).values(data).returning()
    return usage!
  }

  async findUsagesByParticipant(participantId: string) {
    return db
      .select()
      .from(challengeActivityUsages)
      .where(eq(challengeActivityUsages.participantId, participantId))
      .orderBy(desc(challengeActivityUsages.createdAt))
  }
}
