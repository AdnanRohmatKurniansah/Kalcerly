import { z } from 'zod'

export const RegisterSchema = z.object({
  fullname: z.string().min(1, 'Fullname is required').max(100, 'Max 100 characters'),
  email: z.email('Invalid email').min(1, 'Email is required').max(150, 'Max 150 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
  email: z.email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const ResendVerificationSchema = z.object({
  email: z.email('Invalid email').min(1, 'Email is required'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const GoogleAuthSchema = z.object({
  credential: z.string().min(1, 'Credential is required'),
})

export const UpdateProfileSchema = z.object({
  fullname: z.string().min(1, 'Fullname is required').max(100, 'Max 100 characters').optional(),
  bio: z.string().max(500, 'Max 500 characters').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD').optional(),
  gender: z.string().max(20, 'Max 20 characters').optional(),
  location: z.string().max(255, 'Max 255 characters').optional(),
  isPrivate: z.boolean().optional(),
})

export const registerSchema = RegisterSchema
export const loginSchema = LoginSchema
export const verifyEmailSchema = VerifyEmailSchema
export const resendVerificationSchema = ResendVerificationSchema
export const refreshTokenSchema = RefreshTokenSchema
export const googleAuthSchema = GoogleAuthSchema
export const updateProfileSchema = UpdateProfileSchema
