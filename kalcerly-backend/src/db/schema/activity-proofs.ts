import { pgTable, uuid, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { activities } from './activities'
import { blockchainTransactions } from './blockchain-transactions'

export const activityProofs = pgTable('activity_proofs', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }).unique(),
  activityHash: varchar('activity_hash', { length: 66 }).notNull().unique(),
  contractAddress: varchar('contract_address', { length: 42 }).notNull(),
  blockchainId: integer('blockchain_id').notNull(),
  proofId: varchar('proof_id', { length: 100 }),
  transactionId: uuid('transaction_id').references(() => blockchainTransactions.id, { onDelete: 'set null' }),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ActivityProof = typeof activityProofs.$inferSelect
