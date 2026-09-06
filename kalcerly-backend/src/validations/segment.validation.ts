import { z } from 'zod'

const ACTIVITY_TYPES = ['WALKING', 'RUNNING', 'CYCLING'] as const

export const CreateSegmentSchema = z.object({
  name: z.string().min(1).max(255),
  activityType: z.enum(ACTIVITY_TYPES),
  distanceMeters: z.number().int().min(1),
  elevationGainMeters: z.number().int().min(0).optional().default(0),
  startLatitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid latitude'),
  startLongitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid longitude'),
  endLatitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid latitude'),
  endLongitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid longitude'),
  polyline: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
})

export const CreateSegmentEffortSchema = z.object({
  activityId: z.string().uuid('Invalid activity ID'),
  elapsedSeconds: z.number().int().min(1),
  averageSpeedMps: z.string().regex(/^\d+(\.\d+)?$/).optional(),
})

export const ListSegmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateSegmentInput = z.infer<typeof CreateSegmentSchema>
export type CreateSegmentEffortInput = z.infer<typeof CreateSegmentEffortSchema>
