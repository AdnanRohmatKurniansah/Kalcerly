import { pgTable, uuid, varchar, bigint, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activities'

export const personalRecords = pgTable('personal_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityType: varchar('activity_type', { length: 20 }).notNull(),
  recordType: varchar('record_type', { length: 30 }).notNull(),
  distanceMeters: bigint('distance_meters', { mode: 'number' }),
  durationSeconds: integer('duration_seconds'),
  paceSeconds: integer('pace_seconds'),
  speedMps: numeric('speed_mps', { precision: 10, scale: 3 }),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  achievedAt: timestamp('achieved_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PersonalRecord = typeof personalRecords.$inferSelect
