import { AppError } from '../utils/error'
import { RewardRepository } from '../repositories/reward.repository'
import { ActivityRepository } from '../repositories/activity.repository'
import { WalletRepository } from '../repositories/wallet.repository'
import { BlockchainService } from './blockchain.service'
import { CONTRACT_ACTIVITY_PROOF, CONTRACT_REWARD_MANAGER, BLOCKCHAIN_CHAIN_ID } from '../config'
import { db } from '../lib/db'
import { blockchainTransactions } from '../db/schema/index'
import { eq } from 'drizzle-orm'

const rewardRepo = new RewardRepository()
const activityRepo = new ActivityRepository()
const walletRepo = new WalletRepository()
const blockchainService = new BlockchainService()

// Default reward amount: 10 FIT tokens in base units (18 decimals)
const DEFAULT_REWARD_AMOUNT = BigInt('10000000000000000000')

export class RewardService {
  // Called after an activity reaches VERIFIED status.
  // Flow: create reward record → check wallet → ActivityProof.sol → RewardManager.sol → mark COMPLETED

  async processActivityReward(userId: string, activityId: string) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    if (activity.status !== 'VERIFIED') {
      throw new AppError(
        'Only VERIFIED activities are eligible for rewards',
        400,
        'ACTIVITY_NOT_VERIFIED'
      )
    }

    if (!activity.activityHash) {
      throw new AppError('Activity hash is missing', 400, 'MISSING_ACTIVITY_HASH')
    }

    // Prevent duplicate reward
    const existingReward = await rewardRepo.findByActivityId(activityId)
    if (existingReward) {
      return existingReward
    }

    // Find primary wallet
    const wallets = await walletRepo.findByUserId(userId)
    const primaryWallet = wallets.find((w) => w.isPrimary) ?? null

    // If no wallet → create PENDING reward and return
    if (!primaryWallet) {
      const reward = await rewardRepo.create({
        userId,
        activityId,
        walletId: null,
        rewardType: 'ACTIVITY',
        amountBaseUnits: DEFAULT_REWARD_AMOUNT.toString(),
        status: 'PENDING',
        contractAddress: CONTRACT_REWARD_MANAGER || null,
      })
      return reward
    }

    // Create reward record in PROCESSING state
    const reward = await rewardRepo.create({
      userId,
      activityId,
      walletId: primaryWallet.id,
      rewardType: 'ACTIVITY',
      amountBaseUnits: DEFAULT_REWARD_AMOUNT.toString(),
      status: 'PROCESSING',
      contractAddress: CONTRACT_REWARD_MANAGER || null,
    })

    // Update daily limit tracking
    const today = new Date().toISOString().substring(0, 10)
    await rewardRepo.upsertDailyLimit(userId, today, DEFAULT_REWARD_AMOUNT)

    try {
      // Step 1: Check if proof already recorded on-chain
      let existingProof = await rewardRepo.findProofByActivityId(activityId)

      if (!existingProof) {
        // Record activity proof on-chain via ActivityProof.sol
        const proofTxHash = await blockchainService.recordActivityProof(
          activity.activityHash,
          primaryWallet.address,
          userId,
          activityId
        )

        // Persist proof record
        existingProof = await rewardRepo.createProof({
          activityId,
          activityHash: activity.activityHash,
          contractAddress: CONTRACT_ACTIVITY_PROOF || '',
          blockchainId: BLOCKCHAIN_CHAIN_ID,
          verified: true,
        })

        // Link proof to its transaction
        const proofTxRecord = await this.findTxByHash(proofTxHash)
        if (proofTxRecord && existingProof) {
          await rewardRepo.updateProof(existingProof.id, {
            transactionId: proofTxRecord.id,
          })
        }
      }

      // Step 2: Distribute FIT reward via RewardManager.sol
      const rewardTxHash = await blockchainService.rewardActivity(
        primaryWallet.address,
        DEFAULT_REWARD_AMOUNT,
        userId,
        activityId
      )

      // Find the reward transaction record
      const rewardTxRecord = await this.findTxByHash(rewardTxHash)

      // Mark reward as COMPLETED
      const completedReward = await rewardRepo.update(reward.id, {
        status: 'COMPLETED',
        transactionId: rewardTxRecord?.id ?? null,
        rewardedAt: new Date(),
      })

      return completedReward
    } catch (err) {
      // Mark reward as FAILED on any blockchain error
      await rewardRepo.update(reward.id, { status: 'FAILED' })
      throw new AppError(
        `Reward processing failed: ${err instanceof Error ? err.message : String(err)}`,
        500,
        'REWARD_FAILED'
      )
    }
  }

  async getRewardByActivity(userId: string, activityId: string) {
    const activity = await activityRepo.findByIdAndUserId(activityId, userId)
    if (!activity) {
      throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
    }

    const reward = await rewardRepo.findByActivityId(activityId)
    return reward ?? null
  }

  async listRewards(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      rewardRepo.findByUserId(userId, limit, offset),
      rewardRepo.countByUserId(userId),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async listTransactions(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit
    const [items, total] = await Promise.all([
      rewardRepo.findTransactionsByUserId(userId, limit, offset),
      rewardRepo.countTransactionsByUserId(userId),
    ])

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getFITBalance(userId: string) {
    const wallets = await walletRepo.findByUserId(userId)
    const primaryWallet = wallets.find((w) => w.isPrimary) ?? null

    if (!primaryWallet) {
      return { address: null, balance: '0', hasWallet: false }
    }

    const balance = await blockchainService.getFITBalance(primaryWallet.address)
    return {
      address: primaryWallet.address,
      balance: balance.toString(),
      hasWallet: true,
    }
  }

  private async findTxByHash(txHash: string) {
    // Find the blockchain_transaction record by its hash
    // We look through recent transactions for the userId
    // Since blockchainService inserts records immediately, find by hash
    const [tx] = await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.transactionHash, txHash))
      .limit(1)

    return tx ?? null
  }
}
