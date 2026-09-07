import { config } from 'dotenv'

config()

export const BUN_ENV = process.env['BUN_ENV'] ?? 'development'
export const PORT = process.env['PORT'] ?? '3000'
export const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000'
export const DATABASE_URL = process.env['DATABASE_URL'] ?? ''

// JWT
export const JWT_ACCESS_SECRET = process.env['JWT_ACCESS_SECRET'] ?? ''
export const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] ?? ''
export const JWT_ACCESS_EXPIRES_IN = process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m'
export const JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d'

// Google
export const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'] ?? ''
export const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'] ?? ''

// Email / SMTP
export const SMTP_HOST = process.env['SMTP_HOST'] ?? ''
export const SMTP_PORT = process.env['SMTP_PORT'] ?? '587'
export const SMTP_USER = process.env['SMTP_USER'] ?? ''
export const SMTP_PASS = process.env['SMTP_PASS'] ?? ''
export const EMAIL_FROM = process.env['EMAIL_FROM'] ?? process.env['SMTP_USER'] ?? ''
export const EMAIL_VERIFICATION_URL = process.env['EMAIL_VERIFICATION_URL'] ?? 'https://app.kalcerly.com/verify-email'

// Blockchain
export const BLOCKCHAIN_RPC_URL = process.env['BLOCKCHAIN_RPC_URL'] ?? ''
export const BLOCKCHAIN_PRIVATE_KEY = process.env['BLOCKCHAIN_PRIVATE_KEY'] ?? ''
export const BLOCKCHAIN_CHAIN_ID = parseInt(process.env['BLOCKCHAIN_CHAIN_ID'] ?? '97', 10)
export const CONTRACT_FIT_TOKEN = process.env['CONTRACT_FIT_TOKEN'] ?? ''
export const CONTRACT_ACTIVITY_PROOF = process.env['CONTRACT_ACTIVITY_PROOF'] ?? ''
export const CONTRACT_REWARD_MANAGER = process.env['CONTRACT_REWARD_MANAGER'] ?? ''
export const CONTRACT_CHALLENGE_MANAGER = process.env['CONTRACT_CHALLENGE_MANAGER'] ?? ''

// App domain (for SIWE)
export const APP_DOMAIN = process.env['APP_DOMAIN'] ?? 'kalcerly.com'

// Cloudinary 
export const CLOUDINARY_CLOUD_NAME = process.env['CLOUDINARY_CLOUD_NAME'] ?? ''
export const CLOUDINARY_API_KEY = process.env['CLOUDINARY_API_KEY'] ?? ''
export const CLOUDINARY_API_SECRET = process.env['CLOUDINARY_API_SECRET'] ?? ''

// AI Verification 
export const AI_BASE_URL = process.env['AI_BASE_URL'] ?? 'https://api.openai.com/v1'
export const AI_API_KEY = process.env['AI_API_KEY'] ?? ''
export const AI_MODEL = process.env['AI_MODEL'] ?? 'gpt-4o-mini'
