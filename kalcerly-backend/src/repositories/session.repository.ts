import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../lib/db'
import { sessions } from '../db/schema/index'

export class SessionRepository {
  async create(data: typeof sessions.$inferInsert) {
    const [session] = await db.insert(sessions).values(data).returning()
    return session!
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    const [session] = await db

      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, refreshTokenHash),
          isNull(sessions.revokedAt)
        )
      )
      .limit(1)
    return session ?? null
  }

  async revoke(id: string) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(sessions.id, id))
  }

  async revokeAllByUserId(userId: string) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(sessions.userId, userId))
  }

  async updateLastUsed(id: string) {
    await db
      .update(sessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(sessions.id, id))
  }
}
