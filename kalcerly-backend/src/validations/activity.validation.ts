import { z } from 'zod'

const ACTIVITY_TYPES = ['WALKING', 'RUNNING', 'CYCLING'] as const

export const CreateActivitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES, { error: 'Type must be WALKING, RUNNING, or CYCLING' }),
  title: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  startedAt: z.iso.datetime({ message: 'startedAt must be ISO 8601 datetime' }),
  endedAt: z.iso.datetime({ message: 'endedAt must be ISO 8601 datetime' }),
  distanceMeters: z.number().int().min(0),
  durationSeconds: z.number().int().min(0),
  elevationMeters: z.number().int().min(0).optional().default(0),
  calories: z.number().int().min(0).optional().default(0),
  averagePaceSeconds: z.number().int().min(0).optional(),
  averageSpeedMps: z.string().optional(),
  maxSpeedMps: z.string().optional(),
  startLatitude: z.string().optional(),
  startLongitude: z.string().optional(),
  endLatitude: z.string().optional(),
  endLongitude: z.string().optional(),
})

const GpsPointSchema = z.object({
  sequence: z.number().int().min(0),
  latitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid latitude'),
  longitude: z.string().regex(/^-?\d+(\.\d+)?$/, 'Invalid longitude'),
  altitudeMeters: z.string().optional(),
  accuracyMeters: z.string().optional(),
  speedMps: z.string().optional(),
  timestamp: z.string().datetime({ message: 'timestamp must be ISO 8601 datetime' }),
})

export const UploadPointsSchema = z.object({
  points: z.array(GpsPointSchema).min(1, 'At least one GPS point is required').max(5000, 'Max 5000 points per upload'),
})

export const UpdateActivitySchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
})

export const ListActivitiesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>
export type UploadPointsInput = z.infer<typeof UploadPointsSchema>
