import { pgTable, uuid, varchar, text, bigint, integer, numeric, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activities'

export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockchainChallengeId: bigint('blockchain_challenge_id', { mode: 'number' }),
  creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 30 }).notNull(),
  targetDistanceMeters: bigint('target_distance_meters', { mode: 'number' }),
  targetDurationSeconds: bigint('target_duration_seconds', { mode: 'number' }),
  targetActivities: integer('target_activities'),
  targetStreakDays: integer('target_streak_days'),
  rewardAmountBaseUnits: numeric('reward_amount_base_units', { precision: 78, scale: 0 }),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  contractAddress: varchar('contract_address', { length: 42 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const challengeParticipants = pgTable(
  'challenge_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    challengeId: uuid('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    progressDistanceMeters: bigint('progress_distance_meters', { mode: 'number' }).default(0),
    progressDurationSeconds: bigint('progress_duration_seconds', { mode: 'number' }).default(0),
    progressActivities: integer('progress_activities').default(0),
    currentStreak: integer('current_streak').default(0),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    rewardClaimedAt: timestamp('reward_claimed_at', { withTimezone: true }),
    blockchainProgress: bigint('blockchain_progress', { mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_challenge_participants').on(t.challengeId, t.userId)]
)

export const challengeActivityUsages = pgTable(
  'challenge_activity_usages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    challengeId: uuid('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
    participantId: uuid('participant_id').notNull().references(() => challengeParticipants.id, { onDelete: 'cascade' }),
    activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
    progressAmount: bigint('progress_amount', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('uq_challenge_activity_usages').on(t.challengeId, t.activityId)]
)

export type Challenge = typeof challenges.$inferSelect
export type NewChallenge = typeof challenges.$inferInsert
