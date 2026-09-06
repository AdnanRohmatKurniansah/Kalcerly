import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  distanceUnit: varchar('distance_unit', { length: 10 }).default('KM'),
  weightUnit: varchar('weight_unit', { length: 10 }).default('KG'),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  activityNotifications: boolean('activity_notifications').default(true),
  socialNotifications: boolean('social_notifications').default(true),
  challengeNotifications: boolean('challenge_notifications').default(true),
  rewardNotifications: boolean('reward_notifications').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type UserSettings = typeof userSettings.$inferSelect
