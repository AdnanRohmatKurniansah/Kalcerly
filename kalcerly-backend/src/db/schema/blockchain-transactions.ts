import { pgTable, uuid, varchar, bigint, numeric, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activities'

export const blockchainTransactions = pgTable('blockchain_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  activityId: uuid('activity_id').references(() => activities.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 50 }).notNull(),
  chainId: bigint('chain_id', { mode: 'number' }).notNull(),
  contractAddress: varchar('contract_address', { length: 42 }).notNull(),
  functionName: varchar('function_name', { length: 100 }).notNull(),
  transactionHash: varchar('transaction_hash', { length: 66 }).unique(),
  blockNumber: bigint('block_number', { mode: 'number' }),
  status: varchar('status', { length: 30 }).notNull().default('PENDING'),
  gasUsed: numeric('gas_used', { precision: 78, scale: 0 }),
  gasPrice: numeric('gas_price', { precision: 78, scale: 0 }),
  errorMessage: text('error_message'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect
export type NewBlockchainTransaction = typeof blockchainTransactions.$inferInsert
