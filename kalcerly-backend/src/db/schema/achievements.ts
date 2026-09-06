import { pgTable, uuid, varchar, text, bigint, boolean, timestamp, unique, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  type: varchar('type', { length: 50 }).notNull(),
  requirementValue: bigint('requirement_value', { mode: 'number' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    achievementId: uuid('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
    progressValue: bigint('progress_value', { mode: 'number' }).default(0),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_user_achievements').on(t.userId, t.achievementId)]
)

export type Achievement = typeof achievements.$inferSelect
export type UserAchievement = typeof userAchievements.$inferSelect
