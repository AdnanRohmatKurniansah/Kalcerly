import { type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import { AppError } from '../utils/error'

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? undefined,
    })
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds the 5MB limit'
        : `Upload error: ${err.message}`
    return res.status(400).json({ success: false, message })
  }

  if (err instanceof Error && err.message === 'Only image files are allowed') {
    return res.status(400).json({ success: false, message: err.message })
  }

  if (process.env['BUN_ENV'] !== 'production') {
    console.error('[Server Error]', err)
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
