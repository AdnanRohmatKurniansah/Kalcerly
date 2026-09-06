import { eq, and, gt, isNull } from 'drizzle-orm'
import { db } from '../lib/db'
import { authNonces } from '../db/schema/index'

export class AuthNonceRepository {
  async create(data: typeof authNonces.$inferInsert) {
    const [nonce] = await db.insert(authNonces).values(data).returning()
    return nonce!
  }

  async findValidByNonce(nonce: string) {
    const [record] = await db
      .select()
      .from(authNonces)
      .where(
        and(
          eq(authNonces.nonce, nonce),
          isNull(authNonces.usedAt),
          gt(authNonces.expiresAt, new Date())
        )
      )
      .limit(1)
    return record ?? null
  }

  async invalidateByWalletAddress(walletAddress: string) {
    await db
      .update(authNonces)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(authNonces.walletAddress, walletAddress),
          isNull(authNonces.usedAt)
        )
      )
  }

  async markUsed(id: string) {
    await db
      .update(authNonces)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(eq(authNonces.id, id))
  }
}
