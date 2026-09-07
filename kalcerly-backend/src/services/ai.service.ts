import axios from 'axios'
import { AI_BASE_URL, AI_API_KEY, AI_MODEL } from '../config'

export type AIVerificationResult =
  | 'VERIFIED'
  | 'NEEDS_REVIEW'
  | 'REJECTED'

export interface AIVerificationResponse {
  result: AIVerificationResult
  confidence: number
  score: number
  reason: string
  provider: string
  model: string
}

export interface ActivityVerificationInput {
  type: 'WALKING' | 'RUNNING' | 'CYCLING'
  distanceMeters: number
  durationSeconds: number
  elevationMeters: number
  startedAt: string
  endedAt: string
  pointCount: number
  samplePoints: Array<{
    sequence: number
    latitude: string
    longitude: string
    altitudeMeters?: string | null
    speedMps?: string | null
    timestamp: string
  }>
}

const SYSTEM_PROMPT = `
You are a general fitness activity verification AI for the Kalcerly app.

Your task is to analyze activity data such as:
- activity type
- distance
- duration
- average speed
- GPS points
- GPS timestamps
- elevation
- individual GPS speeds

Determine whether the activity is likely genuine or suspicious.

Use the following typical speed ranges as supporting signals, NOT as the only verification criteria:

WALKING:
- typical average speed: <= 2.5 m/s
- hard maximum: 3.5 m/s

RUNNING:
- typical average speed: <= 6.5 m/s
- hard maximum: 9.0 m/s

CYCLING:
- typical average speed: <= 15.0 m/s
- hard maximum: 22.0 m/s

Consider:
1. Distance and duration consistency.
2. Average speed.
3. Individual GPS speed anomalies.
4. GPS point density.
5. Timestamp consistency.
6. Sudden or unrealistic movement.
7. Overall plausibility of the activity.
8. Possible GPS spoofing or manipulated activity data.

Decision:
- VERIFIED: activity appears genuine and consistent.
- NEEDS_REVIEW: activity has suspicious or inconclusive signals but cannot confidently be rejected.
- REJECTED: activity contains strong evidence of impossible, manipulated, or highly inconsistent data.

Return ONLY valid JSON.

Required format:
{
  "result": "VERIFIED" | "NEEDS_REVIEW" | "REJECTED",
  "confidence": 0.0-1.0,
  "score": 0.0-100.0,
  "reason": "brief reason"
}
`

function buildUserPrompt(input: ActivityVerificationInput): string {
  const avgSpeed =
    input.durationSeconds > 0
      ? (input.distanceMeters / input.durationSeconds).toFixed(3)
      : '0'

  const points = input.samplePoints
    .map(
      (point) =>
        `seq=${point.sequence}` +
        ` lat=${point.latitude}` +
        ` lng=${point.longitude}` +
        (point.speedMps
          ? ` spd=${point.speedMps}m/s`
          : '') +
        (point.altitudeMeters
          ? ` alt=${point.altitudeMeters}m`
          : '') +
        ` t=${point.timestamp}`
    )
    .join('\n')

  return `
Activity Type: ${input.type}
Distance: ${input.distanceMeters}m
Duration: ${input.durationSeconds}s
Average Speed: ${avgSpeed}m/s
Elevation: ${input.elevationMeters}m
GPS Points: ${input.pointCount}
Period: ${input.startedAt} → ${input.endedAt}

Sample GPS Points (${input.samplePoints.length}/${input.pointCount}):
${points}

Analyze the activity and return JSON only.
`
}

