import { eq, like } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../db/schema/index'

export class UserRepository {
  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return user ?? null
  }

  async findByName(fullname: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(like(users.fullname, `%${fullname}%`))
      .limit(1)

    return user ?? null
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return user ?? null
  }

  async create(data: typeof users.$inferInsert) {
    const [user] = await db.insert(users).values(data).returning()
    return user!
  }

  async updateEmailVerified(id: string, verifiedAt: Date) {
    const [user] = await db
      .update(users)
      .set({ emailVerifiedAt: verifiedAt, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return user ?? null
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return user ?? null
  }
}
