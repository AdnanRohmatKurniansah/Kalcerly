import { eq, and, desc, sql, or, inArray } from 'drizzle-orm'
import { db } from '../lib/db'
import { posts, follows, kudos, comments } from '../db/schema/index'

export class SocialRepository {
  // ─── Posts ────────────────────────────────────────────────────────────────

  async createPost(data: typeof posts.$inferInsert) {
    const [post] = await db.insert(posts).values(data).returning()
    return post!
  }

  async findPostById(id: string) {
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    return post ?? null
  }

  async findPostsByUserId(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countPostsByUserId(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, userId))
    return Number(row?.count ?? 0)
  }

  // Feed: posts from followed users + own posts, PUBLIC visibility
  async findFeedPosts(userId: string, followingIds: string[], limit = 20, offset = 0) {
    const authorIds = [userId, ...followingIds]
    if (authorIds.length === 0) return []

    return db
      .select()
      .from(posts)
      .where(
        and(
          inArray(posts.userId, authorIds),
          or(eq(posts.visibility, 'PUBLIC'), eq(posts.userId, userId))
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countFeedPosts(userId: string, followingIds: string[]) {
    const authorIds = [userId, ...followingIds]
    if (authorIds.length === 0) return 0

    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(
        and(
          inArray(posts.userId, authorIds),
          or(eq(posts.visibility, 'PUBLIC'), eq(posts.userId, userId))
        )
      )
    return Number(row?.count ?? 0)
  }

  async updatePost(id: string, data: Partial<typeof posts.$inferInsert>) {
    const [post] = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning()
    return post ?? null
  }

  async deletePost(id: string) {
    await db.delete(posts).where(eq(posts.id, id))
  }

  // ─── Follows ──────────────────────────────────────────────────────────────

  async findFollow(followerId: string, followingId: string) {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
      )
      .limit(1)
    return follow ?? null
  }

  async createFollow(followerId: string, followingId: string) {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning()
    return follow!
  }

  async deleteFollow(followerId: string, followingId: string) {
    await db
      .delete(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
      )
  }

  async findFollowingIds(userId: string): Promise<string[]> {
    const rows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId))
    return rows.map((r) => r.followingId)
  }

  async findFollowers(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(follows)
      .where(eq(follows.followingId, userId))
      .orderBy(desc(follows.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countFollowers(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId))
    return Number(row?.count ?? 0)
  }

  async findFollowing(userId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId))
      .orderBy(desc(follows.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countFollowing(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId))
    return Number(row?.count ?? 0)
  }

  // ─── Kudos ────────────────────────────────────────────────────────────────

  async findKudo(userId: string, postId: string) {
    const [kudo] = await db
      .select()
      .from(kudos)
      .where(and(eq(kudos.userId, userId), eq(kudos.postId, postId)))
      .limit(1)
    return kudo ?? null
  }

  async createKudo(userId: string, postId: string) {
    const [kudo] = await db.insert(kudos).values({ userId, postId }).returning()
    return kudo!
  }

  async deleteKudo(userId: string, postId: string) {
    await db
      .delete(kudos)
      .where(and(eq(kudos.userId, userId), eq(kudos.postId, postId)))
  }

  async countKudosByPost(postId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(kudos)
      .where(eq(kudos.postId, postId))
    return Number(row?.count ?? 0)
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async createComment(data: typeof comments.$inferInsert) {
    const [comment] = await db.insert(comments).values(data).returning()
    return comment!
  }

  async findCommentById(id: string) {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id)).limit(1)
    return comment ?? null
  }

  async findCommentsByPostId(postId: string, limit = 20, offset = 0) {
    return db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), sql`${comments.parentCommentId} IS NULL`))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset)
  }

  async countCommentsByPostId(postId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.postId, postId))
    return Number(row?.count ?? 0)
  }

  async deleteComment(id: string) {
    await db.delete(comments).where(eq(comments.id, id))
  }

  async updateComment(id: string, content: string) {
    const [comment] = await db
      .update(comments)
      .set({ content, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning()
    return comment ?? null
  }
}
