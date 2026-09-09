import { z } from 'zod'

const CHALLENGE_TYPES = ['DISTANCE', 'DURATION', 'ACTIVITY_COUNT', 'STREAK'] as const

export const CreateChallengeSchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    type: z.enum(CHALLENGE_TYPES, { error: 'Type must be DISTANCE, DURATION, ACTIVITY_COUNT, or STREAK' }),
    targetDistanceMeters: z.number().int().min(1).optional(),
    targetDurationSeconds: z.number().int().min(1).optional(),
    targetActivities: z.number().int().min(1).optional(),
    targetStreakDays: z.number().int().min(1).optional(),
    startAt: z.iso.datetime({ message: 'startAt must be ISO 8601 datetime' }),
    endAt: z.iso.datetime({ message: 'endAt must be ISO 8601 datetime' }),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt)
    const end = new Date(data.endAt)

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endAt must be after startAt',
        path: ['endAt'],
      })
    }

    if (data.type === 'DISTANCE' && !data.targetDistanceMeters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'targetDistanceMeters is required for DISTANCE challenges',
        path: ['targetDistanceMeters'],
      })
    }

    if (data.type === 'DURATION' && !data.targetDurationSeconds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'targetDurationSeconds is required for DURATION challenges',
        path: ['targetDurationSeconds'],
      })
    }

    if (data.type === 'ACTIVITY_COUNT' && !data.targetActivities) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'targetActivities is required for ACTIVITY_COUNT challenges',
        path: ['targetActivities'],
      })
    }

    if (data.type === 'STREAK' && !data.targetStreakDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'targetStreakDays is required for STREAK challenges',
        path: ['targetStreakDays'],
      })
    }
  })

export const ListChallengesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const AddProgressSchema = z.object({
  activityId: z.string().uuid({ message: 'activityId must be a valid UUID' }),
})

export type CreateChallengeInput = z.infer<typeof CreateChallengeSchema>
export type ListChallengesInput = z.infer<typeof ListChallengesSchema>
export type AddProgressInput = z.infer<typeof AddProgressSchema>
