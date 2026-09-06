import { pgTable, uuid, varchar, numeric, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activities'
import { wallets } from './wallets'
import { blockchainTransactions } from './blockchain-transactions'

export const rewards = pgTable('rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').references(() => activities.id, { onDelete: 'set null' }).unique(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'set null' }),
  rewardType: varchar('reward_type', { length: 30 }).notNull(),
  amountBaseUnits: numeric('amount_base_units', { precision: 78, scale: 0 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('PENDING'),
  contractAddress: varchar('contract_address', { length: 42 }),
  transactionId: uuid('transaction_id').references(() => blockchainTransactions.id, { onDelete: 'set null' }),
  rewardedAt: timestamp('rewarded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const rewardDailyLimits = pgTable(
  'reward_daily_limits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    rewardDate: varchar('reward_date', { length: 10 }).notNull(),
    totalAmountBaseUnits: numeric('total_amount_base_units', { precision: 78, scale: 0 }).notNull().default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_reward_daily_limits_user_date').on(t.userId, t.rewardDate)]
)

export type Reward = typeof rewards.$inferSelect
export type NewReward = typeof rewards.$inferInsert
