import { pgTable, bigserial, uuid, integer, numeric, timestamp, unique } from 'drizzle-orm/pg-core'
import { activities } from './activities'

export const activityPoints = pgTable(
  'activity_points',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
    longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
    altitudeMeters: numeric('altitude_meters', { precision: 8, scale: 2 }),
    accuracyMeters: numeric('accuracy_meters', { precision: 8, scale: 2 }),
    speedMps: numeric('speed_mps', { precision: 8, scale: 3 }),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_activity_points_seq').on(t.activityId, t.sequence)]
)

export type ActivityPoint = typeof activityPoints.$inferSelect
