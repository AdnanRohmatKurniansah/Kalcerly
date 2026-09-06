import { z } from 'zod'

export const WalletNonceSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
})

export const WalletVerifySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature'),
  message: z.string().min(1, 'Message is required'),
  chainId: z.number().int().positive('Chain ID must be positive'),
})

export const SetPrimaryWalletSchema = z.object({
  walletId: z.string().uuid('Invalid wallet ID'),
})

// Legacy camelCase aliases
export const walletNonceSchema = WalletNonceSchema
export const walletVerifySchema = WalletVerifySchema
export const setPrimaryWalletSchema = SetPrimaryWalletSchema
