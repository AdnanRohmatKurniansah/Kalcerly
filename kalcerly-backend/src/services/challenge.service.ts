import { AppError } from '../utils/error'
import { ChallengeRepository } from '../repositories/challenge.repository'
import { ActivityRepository } from '../repositories/activity.repository'
import type { CreateChallengeInput } from '../validations/challenge.validation'

const challengeRepo = new ChallengeRepository()
const activityRepo = new ActivityRepository()

export class ChallengeService {
  // ─── Create Challenge ─────────────────────────────────────────────────────

  async createChallenge(userId: string, input: CreateChallengeInput) {
    const startAt = new Date(input.startAt)
    const endAt = new Date(input.endAt)

    const challenge = await challengeRepo.create({
      creatorId: userId,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      targetDistanceMeters: input.targetDistanceMeters ?? null,
      targetDurationSeconds: input.targetDurationSeconds ?? null,
      targetActivities: input.targetActivities ?? null,
      targetStreakDays: input.targetStreakDays ?? null,
      startAt,
      endAt,
      isActive: true,
    })

    return challenge
  }

  // ─── List Active Challenges ───────────────────────────────────────────────

  async listChallenges(page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      challengeRepo.findActive(limit, offset),
      challengeRepo.countActive(),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // ─── Get Challenge by ID ──────────────────────────────────────────────────

  async getChallengeById(challengeId: string, userId: string) {
    const challenge = await challengeRepo.findById(challengeId)
    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    const [participantCount, myParticipation] = await Promise.all([
      challengeRepo.countParticipants(challengeId),
      challengeRepo.findParticipant(challengeId, userId),
    ])

    return { ...challenge, participantCount, myParticipation: myParticipation ?? null }
  }

  // ─── Join Challenge ───────────────────────────────────────────────────────

  async joinChallenge(userId: string, challengeId: string) {
    const challenge = await challengeRepo.findById(challengeId)
    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    if (!challenge.isActive) {
      throw new AppError('Challenge is not active', 400, 'CHALLENGE_INACTIVE')
    }

    const now = new Date()
    if (now > challenge.endAt) {
      throw new AppError('Challenge has already ended', 400, 'CHALLENGE_ENDED')
    }

    const existing = await challengeRepo.findParticipant(challengeId, userId)
    if (existing) {
      throw new AppError('Already joined this challenge', 409, 'ALREADY_JOINED')
    }

    const participant = await challengeRepo.createParticipant({
      challengeId,
      userId,
      progressDistanceMeters: 0,
      progressDurationSeconds: 0,
      progressActivities: 0,
      currentStreak: 0,
      joinedAt: now,
    })

    return participant
  }

  // ─── Leave Challenge ──────────────────────────────────────────────────────

  async leaveChallenge(userId: string, challengeId: string) {
    const challenge = await challengeRepo.findById(challengeId)
    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    const participant = await challengeRepo.findParticipant(challengeId, userId)
    if (!participant) {
      throw new AppError('You are not a participant of this challenge', 404, 'NOT_A_PARTICIPANT')
    }

    if (participant.completedAt) {
      throw new AppError('Cannot leave a completed challenge', 400, 'CHALLENGE_ALREADY_COMPLETED')
    }

    await challengeRepo.deleteParticipant(challengeId, userId)
  }

  // ─── Add Progress ─────────────────────────────────────────────────────────

  async addProgress(userId: string, challengeId: string, activityId: string) {
    const challenge = await challengeRepo.findById(challengeId)
    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    if (!challenge.isActive) {
      throw new AppError('Challenge is not active', 400, 'CHALLENGE_INACTIVE')
    }

    const now = new Date()
    if (now > challenge.endAt) {
      throw new AppError('Challenge has already ended', 400, 'CHALLENGE_ENDED')
    }

    const participant = await challengeRepo.findParticipant(challengeId, userId)
    if (!participant) {
      throw new AppError('You are not a participant of this challenge', 404, 'NOT_A_PARTICIPANT')
    }

    if (participant.completedAt) {
      throw new AppError('Challenge already completed', 400, 'CHALLENGE_ALREADY_COMPLETED')
    }

    // Verify activity belongs to user and is VERIFIED
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status !== 'VERIFIED') {
      throw new AppError(
        'Only VERIFIED activities can contribute to challenge progress',
        400,
        'ACTIVITY_NOT_VERIFIED'
      )
    }

    // Check activity was done within challenge period
    if (activity.startedAt < challenge.startAt || activity.startedAt > challenge.endAt) {
      throw new AppError(
        'Activity was not performed during the challenge period',
        400,
        'ACTIVITY_OUTSIDE_PERIOD'
      )
    }

    // Prevent duplicate usage of the same activity in this challenge
    const existingUsage = await challengeRepo.findActivityUsage(challengeId, activityId)
    if (existingUsage) {
      throw new AppError(
        'Activity has already been used for this challenge',
        409,
        'ACTIVITY_ALREADY_USED'
      )
    }

    // Calculate progress contribution based on challenge type
    let progressAmount = 0
    const progressUpdate: Record<string, unknown> = {}

    switch (challenge.type) {
      case 'DISTANCE':
        progressAmount = Number(activity.distanceMeters)
        progressUpdate['progressDistanceMeters'] =
          (participant.progressDistanceMeters ?? 0) + progressAmount
        break

      case 'DURATION':
        progressAmount = activity.durationSeconds
        progressUpdate['progressDurationSeconds'] =
          (participant.progressDurationSeconds ?? 0) + progressAmount
        break

      case 'ACTIVITY_COUNT':
        progressAmount = 1
        progressUpdate['progressActivities'] =
          (participant.progressActivities ?? 0) + progressAmount
        break

      case 'STREAK':
        // Streak: increment if activity is on consecutive day from last activity
        progressAmount = 1
        progressUpdate['progressActivities'] =
          (participant.progressActivities ?? 0) + progressAmount
        // Simple streak: increment current streak
        progressUpdate['currentStreak'] = (participant.currentStreak ?? 0) + 1
        break
    }

    // Record activity usage
    await challengeRepo.createActivityUsage({
      challengeId,
      participantId: participant.id,
      activityId,
      progressAmount,
    })

    // Check completion
    const isCompleted = this.checkCompletion(challenge, {
      ...participant,
      ...progressUpdate,
    })

    if (isCompleted) {
      progressUpdate['completedAt'] = now
    }

    const updated = await challengeRepo.updateParticipant(participant.id, progressUpdate)

    return {
      participant: updated,
      progressAmount,
      isCompleted,
    }
  }

