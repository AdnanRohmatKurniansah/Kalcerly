import { eq, and, desc, sql, or, ilike } from 'drizzle-orm'
import { db } from '../lib/db'
import { routes, savedRoutes } from '../db/schema/index'

export class RouteRepository {
  async create(data: typeof routes.$inferInsert) {
    const [route] = await db.insert(routes).values(data).returning()
    return route!
  }

  async findById(id: string) {
    const [route] = await db.select().from(routes).where(eq(routes.id, id)).limit(1)
    return route ?? null
  }

  async findByIdAndUserId(id: string, userId: string) {
    const [route] = await db
      .select()
      .from(routes)
      .where(and(eq(routes.id, id), eq(routes.userId, userId)))
      .limit(1)
    return route ?? null
  }

  async findPublic(limit = 20, offset = 0) {
    return db
      .select()
      .from(routes)
      .where(eq(routes.isPublic, true))
      .orderBy(desc(routes.popularityScore))
      .limit(limit)
      .offset(offset)
  }

  async countPublic() {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(routes)
      .where(eq(routes.isPublic, true))
    return Number(row?.count ?? 0)
  }

  async findByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(routes)
      .where(eq(routes.userId, userId))
      .orderBy(desc(routes.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async update(id: string, data: Partial<typeof routes.$inferInsert>) {
    const [route] = await db
      .update(routes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(routes.id, id))
      .returning()
    return route ?? null
  }

  async delete(id: string) {
    await db.delete(routes).where(eq(routes.id, id))
  }

  // Saved routes
  async saveRoute(userId: string, routeId: string) {
    const [saved] = await db
      .insert(savedRoutes)
      .values({ userId, routeId })
      .onConflictDoNothing()
      .returning()
    return saved ?? null
  }

  async unsaveRoute(userId: string, routeId: string) {
    await db
      .delete(savedRoutes)
      .where(and(eq(savedRoutes.userId, userId), eq(savedRoutes.routeId, routeId)))
  }

  async findSavedByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select({ route: routes })
      .from(savedRoutes)
      .innerJoin(routes, eq(savedRoutes.routeId, routes.id))
      .where(eq(savedRoutes.userId, userId))
      .orderBy(desc(savedRoutes.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async isSaved(userId: string, routeId: string) {
    const [row] = await db
      .select()
      .from(savedRoutes)
      .where(and(eq(savedRoutes.userId, userId), eq(savedRoutes.routeId, routeId)))
      .limit(1)
    return !!row
  }
}
