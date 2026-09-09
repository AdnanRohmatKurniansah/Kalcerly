import { createPublicClient, createWalletClient, http, parseAbi, type Hash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { bscTestnet } from 'viem/chains'
import {
  BLOCKCHAIN_RPC_URL,
  BLOCKCHAIN_PRIVATE_KEY,
  BLOCKCHAIN_CHAIN_ID,
  CONTRACT_FIT_TOKEN,
  CONTRACT_ACTIVITY_PROOF,
  CONTRACT_REWARD_MANAGER,
  CONTRACT_CHALLENGE_MANAGER,
} from '../config'
import { db } from '../lib/db'
import { blockchainTransactions } from '../db/schema/index'
import { eq } from 'drizzle-orm'
import { AppError } from '../utils/error'

const ACTIVITY_PROOF_ABI = parseAbi([
  'function recordProof(bytes32 activityHash, address wallet, uint256 timestamp) external',
  'function getProof(bytes32 activityHash) external view returns (address wallet, uint256 timestamp, bool exists)',
])

const REWARD_MANAGER_ABI = parseAbi([
  'function rewardActivity(address wallet, uint256 amount) external',
  'function getDailyLimit() external view returns (uint256)',
  'function getUserDailyUsed(address wallet, uint256 day) external view returns (uint256)',
])

const FIT_TOKEN_ABI = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
])

const CHALLENGE_MANAGER_ABI = parseAbi([
  'function completeChallenge(uint256 challengeId, address participant) external',
  'function getChallengeProgress(uint256 challengeId, address participant) external view returns (uint256)',
])

export class BlockchainService {
  private chain = bscTestnet
  private transport = http(BLOCKCHAIN_RPC_URL || undefined)

  private publicClient = createPublicClient({
    chain: this.chain,
    transport: this.transport,
  })

  private getWalletClient() {
    if (!BLOCKCHAIN_PRIVATE_KEY) {
      throw new AppError('Blockchain private key not configured', 500, 'BLOCKCHAIN_NOT_CONFIGURED')
    }
    const account = privateKeyToAccount(BLOCKCHAIN_PRIVATE_KEY as `0x${string}`)
    return createWalletClient({
      account,
      chain: this.chain,
      transport: this.transport,
    })
  }

