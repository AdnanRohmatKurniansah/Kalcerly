import { z } from 'zod'

const MEMBER_ROLES = ['MEMBER', 'ADMIN'] as const

export const CreateClubSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Max 255 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  isPrivate: z.boolean().default(false),
})

export const UpdateClubSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  isPrivate: z.boolean().optional(),
})

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(MEMBER_ROLES, { error: 'Role must be MEMBER or ADMIN' }),
})

export const CreateClubPostSchema = z
  .object({
    content: z.string().min(1).max(2000).optional(),
    activityId: z.string().uuid('activityId must be a valid UUID').optional(),
  })
  .refine((data) => data.content || data.activityId, {
    message: 'Post must have content or an activityId',
    path: ['content'],
  })

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const SearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
})

export type CreateClubInput = z.infer<typeof CreateClubSchema>
export type UpdateClubInput = z.infer<typeof UpdateClubSchema>
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>
export type CreateClubPostInput = z.infer<typeof CreateClubPostSchema>
