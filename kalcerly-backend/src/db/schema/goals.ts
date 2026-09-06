import { pgTable, uuid, varchar, bigint, date, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 30 }).notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  targetValue: bigint('target_value', { mode: 'number' }).notNull(),
  currentValue: bigint('current_value', { mode: 'number' }).default(0),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
