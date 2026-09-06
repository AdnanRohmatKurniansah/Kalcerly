import { pgTable, uuid, integer, bigint, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const userStatistics = pgTable('user_statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  totalActivities: integer('total_activities').default(0),
  totalDistanceMeters: bigint('total_distance_meters', { mode: 'number' }).default(0),
  totalDurationSeconds: bigint('total_duration_seconds', { mode: 'number' }).default(0),
  totalElevationMeters: bigint('total_elevation_meters', { mode: 'number' }).default(0),
  totalCalories: bigint('total_calories', { mode: 'number' }).default(0),
  totalWalkingDistanceMeters: bigint('total_walking_distance_meters', { mode: 'number' }).default(0),
  totalRunningDistanceMeters: bigint('total_running_distance_meters', { mode: 'number' }).default(0),
  totalCyclingDistanceMeters: bigint('total_cycling_distance_meters', { mode: 'number' }).default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type UserStatistics = typeof userStatistics.$inferSelect
