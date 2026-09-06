import { eq, and } from 'drizzle-orm'
import { db } from '../lib/db'
import { wallets } from '../db/schema/index'

export class WalletRepository {
  async findByUserId(userId: string) {
    return db.select().from(wallets).where(eq(wallets.userId, userId))
  }

  async findByAddress(address: string) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address)).limit(1)
    return wallet ?? null
  }

  async findByIdAndUserId(id: string, userId: string) {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
      .limit(1)
    return wallet ?? null
  }

  async create(data: typeof wallets.$inferInsert) {
    const [wallet] = await db.insert(wallets).values(data).returning()
    return wallet!
  }

  async unsetPrimaryForUser(userId: string) {
    await db
      .update(wallets)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
  }

  async setPrimary(id: string, userId: string) {
    const [wallet] = await db
      .update(wallets)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
      .returning()
    return wallet ?? null
  }

  async deleteById(id: string) {
    await db.delete(wallets).where(eq(wallets.id, id))
  }
}
