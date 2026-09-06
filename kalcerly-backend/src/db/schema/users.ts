import { pgTable, uuid, varchar, text, boolean, timestamp, date } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullname: varchar('fullname', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  password: text('password'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 20 }),
  location: varchar('location', { length: 255 }),
  isPrivate: boolean('is_private').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
