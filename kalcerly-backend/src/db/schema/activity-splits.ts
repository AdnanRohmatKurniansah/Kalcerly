import { pgTable, uuid, integer, bigint, numeric, timestamp, unique } from 'drizzle-orm/pg-core'
import { activities } from './activities'

export const activitySplits = pgTable(
  'activity_splits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
    splitNumber: integer('split_number').notNull(),
    distanceMeters: bigint('distance_meters', { mode: 'number' }).notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    paceSeconds: integer('pace_seconds'),
    averageSpeedMps: numeric('average_speed_mps', { precision: 10, scale: 3 }),
    elevationGainMeters: integer('elevation_gain_meters').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_activity_splits').on(t.activityId, t.splitNumber)]
)

export type ActivitySplit = typeof activitySplits.$inferSelect
