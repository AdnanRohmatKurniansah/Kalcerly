import { z } from 'zod'

const ACTIVITY_TYPES = ['WALKING', 'RUNNING', 'CYCLING'] as const
const DIFFICULTIES = ['EASY', 'MODERATE', 'HARD', 'EXPERT'] as const

export const CreateRouteSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  activityType: z.enum(ACTIVITY_TYPES),
  distanceMeters: z.number().int().min(1),
  estimatedDurationSeconds: z.number().int().min(1).optional(),
  elevationMeters: z.number().int().min(0).optional().default(0),
  difficulty: z.enum(DIFFICULTIES).optional(),
  startLatitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  startLongitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  endLatitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  endLongitude: z.string().regex(/^-?\d+(\.\d+)?$/),
  polyline: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
})

export const UpdateRouteSchema = CreateRouteSchema.partial()

export const ListRoutesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateRouteInput = z.infer<typeof CreateRouteSchema>
