import { pgTable, uuid, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { activities } from './activities'

export const activityStatistics = pgTable('activity_statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }).unique(),
  averagePaceSeconds: integer('average_pace_seconds'),
  averageSpeedMps: numeric('average_speed_mps', { precision: 10, scale: 3 }),
  maxSpeedMps: numeric('max_speed_mps', { precision: 10, scale: 3 }),
  elevationGainMeters: integer('elevation_gain_meters').default(0),
  elevationLossMeters: integer('elevation_loss_meters').default(0),
  calories: integer('calories').default(0),
  movingTimeSeconds: integer('moving_time_seconds'),
  elapsedTimeSeconds: integer('elapsed_time_seconds'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ActivityStatistics = typeof activityStatistics.$inferSelect
