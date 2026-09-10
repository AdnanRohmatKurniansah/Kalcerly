import { AppError } from '../utils/error'
import { ClubRepository } from '../repositories/club.repository'
import type { CreateClubInput, UpdateClubInput, CreateClubPostInput } from '../validations/club.validation'

const clubRepo = new ClubRepository()

// Role hierarchy: OWNER > ADMIN > MEMBER
const ADMIN_ROLES = ['OWNER', 'ADMIN']

export class ClubService {
  async createClub(userId: string, input: CreateClubInput) {
    // Unique name check
    const existing = await clubRepo.findByName(input.name)
    if (existing) throw new AppError('Club name already taken', 409, 'CLUB_NAME_TAKEN')

    const club = await clubRepo.create({
      ownerId: userId,
      name: input.name,
      description: input.description ?? null,
      isPrivate: input.isPrivate,
    })

    // Owner is automatically a member with OWNER role
    await clubRepo.createMember({
      clubId: club.id,
      userId,
      role: 'OWNER',
      joinedAt: new Date(),
    })

    return club
  }

  async listClubs(page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      clubRepo.findAll(limit, offset, search),
      clubRepo.countAll(search),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getClubById(clubId: string, requesterId: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    const [memberCount, membership] = await Promise.all([
      clubRepo.countMembersByClub(clubId),
      clubRepo.findMember(clubId, requesterId),
    ])

    // Private clubs: only members can see full details
    if (club.isPrivate && !membership) {
      return { id: club.id, name: club.name, isPrivate: true, memberCount }
    }

    return { ...club, memberCount, membership: membership ?? null }
  }

  async updateClub(userId: string, clubId: string, input: UpdateClubInput) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    // Only OWNER can update club info
    if (club.ownerId !== userId) {
      throw new AppError('Only the club owner can update club details', 403, 'FORBIDDEN')
    }

    // Check unique name if changed
    if (input.name && input.name !== club.name) {
      const existing = await clubRepo.findByName(input.name)
      if (existing) throw new AppError('Club name already taken', 409, 'CLUB_NAME_TAKEN')
    }

    return clubRepo.update(clubId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
    })
  }

  async deleteClub(userId: string, clubId: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    if (club.ownerId !== userId) {
      throw new AppError('Only the club owner can delete this club', 403, 'FORBIDDEN')
    }

    await clubRepo.delete(clubId)
  }

  async joinClub(userId: string, clubId: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    const existing = await clubRepo.findMember(clubId, userId)
    if (existing) throw new AppError('Already a member of this club', 409, 'ALREADY_MEMBER')

    const member = await clubRepo.createMember({
      clubId,
      userId,
      role: 'MEMBER',
      joinedAt: new Date(),
    })

    return member
  }

  async leaveClub(userId: string, clubId: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    // Owner cannot leave their own club
    if (club.ownerId === userId) {
      throw new AppError('Club owner cannot leave. Transfer ownership or delete the club.', 400, 'OWNER_CANNOT_LEAVE')
    }

    const membership = await clubRepo.findMember(clubId, userId)
    if (!membership) throw new AppError('You are not a member of this club', 404, 'NOT_A_MEMBER')

    await clubRepo.deleteMember(clubId, userId)
  }

  async removeMember(requesterId: string, clubId: string, targetUserId: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    const requesterMembership = await clubRepo.findMember(clubId, requesterId)
    if (!requesterMembership || !ADMIN_ROLES.includes(requesterMembership.role)) {
      throw new AppError('Only OWNER or ADMIN can remove members', 403, 'FORBIDDEN')
    }

    if (targetUserId === club.ownerId) {
      throw new AppError('Cannot remove the club owner', 400, 'CANNOT_REMOVE_OWNER')
    }

    const target = await clubRepo.findMember(clubId, targetUserId)
    if (!target) throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')

    // ADMIN cannot remove another ADMIN — only OWNER can
    if (target.role === 'ADMIN' && requesterMembership.role !== 'OWNER') {
      throw new AppError('Only the club owner can remove an admin', 403, 'FORBIDDEN')
    }

    await clubRepo.deleteMember(clubId, targetUserId)
  }

  async updateMemberRole(requesterId: string, clubId: string, targetUserId: string, role: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    // Only OWNER can change roles
    if (club.ownerId !== requesterId) {
      throw new AppError('Only the club owner can change member roles', 403, 'FORBIDDEN')
    }

    if (targetUserId === requesterId) {
      throw new AppError('Owner cannot change their own role', 400, 'CANNOT_CHANGE_OWN_ROLE')
    }

    const target = await clubRepo.findMember(clubId, targetUserId)
    if (!target) throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')

    return clubRepo.updateMemberRole(clubId, targetUserId, role)
  }

  async getMembers(clubId: string, requesterId: string, page: number, limit: number) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    // Private clubs: only members can see member list
    if (club.isPrivate) {
      const membership = await clubRepo.findMember(clubId, requesterId)
      if (!membership) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')
    }

    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      clubRepo.findMembersByClub(clubId, limit, offset),
      clubRepo.countMembersByClub(clubId),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getMyClubs(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      clubRepo.findMyClubs(userId, limit, offset),
      clubRepo.countMyClubs(userId),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async createPost(userId: string, clubId: string, input: CreateClubPostInput) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    // Only members can post
    const membership = await clubRepo.findMember(clubId, userId)
    if (!membership) throw new AppError('You must be a member to post in this club', 403, 'NOT_A_MEMBER')

    return clubRepo.createPost({
      clubId,
      userId,
      content: input.content ?? null,
      activityId: input.activityId ?? null,
    })
  }

  async getClubPosts(clubId: string, requesterId: string, page: number, limit: number) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    // Private clubs: only members can see posts
    if (club.isPrivate) {
      const membership = await clubRepo.findMember(clubId, requesterId)
      if (!membership) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')
    }

    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      clubRepo.findPostsByClub(clubId, limit, offset),
      clubRepo.countPostsByClub(clubId),
    ])
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async deleteClubPost(userId: string, clubId: string, postId: string) {
    const club = await clubRepo.findById(clubId)
    if (!club) throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND')

    const post = await clubRepo.findPostById(postId)
    if (!post || post.clubId !== clubId) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    // Only post owner OR club admin/owner can delete
    const membership = await clubRepo.findMember(clubId, userId)
    const isAdmin = membership && ADMIN_ROLES.includes(membership.role)

    if (post.userId !== userId && !isAdmin) {
      throw new AppError('You do not have permission to delete this post', 403, 'FORBIDDEN')
    }

    await clubRepo.deletePost(postId)
  }
}
