import { pgTable, uuid, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const blockchainContracts = pgTable('blockchain_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  address: varchar('address', { length: 42 }).notNull(),
  chainId: integer('chain_id').notNull(),
  version: varchar('version', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BlockchainContract = typeof blockchainContracts.$inferSelect
