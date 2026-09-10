import { z } from 'zod'

const VISIBILITY_VALUES = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const

export const CreatePostSchema = z
  .object({
    content: z.string().min(1, 'Content is required').max(2000, 'Max 2000 characters').optional(),
    activityId: z.string().uuid('activityId must be a valid UUID').optional(),
    visibility: z.enum(VISIBILITY_VALUES).default('PUBLIC'),
  })
  .refine((data) => data.content || data.activityId, {
    message: 'Post must have content or an activityId',
    path: ['content'],
  })

export const UpdatePostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  visibility: z.enum(VISIBILITY_VALUES).optional(),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Max 1000 characters'),
  parentCommentId: z.string().uuid('parentCommentId must be a valid UUID').optional(),
})

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(1000, 'Max 1000 characters'),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>
