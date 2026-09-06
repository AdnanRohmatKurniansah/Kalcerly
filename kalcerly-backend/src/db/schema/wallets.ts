import { pgTable, uuid, varchar, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    address: varchar('address', { length: 42 }).notNull().unique(),
    chainId: integer('chain_id').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_wallets_address_chain').on(t.address, t.chainId)]
)

export type Wallet = typeof wallets.$inferSelect
export type NewWallet = typeof wallets.$inferInsert
