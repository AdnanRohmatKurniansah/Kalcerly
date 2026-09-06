import { pgTable, uuid, varchar, bigint, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('PENDING'),
  title: varchar('title', { length: 255 }),
  description: varchar('description', { length: 1000 }),
  distanceMeters: bigint('distance_meters', { mode: 'number' }).notNull().default(0),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  elevationMeters: integer('elevation_meters').default(0),
  calories: integer('calories').default(0),
  averagePaceSeconds: integer('average_pace_seconds'),
  averageSpeedMps: numeric('average_speed_mps', { precision: 10, scale: 3 }),
  maxSpeedMps: numeric('max_speed_mps', { precision: 10, scale: 3 }),
  startLatitude: numeric('start_latitude', { precision: 9, scale: 6 }),
  startLongitude: numeric('start_longitude', { precision: 9, scale: 6 }),
  endLatitude: numeric('end_latitude', { precision: 9, scale: 6 }),
  endLongitude: numeric('end_longitude', { precision: 9, scale: 6 }),
  activityHash: varchar('activity_hash', { length: 66 }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