function extractJson(raw: string): string {
  return raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

function parseProviderResponse(
  content: string,
  providerName: string,
  modelName: string
): AIVerificationResponse {
  const cleaned = extractJson(content)

  const parsed = JSON.parse(cleaned) as {
    result: AIVerificationResult
    confidence: number
    score: number
    reason: string
  }

  if (
    !['VERIFIED', 'NEEDS_REVIEW', 'REJECTED'].includes(
      parsed.result
    )
  ) {
    throw new Error(`Invalid result value: ${parsed.result}`)
  }

  const confidence = Number(parsed.confidence)
  const score = Number(parsed.score)

  if (
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    throw new Error('Invalid confidence value')
  }

  if (
    !Number.isFinite(score) ||
    score < 0 ||
    score > 100
  ) {
    throw new Error('Invalid score value')
  }

  return {
    result: parsed.result,
    confidence,
    score,
    reason: parsed.reason,
    provider: providerName,
    model: modelName,
  }
}

export class AIService {
  private async callAI(
    input: ActivityVerificationInput
  ): Promise<AIVerificationResponse> {
    const url = `${AI_BASE_URL.replace(/\/$/, '')}/chat/completions`

    const providerName = new URL(AI_BASE_URL).hostname

    const response = await axios.post(
      url,
      {
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: buildUserPrompt(input),
          },
        ],
        temperature: 0.1,
        max_tokens: 256,
        response_format: {
          type: 'json_object',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    )

    const content =
      response.data?.choices?.[0]?.message?.content ?? ''

    if (!content) {
      throw new Error('AI returned an empty response')
    }

    return parseProviderResponse(
      content,
      providerName,
      AI_MODEL
    )
  }

  private isAIConfigured(): boolean {
    return Boolean(
      AI_BASE_URL &&
      AI_API_KEY &&
      AI_MODEL
    )
  }

  async verifyActivity(
    input: ActivityVerificationInput
  ): Promise<AIVerificationResponse> {
    if (this.isAIConfigured()) {
      try {
        return await this.callAI(input)
      } catch (error) {
        console.error(
          '[AI] Verification failed:',
          error instanceof Error
            ? error.message
            : error
        )
      }
    }

    return this.ruleBasedVerification(input)
  }

  private ruleBasedVerification(
    input: ActivityVerificationInput
  ): AIVerificationResponse {
    const avgSpeedMps =
      input.durationSeconds > 0
        ? input.distanceMeters / input.durationSeconds
        : 0

    const limits: Record<
      ActivityVerificationInput['type'],
      {
        max: number
        hardMax: number
      }
    > = {
      WALKING: {
        max: 2.5,
        hardMax: 3.5,
      },

      RUNNING: {
        max: 6.5,
        hardMax: 9.0,
      },

      CYCLING: {
        max: 15.0,
        hardMax: 22.0,
      },
    }

    const limit = limits[input.type]

    const minPoints = Math.floor(
      input.durationSeconds / 30
    )

    // Impossible average speed
    if (avgSpeedMps > limit.hardMax) {
      return {
        result: 'REJECTED',
        confidence: 0.98,
        score: 2,
        reason:
          `Average speed ${avgSpeedMps.toFixed(2)} m/s ` +
          `exceeds physical maximum for ${input.type}`,
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Distance / duration inconsistency
    if (
      avgSpeedMps < 0.05 &&
      input.distanceMeters > 100
    ) {
      return {
        result: 'REJECTED',
        confidence: 0.95,
        score: 5,
        reason:
          'Distance and duration are inconsistent — possible GPS spoofing',
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Insufficient GPS points
    if (
      input.pointCount < minPoints &&
      input.pointCount < 10
    ) {
      return {
        result: 'NEEDS_REVIEW',
        confidence: 0.60,
        score: 55,
        reason:
          `Only ${input.pointCount} GPS points ` +
          `for ${input.durationSeconds}s activity`,
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Above typical speed
    if (avgSpeedMps > limit.max) {
      return {
        result: 'NEEDS_REVIEW',
        confidence: 0.65,
        score: 60,
        reason:
          `Average speed ${avgSpeedMps.toFixed(2)} m/s ` +
          `is above the typical range for ${input.type}`,
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    const confidence = Math.min(
      0.70 +
        (input.pointCount / 500) * 0.25,
      0.95
    )

    return {
      result: 'VERIFIED',
      confidence: Number(confidence.toFixed(4)),
      score: Number((confidence * 100).toFixed(2)),
      reason:
        `Activity is consistent with ${input.type} — ` +
        'speed and GPS data are within expected ranges',
      provider: 'rule-based',
      model: 'kalcerly-rules-v1',
    }
  }
}