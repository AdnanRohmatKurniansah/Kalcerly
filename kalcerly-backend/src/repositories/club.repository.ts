import { eq, and, desc, sql, ilike } from 'drizzle-orm'
import { db } from '../lib/db'
import { clubs, clubMembers, clubPosts } from '../db/schema/index'

export class ClubRepository {
  // ─── Clubs ────────────────────────────────────────────────────────────────

  async create(data: typeof clubs.$inferInsert) {
    const [club] = await db.insert(clubs).values(data).returning()
    return club!
  }

  async findById(id: string) {
    const [club] = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1)
    return club ?? null
  }

  async findByName(name: string) {
    const [club] = await db.select().from(clubs).where(eq(clubs.name, name)).limit(1)
    return club ?? null
  }

  async findAll(limit = 20, offset = 0, search?: string) {
    const query = db.select().from(clubs)
    if (search) {
      return query.where(ilike(clubs.name, `%${search}%`)).orderBy(desc(clubs.createdAt)).limit(limit).offset(offset)
    }
    return query.orderBy(desc(clubs.createdAt)).limit(limit).offset(offset)
  }

  async countAll(search?: string) {
    const query = db.select({ count: sql<number>`count(*)` }).from(clubs)
    const [row] = search
      ? await query.where(ilike(clubs.name, `%${search}%`))
      : await query
    return Number(row?.count ?? 0)
  }

  async update(id: string, data: Partial<typeof clubs.$inferInsert>) {
    const [club] = await db
      .update(clubs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clubs.id, id))
      .returning()
    return club ?? null
  }

  async delete(id: string) {
    await db.delete(clubs).where(eq(clubs.id, id))
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  async findMember(clubId: string, userId: string) {
    const [member] = await db
      .select()
      .from(clubMembers)
      .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
      .limit(1)
    return member ?? null
  }

  async createMember(data: typeof clubMembers.$inferInsert) {
    const [member] = await db.insert(clubMembers).values(data).returning()
    return member!
  }

  async updateMemberRole(clubId: string, userId: string, role: string) {
    const [member] = await db
      .update(clubMembers)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
      .returning()
    return member ?? null
  }

  async deleteMember(clubId: string, userId: string) {
    await db
      .delete(clubMembers)
      .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
  }

  async findMembersByClub(clubId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(clubMembers)
      .where(eq(clubMembers.clubId, clubId))
      .orderBy(desc(clubMembers.joinedAt))
      .limit(limit)
      .offset(offset)
  }

  async countMembersByClub(clubId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clubMembers)
      .where(eq(clubMembers.clubId, clubId))
    return Number(row?.count ?? 0)
  }

  async findMyClubs(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(clubMembers)
      .where(eq(clubMembers.userId, userId))
      .orderBy(desc(clubMembers.joinedAt))
      .limit(limit)
      .offset(offset)
  }

  async countMyClubs(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clubMembers)
      .where(eq(clubMembers.userId, userId))
    return Number(row?.count ?? 0)
  }

  // ─── Club Posts ───────────────────────────────────────────────────────────

  async createPost(data: typeof clubPosts.$inferInsert) {
    const [post] = await db.insert(clubPosts).values(data).returning()
    return post!
  }

  async findPostById(id: string) {
    const [post] = await db.select().from(clubPosts).where(eq(clubPosts.id, id)).limit(1)
    return post ?? null
  }

  async findPostsByClub(clubId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(clubPosts)
      .where(eq(clubPosts.clubId, clubId))
      .orderBy(desc(clubPosts.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countPostsByClub(clubId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clubPosts)
      .where(eq(clubPosts.clubId, clubId))
    return Number(row?.count ?? 0)
  }

  async deletePost(id: string) {
    await db.delete(clubPosts).where(eq(clubPosts.id, id))
  }
}