  async recordActivityProof(
    activityHash: string,
    walletAddress: string,
    userId: string,
    activityId: string
  ): Promise<string> {
    if (!CONTRACT_ACTIVITY_PROOF) {
      throw new AppError('ActivityProof contract not configured', 500, 'CONTRACT_NOT_CONFIGURED')
    }

    // Record pending transaction
    const [txRecord] = await db
      .insert(blockchainTransactions)
      .values({
        userId,
        activityId,
        type: 'CREATE_ACTIVITY_PROOF',
        chainId: BLOCKCHAIN_CHAIN_ID,
        contractAddress: CONTRACT_ACTIVITY_PROOF,
        functionName: 'recordProof',
        status: 'PENDING',
      })
      .returning()

    if (!txRecord) throw new AppError('Failed to record transaction', 500)

    try {
      const walletClient = this.getWalletClient()
      const hash = await walletClient.writeContract({
        address: CONTRACT_ACTIVITY_PROOF as `0x${string}`,
        abi: ACTIVITY_PROOF_ABI,
        functionName: 'recordProof',
        args: [
          activityHash as `0x${string}`,
          walletAddress as `0x${string}`,
          BigInt(Math.floor(Date.now() / 1000)),
        ],
      })

      await db
        .update(blockchainTransactions)
        .set({ transactionHash: hash, status: 'SUBMITTED', submittedAt: new Date() })
        .where(eq(blockchainTransactions.id, txRecord.id))

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

      await db
        .update(blockchainTransactions)
        .set({
          status: receipt.status === 'success' ? 'CONFIRMED' : 'FAILED',
          blockNumber: Number(receipt.blockNumber),
          confirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(blockchainTransactions.id, txRecord.id))

      if (receipt.status !== 'success') {
        throw new AppError('Transaction failed on-chain', 500, 'TX_FAILED')
      }

      return hash
    } catch (err) {
      await db
        .update(blockchainTransactions)
        .set({
          status: 'FAILED',
          errorMessage: err instanceof Error ? err.message : String(err),
          updatedAt: new Date(),
        })
        .where(eq(blockchainTransactions.id, txRecord.id))
      throw err
    }
  }

  async rewardActivity(
    walletAddress: string,
    amountBaseUnits: bigint,
    userId: string,
    activityId: string
  ): Promise<string> {
    if (!CONTRACT_REWARD_MANAGER) {
      throw new AppError('RewardManager contract not configured', 500, 'CONTRACT_NOT_CONFIGURED')
    }

    const [txRecord] = await db
      .insert(blockchainTransactions)
      .values({
        userId,
        activityId,
        type: 'REWARD_ACTIVITY',
        chainId: BLOCKCHAIN_CHAIN_ID,
        contractAddress: CONTRACT_REWARD_MANAGER,
        functionName: 'rewardActivity',
        status: 'PENDING',
      })
      .returning()

    if (!txRecord) throw new AppError('Failed to record transaction', 500)

    try {
      const walletClient = this.getWalletClient()
      const hash = await walletClient.writeContract({
        address: CONTRACT_REWARD_MANAGER as `0x${string}`,
        abi: REWARD_MANAGER_ABI,
        functionName: 'rewardActivity',
        args: [walletAddress as `0x${string}`, amountBaseUnits],
      })

      await db
        .update(blockchainTransactions)
        .set({ transactionHash: hash, status: 'SUBMITTED', submittedAt: new Date() })
        .where(eq(blockchainTransactions.id, txRecord.id))

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

      await db
        .update(blockchainTransactions)
        .set({
          status: receipt.status === 'success' ? 'CONFIRMED' : 'FAILED',
          blockNumber: Number(receipt.blockNumber),
          confirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(blockchainTransactions.id, txRecord.id))

      if (receipt.status !== 'success') {
        throw new AppError('Reward transaction failed on-chain', 500, 'TX_FAILED')
      }

      return hash
    } catch (err) {
      await db
        .update(blockchainTransactions)
        .set({
          status: 'FAILED',
          errorMessage: err instanceof Error ? err.message : String(err),
          updatedAt: new Date(),
        })
        .where(eq(blockchainTransactions.id, txRecord.id))
      throw err
    }
  }

  async getFITBalance(walletAddress: string): Promise<bigint> {
    if (!CONTRACT_FIT_TOKEN) {
      throw new AppError('FITToken contract not configured', 500, 'CONTRACT_NOT_CONFIGURED')
    }

    return this.publicClient.readContract({
      address: CONTRACT_FIT_TOKEN as `0x${string}`,
      abi: FIT_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    }) as Promise<bigint>
  }

  async completeChallengeOnChain(
    blockchainChallengeId: bigint,
    participantAddress: string,
    userId: string
  ): Promise<string> {
    if (!CONTRACT_CHALLENGE_MANAGER) {
      throw new AppError('ChallengeManager contract not configured', 500, 'CONTRACT_NOT_CONFIGURED')
    }

    const [txRecord] = await db
      .insert(blockchainTransactions)
      .values({
        userId,
        type: 'COMPLETE_CHALLENGE',
        chainId: BLOCKCHAIN_CHAIN_ID,
        contractAddress: CONTRACT_CHALLENGE_MANAGER,
        functionName: 'completeChallenge',
        status: 'PENDING',
      })
      .returning()

    if (!txRecord) throw new AppError('Failed to record transaction', 500)

    try {
      const walletClient = this.getWalletClient()
      const hash = await walletClient.writeContract({
        address: CONTRACT_CHALLENGE_MANAGER as `0x${string}`,
        abi: CHALLENGE_MANAGER_ABI,
        functionName: 'completeChallenge',
        args: [blockchainChallengeId, participantAddress as `0x${string}`],
      })

      await db
        .update(blockchainTransactions)
        .set({ transactionHash: hash, status: 'SUBMITTED', submittedAt: new Date() })
        .where(eq(blockchainTransactions.id, txRecord.id))

      const receipt = await this.publicClient.waitForTransactionReceipt({ hash })

      await db
        .update(blockchainTransactions)
        .set({
          status: receipt.status === 'success' ? 'CONFIRMED' : 'FAILED',
          blockNumber: Number(receipt.blockNumber),
          confirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(blockchainTransactions.id, txRecord.id))

      if (receipt.status !== 'success') {
        throw new AppError('Challenge completion failed on-chain', 500, 'TX_FAILED')
      }

      return hash
    } catch (err) {
      await db
        .update(blockchainTransactions)
        .set({
          status: 'FAILED',
          errorMessage: err instanceof Error ? err.message : String(err),
          updatedAt: new Date(),
        })
        .where(eq(blockchainTransactions.id, txRecord.id))
      throw err
    }
  }

  async isConfigured(): Promise<boolean> {
    return !!(
      BLOCKCHAIN_RPC_URL &&
      BLOCKCHAIN_PRIVATE_KEY &&
      CONTRACT_FIT_TOKEN &&
      CONTRACT_ACTIVITY_PROOF &&
      CONTRACT_REWARD_MANAGER &&
      CONTRACT_CHALLENGE_MANAGER
    )
  }
}
