import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core'

export const authNonces = pgTable('auth_nonces', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
  nonce: varchar('nonce', { length: 255 }).notNull().unique(),
  chainId: integer('chain_id').notNull(),
  domain: varchar('domain', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AuthNonce = typeof authNonces.$inferSelect
export type NewAuthNonce = typeof authNonces.$inferInsert
