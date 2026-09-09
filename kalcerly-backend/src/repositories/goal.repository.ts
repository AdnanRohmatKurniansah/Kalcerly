import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../lib/db'
import { goals } from '../db/schema/index'

export class GoalRepository {
  async create(data: typeof goals.$inferInsert) {
    const [goal] = await db.insert(goals).values(data).returning()
    return goal!
  }

  async findById(id: string) {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id)).limit(1)
    return goal ?? null
  }

  async findByIdAndUserId(id: string, userId: string) {
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .limit(1)
    return goal ?? null
  }

  async findByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countByUserId(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(goals)
      .where(eq(goals.userId, userId))
    return Number(row?.count ?? 0)
  }

  async update(id: string, data: Partial<typeof goals.$inferInsert>) {
    const [goal] = await db
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning()
    return goal ?? null
  }

  async delete(id: string) {
    await db.delete(goals).where(eq(goals.id, id))
  }
}
