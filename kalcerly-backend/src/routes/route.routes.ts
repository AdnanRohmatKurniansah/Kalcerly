import { Router } from 'express'
import {
  CreateRoute, GetRoutes, GetRouteById,
  UpdateRoute, DeleteRoute,
  SaveRoute, UnsaveRoute, GetSavedRoutes,
} from '../controllers/route.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Public read
router.get('/', GetRoutes)
router.get('/saved', authenticate, GetSavedRoutes)
router.get('/:id', GetRouteById)

// Protected write
router.post('/', authenticate, CreateRoute)
router.patch('/:id', authenticate, UpdateRoute)
router.delete('/:id', authenticate, DeleteRoute)
router.post('/:id/save', authenticate, SaveRoute)
router.delete('/:id/save', authenticate, UnsaveRoute)

export default router
