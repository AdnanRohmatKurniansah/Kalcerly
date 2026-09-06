import rateLimit from 'express-rate-limit'

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
})

export const emailVerificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many verification emails sent. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
})

export const walletRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many wallet requests. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
})
