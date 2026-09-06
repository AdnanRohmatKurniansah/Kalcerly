import { pgTable, uuid, varchar, text, numeric, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { activities } from './activities'

export const activityVerifications = pgTable('activity_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }).unique(),
  provider: varchar('provider', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }),
  result: varchar('result', { length: 30 }).notNull(),
  confidence: numeric('confidence', { precision: 5, scale: 4 }),
  score: numeric('score', { precision: 8, scale: 4 }),
  reason: text('reason'),
  metadata: jsonb('metadata'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ActivityVerification = typeof activityVerifications.$inferSelect
