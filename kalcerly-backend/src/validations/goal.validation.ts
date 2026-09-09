import { z } from 'zod'

const GOAL_TYPES = ['DISTANCE', 'DURATION', 'ACTIVITY_COUNT', 'ELEVATION'] as const
const GOAL_PERIODS = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const

export const CreateGoalSchema = z.object({
  type: z.enum(GOAL_TYPES, { error: 'Type must be DISTANCE, DURATION, ACTIVITY_COUNT, or ELEVATION' }),
  period: z.enum(GOAL_PERIODS, { error: 'Period must be WEEKLY, MONTHLY, or YEARLY' }),
  targetValue: z.number().int().min(1, 'targetValue must be at least 1'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
}).superRefine((data, ctx) => {
  if (data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endDate must be after startDate',
      path: ['endDate'],
    })
  }
})

export const UpdateGoalProgressSchema = z.object({
  activityId: z.string().uuid({ message: 'activityId must be a valid UUID' }),
})

export const ListGoalsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>
export type UpdateGoalProgressInput = z.infer<typeof UpdateGoalProgressSchema>
export type ListGoalsInput = z.infer<typeof ListGoalsSchema>
