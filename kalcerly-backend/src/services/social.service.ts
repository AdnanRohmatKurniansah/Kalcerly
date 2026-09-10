import { AppError } from '../utils/error'
import { SocialRepository } from '../repositories/social.repository'
import type { CreatePostInput, UpdatePostInput, CreateCommentInput } from '../validations/social.validation'

const socialRepo = new SocialRepository()

export class SocialService {
  async getFeed(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const followingIds = await socialRepo.findFollowingIds(userId)

    const [items, total] = await Promise.all([
      socialRepo.findFeedPosts(userId, followingIds, limit, offset),
      socialRepo.countFeedPosts(userId, followingIds),
    ])

    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async createPost(userId: string, input: CreatePostInput) {
    const post = await socialRepo.createPost({
      userId,
      content: input.content ?? null,
      activityId: input.activityId ?? null,
      visibility: input.visibility,
    })
    return post
  }

  async getPostById(postId: string, requesterId: string) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    // Authorization: PRIVATE posts only visible to owner
    if (post.visibility === 'PRIVATE' && post.userId !== requesterId) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    // Authorization: FOLLOWERS posts only visible to owner + followers
    if (post.visibility === 'FOLLOWERS' && post.userId !== requesterId) {
      const follow = await socialRepo.findFollow(requesterId, post.userId)
      if (!follow) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    const kudoCount = await socialRepo.countKudosByPost(postId)
    const commentCount = await socialRepo.countCommentsByPostId(postId)
    const myKudo = await socialRepo.findKudo(requesterId, postId)

    return { ...post, kudoCount, commentCount, hasKudo: !!myKudo }
  }

  async getUserPosts(targetUserId: string, requesterId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const isOwner = targetUserId === requesterId

    const allPosts = await socialRepo.findPostsByUserId(targetUserId, limit, offset)
    const total = await socialRepo.countPostsByUserId(targetUserId)

    // Filter visibility for non-owners
    let visiblePosts = allPosts
    if (!isOwner) {
      const isFollowing = !!(await socialRepo.findFollow(requesterId, targetUserId))
      visiblePosts = allPosts.filter((p) => {
        if (p.visibility === 'PUBLIC') return true
        if (p.visibility === 'FOLLOWERS' && isFollowing) return true
        return false
      })
    }

    return { data: visiblePosts, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async updatePost(userId: string, postId: string, input: UpdatePostInput) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    if (post.userId !== userId) {
      throw new AppError('You do not have permission to edit this post', 403, 'FORBIDDEN')
    }

    return socialRepo.updatePost(postId, {
      ...(input.content !== undefined && { content: input.content }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
    })
  }

  async deletePost(userId: string, postId: string) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    if (post.userId !== userId) {
      throw new AppError('You do not have permission to delete this post', 403, 'FORBIDDEN')
    }

    await socialRepo.deletePost(postId)
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError('You cannot follow yourself', 400, 'SELF_FOLLOW')
    }

    const existing = await socialRepo.findFollow(followerId, followingId)
    if (existing) {
      throw new AppError('Already following this user', 409, 'ALREADY_FOLLOWING')
    }

    return socialRepo.createFollow(followerId, followingId)
  }

  async unfollowUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new AppError('You cannot unfollow yourself', 400, 'SELF_FOLLOW')
    }

    const existing = await socialRepo.findFollow(followerId, followingId)
    if (!existing) {
      throw new AppError('You are not following this user', 404, 'NOT_FOLLOWING')
    }

    await socialRepo.deleteFollow(followerId, followingId)
  }

  async getFollowers(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      socialRepo.findFollowers(userId, limit, offset),
      socialRepo.countFollowers(userId),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getFollowing(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      socialRepo.findFollowing(userId, limit, offset),
      socialRepo.countFollowing(userId),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async giveKudo(userId: string, postId: string) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    const existing = await socialRepo.findKudo(userId, postId)
    if (existing) throw new AppError('Already given kudos to this post', 409, 'ALREADY_KUDOED')

    return socialRepo.createKudo(userId, postId)
  }

  async removeKudo(userId: string, postId: string) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    const existing = await socialRepo.findKudo(userId, postId)
    if (!existing) throw new AppError('You have not given kudos to this post', 404, 'KUDO_NOT_FOUND')

    await socialRepo.deleteKudo(userId, postId)
  }

  async createComment(userId: string, postId: string, input: CreateCommentInput) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    // Validate parent comment exists if provided
    if (input.parentCommentId) {
      const parent = await socialRepo.findCommentById(input.parentCommentId)
      if (!parent || parent.postId !== postId) {
        throw new AppError('Parent comment not found', 404, 'COMMENT_NOT_FOUND')
      }
    }

    return socialRepo.createComment({
      userId,
      postId,
      content: input.content,
      parentCommentId: input.parentCommentId ?? null,
    })
  }

  async getComments(postId: string, page: number, limit: number) {
    const post = await socialRepo.findPostById(postId)
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      socialRepo.findCommentsByPostId(postId, limit, offset),
      socialRepo.countCommentsByPostId(postId),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async updateComment(userId: string, commentId: string, content: string) {
    const comment = await socialRepo.findCommentById(commentId)
    if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')

    if (comment.userId !== userId) {
      throw new AppError('You do not have permission to edit this comment', 403, 'FORBIDDEN')
    }

    return socialRepo.updateComment(commentId, content)
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await socialRepo.findCommentById(commentId)
    if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')

    if (comment.userId !== userId) {
      throw new AppError('You do not have permission to delete this comment', 403, 'FORBIDDEN')
    }

    await socialRepo.deleteComment(commentId)
  }
}
