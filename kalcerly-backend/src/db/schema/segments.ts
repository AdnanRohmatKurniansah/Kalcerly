import { pgTable, uuid, varchar, text, bigint, integer, numeric, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activities'

export const segments = pgTable('segments', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  activityType: varchar('activity_type', { length: 20 }).notNull(),
  distanceMeters: bigint('distance_meters', { mode: 'number' }).notNull(),
  elevationGainMeters: integer('elevation_gain_meters').default(0),
  startLatitude: numeric('start_latitude', { precision: 9, scale: 6 }).notNull(),
  startLongitude: numeric('start_longitude', { precision: 9, scale: 6 }).notNull(),
  endLatitude: numeric('end_latitude', { precision: 9, scale: 6 }).notNull(),
  endLongitude: numeric('end_longitude', { precision: 9, scale: 6 }).notNull(),
  polyline: text('polyline'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const segmentEfforts = pgTable(
  'segment_efforts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    segmentId: uuid('segment_id').notNull().references(() => segments.id, { onDelete: 'cascade' }),
    activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    elapsedSeconds: integer('elapsed_seconds').notNull(),
    averageSpeedMps: numeric('average_speed_mps', { precision: 10, scale: 3 }),
    rank: integer('rank'),
    isPersonalBest: boolean('is_personal_best').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_segment_efforts').on(t.segmentId, t.activityId)]
)

export type Segment = typeof segments.$inferSelect
export type NewSegment = typeof segments.$inferInsert
