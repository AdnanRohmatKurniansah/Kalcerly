import { eq, and, gt, isNull } from 'drizzle-orm'
import { db } from '../lib/db'
import { emailVerificationTokens } from '../db/schema/index'

export class EmailVerificationRepository {
  async create(data: typeof emailVerificationTokens.$inferInsert) {
    const [token] = await db.insert(emailVerificationTokens).values(data).returning()
    return token!
  }

  async findByTokenHash(tokenHash: string) {
    const [token] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .limit(1)
    return token ?? null
  }

  async findValidByTokenHash(tokenHash: string) {
    const [token] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          isNull(emailVerificationTokens.usedAt),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .limit(1)
    return token ?? null
  }

  async invalidateByUserId(userId: string) {
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.userId, userId),
          isNull(emailVerificationTokens.usedAt)
        )
      )
  }

  async markUsed(id: string) {
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(eq(emailVerificationTokens.id, id))
  }
}
