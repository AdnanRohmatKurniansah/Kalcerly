import { AppError } from '../utils/error'
import { GoalRepository } from '../repositories/goal.repository'
import { ActivityRepository } from '../repositories/activity.repository'
import type { CreateGoalInput } from '../validations/goal.validation'

const goalRepo = new GoalRepository()
const activityRepo = new ActivityRepository()

export class GoalService {
  // ─── Create Goal ──────────────────────────────────────────────────────────

  async createGoal(userId: string, input: CreateGoalInput) {
    const goal = await goalRepo.create({
      userId,
      type: input.type,
      period: input.period,
      targetValue: input.targetValue,
      currentValue: 0,
      startDate: input.startDate,
      endDate: input.endDate,
    })

    return goal
  }

  // ─── List Goals ───────────────────────────────────────────────────────────

  async listGoals(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      goalRepo.findByUserId(userId, limit, offset),
      goalRepo.countByUserId(userId),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // ─── Get Goal by ID ───────────────────────────────────────────────────────

  async getGoalById(userId: string, goalId: string) {
    const goal = await goalRepo.findByIdAndUserId(goalId, userId)
    if (!goal) {
      throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND')
    }
    return goal
  }

  // ─── Delete Goal ──────────────────────────────────────────────────────────

  async deleteGoal(userId: string, goalId: string) {
    const goal = await goalRepo.findByIdAndUserId(goalId, userId)
    if (!goal) {
      throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND')
    }
    await goalRepo.delete(goalId)
  }

  // ─── Update Progress ──────────────────────────────────────────────────────

  async updateProgress(userId: string, goalId: string, activityId: string) {
    const goal = await goalRepo.findByIdAndUserId(goalId, userId)
    if (!goal) {
      throw new AppError('Goal not found', 404, 'GOAL_NOT_FOUND')
    }

    if (goal.completedAt) {
      throw new AppError('Goal is already completed', 400, 'GOAL_ALREADY_COMPLETED')
    }

    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status !== 'VERIFIED') {
      throw new AppError(
        'Only VERIFIED activities can contribute to goal progress',
        400,
        'ACTIVITY_NOT_VERIFIED'
      )
    }

    // Check activity date falls within goal period
    const activityDate = activity.startedAt.toISOString().substring(0, 10)
    if (activityDate < goal.startDate || activityDate > goal.endDate) {
      throw new AppError(
        'Activity was not performed during the goal period',
        400,
        'ACTIVITY_OUTSIDE_PERIOD'
      )
    }

    // Calculate contribution based on goal type
    let contribution = 0
    switch (goal.type) {
      case 'DISTANCE':
        contribution = Number(activity.distanceMeters)
        break
      case 'DURATION':
        contribution = activity.durationSeconds
        break
      case 'ACTIVITY_COUNT':
        contribution = 1
        break
      case 'ELEVATION':
        contribution = activity.elevationMeters ?? 0
        break
    }

    const newValue = (goal.currentValue ?? 0) + contribution
    const isCompleted = newValue >= goal.targetValue

    const updated = await goalRepo.update(goalId, {
      currentValue: newValue,
      completedAt: isCompleted ? new Date() : null,
    })

    return {
      goal: updated,
      contribution,
      isCompleted,
    }
  }
}
