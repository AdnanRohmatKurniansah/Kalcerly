import express, { type Application, type Request, type Response } from 'express'
import cors from 'cors'
import authRoutes from '../routes/auth.routes'
import walletRoutes from '../routes/wallet.routes'
import activityRoutes from '../routes/activity.routes'
import routeRoutes from '../routes/route.routes'
import segmentRoutes from '../routes/segment.routes'
import challengeRoutes from '../routes/challenge.routes'
import goalRoutes from '../routes/goal.routes'
import rewardRoutes from '../routes/reward.routes'
import socialRoutes from '../routes/social.routes'
import clubRoutes from '../routes/club.routes'
import statsRoutes from '../routes/stats.routes'
import { errorMiddleware } from '../middlewares/error.middleware'
import path from 'path'
import fs from 'fs'

const createServer = (): Application => {
  const swaggerFile = fs.readFileSync(path.join(__dirname, '../../docs/swagger.json'), 'utf-8')
  const swaggerDocument = JSON.parse(swaggerFile)
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

  app.get('/api-docs/swagger.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument)
  })

  app.get('/api-docs', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html')
    res.send(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KALCERLY - API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js" crossorigin></script>
        <script>
          window.onload = function () {
            SwaggerUIBundle({
              url: '/api-docs/swagger.json',
              dom_id: '#swagger-ui',
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              plugins: [SwaggerUIBundle.plugins.DownloadUrl],
              layout: 'StandaloneLayout',
              persistAuthorization: true,
              deepLinking: true,
              displayRequestDuration: true,
              filter: true,
            })
          }
        </script>
      </body>
    </html>`)
  })

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
  app.use('/api/rewards', rewardRoutes)
  app.use('/api/social', socialRoutes)
  app.use('/api/clubs', clubRoutes)
  app.use('/api/stats', statsRoutes)

  app.use(errorMiddleware)

  return app
}

export default createServer
