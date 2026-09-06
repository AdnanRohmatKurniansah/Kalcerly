import { pgTable, uuid, varchar, text, bigint, integer, numeric, boolean, timestamp, unique, bigserial } from 'drizzle-orm/pg-core'
import { users } from './users'

export const routes = pgTable('routes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  activityType: varchar('activity_type', { length: 20 }).notNull(),
  distanceMeters: bigint('distance_meters', { mode: 'number' }).notNull(),
  estimatedDurationSeconds: integer('estimated_duration_seconds'),
  elevationMeters: integer('elevation_meters').default(0),
  difficulty: varchar('difficulty', { length: 20 }),
  startLatitude: numeric('start_latitude', { precision: 9, scale: 6 }).notNull(),
  startLongitude: numeric('start_longitude', { precision: 9, scale: 6 }).notNull(),
  endLatitude: numeric('end_latitude', { precision: 9, scale: 6 }).notNull(),
  endLongitude: numeric('end_longitude', { precision: 9, scale: 6 }).notNull(),
  polyline: text('polyline'),
  isPublic: boolean('is_public').default(true),
  popularityScore: numeric('popularity_score', { precision: 12, scale: 4 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const routePoints = pgTable(
  'route_points',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    routeId: uuid('route_id').notNull().references(() => routes.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
    longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
    elevationMeters: numeric('elevation_meters', { precision: 8, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_route_points_seq').on(t.routeId, t.sequence)]
)

export const routeWaypoints = pgTable('route_waypoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  routeId: uuid('route_id').notNull().references(() => routes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  sequence: integer('sequence').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const savedRoutes = pgTable(
  'saved_routes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    routeId: uuid('route_id').notNull().references(() => routes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_saved_routes').on(t.userId, t.routeId)]
)

export type Route = typeof routes.$inferSelect
export type NewRoute = typeof routes.$inferInsert