  // ─── Get My Participations ────────────────────────────────────────────────

  async getMyParticipations(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      challengeRepo.findMyParticipations(userId, limit, offset),
      challengeRepo.countMyParticipations(userId),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // ─── Get Participants (leaderboard) ───────────────────────────────────────

  async getParticipants(challengeId: string, page: number, limit: number) {
    const challenge = await challengeRepo.findById(challengeId)
    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      challengeRepo.findParticipantsByChallenge(challengeId, limit, offset),
      challengeRepo.countParticipants(challengeId),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private checkCompletion(
    challenge: { type: string; targetDistanceMeters: number | null; targetDurationSeconds: number | null; targetActivities: number | null; targetStreakDays: number | null },
    participant: { progressDistanceMeters?: number | null; progressDurationSeconds?: number | null; progressActivities?: number | null; currentStreak?: number | null }
  ): boolean {
    switch (challenge.type) {
      case 'DISTANCE':
        return (
          challenge.targetDistanceMeters !== null &&
          (participant.progressDistanceMeters ?? 0) >= challenge.targetDistanceMeters
        )

      case 'DURATION':
        return (
          challenge.targetDurationSeconds !== null &&
          (participant.progressDurationSeconds ?? 0) >= challenge.targetDurationSeconds
        )

      case 'ACTIVITY_COUNT':
        return (
          challenge.targetActivities !== null &&
          (participant.progressActivities ?? 0) >= challenge.targetActivities
        )

      case 'STREAK':
        return (
          challenge.targetStreakDays !== null &&
          (participant.currentStreak ?? 0) >= challenge.targetStreakDays
        )

      default:
        return false
    }
  }
}
