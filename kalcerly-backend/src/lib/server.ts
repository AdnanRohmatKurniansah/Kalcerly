import express, { type Application, type Request, type Response } from 'express'
import cors from 'cors'
import authRoutes from '../routes/auth.routes'
import walletRoutes from '../routes/wallet.routes'
import activityRoutes from '../routes/activity.routes'
import routeRoutes from '../routes/route.routes'
import segmentRoutes from '../routes/segment.routes'
import challengeRoutes from '../routes/challenge.routes'
import goalRoutes from '../routes/goal.routes'
import { errorMiddleware } from '../middlewares/error.middleware'

const createServer = (): Application => {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Kalcerly Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/wallet', walletRoutes)
  app.use('/api/activities', activityRoutes)
  app.use('/api/routes', routeRoutes)
  app.use('/api/segments', segmentRoutes)
  app.use('/api/challenges', challengeRoutes)
  app.use('/api/goals', goalRoutes)

  app.use(errorMiddleware)

  return app
}

export default createServer
