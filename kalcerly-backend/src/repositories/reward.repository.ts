import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../lib/db'
import { rewards, rewardDailyLimits, activityProofs, blockchainTransactions } from '../db/schema/index'

export class RewardRepository {
  // ─── Rewards ──────────────────────────────────────────────────────────────

  async create(data: typeof rewards.$inferInsert) {
    const [reward] = await db.insert(rewards).values(data).returning()
    return reward!
  }

  async findById(id: string) {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1)
    return reward ?? null
  }

  async findByActivityId(activityId: string) {
    const [reward] = await db
      .select()
      .from(rewards)
      .where(eq(rewards.activityId, activityId))
      .limit(1)
    return reward ?? null
  }

  async findByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(rewards)
      .where(eq(rewards.userId, userId))
      .orderBy(desc(rewards.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countByUserId(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rewards)
      .where(eq(rewards.userId, userId))
    return Number(row?.count ?? 0)
  }

  async update(id: string, data: Partial<typeof rewards.$inferInsert>) {
    const [reward] = await db
      .update(rewards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rewards.id, id))
      .returning()
    return reward ?? null
  }

  // ─── Daily Limits ─────────────────────────────────────────────────────────

  async findDailyLimit(userId: string, rewardDate: string) {
    const [row] = await db
      .select()
      .from(rewardDailyLimits)
      .where(
        and(
          eq(rewardDailyLimits.userId, userId),
          eq(rewardDailyLimits.rewardDate, rewardDate)
        )
      )
      .limit(1)
    return row ?? null
  }

  async upsertDailyLimit(userId: string, rewardDate: string, additionalAmount: bigint) {
    const existing = await this.findDailyLimit(userId, rewardDate)

    if (existing) {
      const newTotal = BigInt(existing.totalAmountBaseUnits ?? '0') + additionalAmount
      const [updated] = await db
        .update(rewardDailyLimits)
        .set({ totalAmountBaseUnits: newTotal.toString(), updatedAt: new Date() })
        .where(eq(rewardDailyLimits.id, existing.id))
        .returning()
      return updated!
    }

    const [created] = await db
      .insert(rewardDailyLimits)
      .values({
        userId,
        rewardDate,
        totalAmountBaseUnits: additionalAmount.toString(),
      })
      .returning()
    return created!
  }

  // ─── Activity Proofs ──────────────────────────────────────────────────────

  async findProofByActivityId(activityId: string) {
    const [proof] = await db
      .select()
      .from(activityProofs)
      .where(eq(activityProofs.activityId, activityId))
      .limit(1)
    return proof ?? null
  }

  async createProof(data: typeof activityProofs.$inferInsert) {
    const [proof] = await db.insert(activityProofs).values(data).returning()
    return proof!
  }

  async updateProof(id: string, data: Partial<typeof activityProofs.$inferInsert>) {
    const [proof] = await db
      .update(activityProofs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(activityProofs.id, id))
      .returning()
    return proof ?? null
  }

  // ─── Transactions ─────────────────────────────────────────────────────────

  async findTransactionById(id: string) {
    const [tx] = await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.id, id))
      .limit(1)
    return tx ?? null
  }

  async findTransactionsByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.userId, userId))
      .orderBy(desc(blockchainTransactions.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countTransactionsByUserId(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.userId, userId))
    return Number(row?.count ?? 0)
  }
}
