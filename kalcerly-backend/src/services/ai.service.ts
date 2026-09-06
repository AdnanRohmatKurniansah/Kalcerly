import axios from 'axios'
import { AI_PROVIDER, OPENAI_API_KEY, OPENAI_MODEL, GEMINI_API_KEY, GEMINI_MODEL } from '../config'

export type AIVerificationResult = 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED'

export interface AIVerificationResponse {
  result: AIVerificationResult
  confidence: number   // 0.0 - 1.0
  score: number        // 0.0 - 100.0
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
  // Sample GPS points for analysis (first, middle, last)
  samplePoints: Array<{
    sequence: number
    latitude: string
    longitude: string
    altitudeMeters?: string | null
    speedMps?: string | null
    timestamp: string
  }>
}

const VERIFICATION_SYSTEM_PROMPT = `You are a fitness activity verification AI for the Kalcerly app.
Your job is to analyze activity data (GPS points, speed, distance, duration) to determine if it is genuine.

Rules for each activity type:
- WALKING: avg speed 0.5–2.5 m/s, max 3.0 m/s
- RUNNING: avg speed 1.5–6.5 m/s, max 9.0 m/s
- CYCLING: avg speed 2.0–15.0 m/s, max 20.0 m/s

Red flags for REJECTED:
- Speed physically impossible for activity type
- Teleportation (huge distance jump between consecutive points)
- Duration/distance ratio impossible
- GPS points show static position for entire activity

Red flags for NEEDS_REVIEW:
- Speed slightly above normal range but plausible
- Very few GPS points relative to duration
- Inconsistent speed patterns

Return ONLY valid JSON with no markdown:
{
  "result": "VERIFIED" | "NEEDS_REVIEW" | "REJECTED",
  "confidence": 0.0 to 1.0,
  "score": 0.0 to 100.0,
  "reason": "brief explanation in English"
}`

export class AIService {
  private isConfigured(): boolean {
    if (AI_PROVIDER === 'openai') return !!OPENAI_API_KEY
    if (AI_PROVIDER === 'gemini') return !!GEMINI_API_KEY
    return false
  }

  private buildPrompt(input: ActivityVerificationInput): string {
    const avgSpeedMps = input.durationSeconds > 0
      ? (input.distanceMeters / input.durationSeconds).toFixed(3)
      : '0'

    return `Verify this ${input.type} activity:
- Distance: ${input.distanceMeters}m
- Duration: ${input.durationSeconds}s
- Average speed: ${avgSpeedMps} m/s
- Elevation gain: ${input.elevationMeters}m
- GPS points recorded: ${input.pointCount}
- Start: ${input.startedAt}
- End: ${input.endedAt}

Sample GPS points (${input.samplePoints.length} of ${input.pointCount}):
${input.samplePoints.map(p =>
  `seq=${p.sequence} lat=${p.latitude} lng=${p.longitude}` +
  (p.speedMps ? ` speed=${p.speedMps}m/s` : '') +
  (p.altitudeMeters ? ` alt=${p.altitudeMeters}m` : '') +
  ` t=${p.timestamp}`
).join('\n')}

Return JSON only.`
  }

  private async verifyWithOpenAI(input: ActivityVerificationInput): Promise<AIVerificationResponse> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: VERIFICATION_SYSTEM_PROMPT },
          { role: 'user', content: this.buildPrompt(input) },
        ],
        temperature: 0.1,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )

    const content: string = response.data?.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(content.trim()) as { result: AIVerificationResult; confidence: number; score: number; reason: string }

    return {
      result: parsed.result,
      confidence: Number(parsed.confidence),
      score: Number(parsed.score),
      reason: parsed.reason,
      provider: 'openai',
      model: OPENAI_MODEL,
    }
  }

  private async verifyWithGemini(input: ActivityVerificationInput): Promise<AIVerificationResponse> {
    const prompt = `${VERIFICATION_SYSTEM_PROMPT}\n\n${this.buildPrompt(input)}`

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    )

    const content: string =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Strip markdown code fences if Gemini wraps response
    const cleaned = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as { result: AIVerificationResult; confidence: number; score: number; reason: string }

    return {
      result: parsed.result,
      confidence: Number(parsed.confidence),
      score: Number(parsed.score),
      reason: parsed.reason,
      provider: 'gemini',
      model: GEMINI_MODEL,
    }
  }

  /**
   * Verify a fitness activity using the configured AI provider.
   * Falls back to rule-based verification if AI is not configured or fails.
   */
  async verifyActivity(input: ActivityVerificationInput): Promise<AIVerificationResponse> {
    if (this.isConfigured()) {
      try {
        if (AI_PROVIDER === 'openai') return await this.verifyWithOpenAI(input)
        if (AI_PROVIDER === 'gemini') return await this.verifyWithGemini(input)
      } catch (err) {
        console.error('[AI Verification] Provider failed, falling back to rule-based:', err)
      }
    }

    // Rule-based fallback — always available, no API key needed
    return this.ruleBasedVerification(input)
  }

  /**
   * Rule-based verification fallback.
   * Used when AI is not configured or when API call fails.
   */
  private ruleBasedVerification(input: ActivityVerificationInput): AIVerificationResponse {
    const avgSpeedMps = input.durationSeconds > 0
      ? input.distanceMeters / input.durationSeconds
      : 0

    const speedLimits: Record<string, { min: number; max: number; hardMax: number }> = {
      WALKING:  { min: 0.3, max: 2.5,  hardMax: 3.5 },
      RUNNING:  { min: 0.5, max: 6.5,  hardMax: 9.0 },
      CYCLING:  { min: 0.5, max: 15.0, hardMax: 22.0 },
    }

    const limits = speedLimits[input.type]!
    const minPointsExpected = Math.floor(input.durationSeconds / 30) // 1 point per 30s minimum

    // Hard reject: physically impossible speed
    if (avgSpeedMps > limits.hardMax) {
      return {
        result: 'REJECTED',
        confidence: 0.98,
        score: 2,
        reason: `Average speed ${avgSpeedMps.toFixed(2)} m/s exceeds the physical maximum for ${input.type}`,
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Hard reject: distance impossible in given time (teleportation)
    if (avgSpeedMps < 0.05 && input.distanceMeters > 100) {
      return {
        result: 'REJECTED',
        confidence: 0.95,
        score: 5,
        reason: 'Distance and duration are inconsistent — possible GPS spoofing',
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Needs review: very few GPS points
    if (input.pointCount < minPointsExpected && input.pointCount < 10) {
      return {
        result: 'NEEDS_REVIEW',
        confidence: 0.60,
        score: 55,
        reason: `Only ${input.pointCount} GPS points recorded for a ${input.durationSeconds}s activity — may be incomplete tracking`,
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Needs review: speed slightly above normal
    if (avgSpeedMps > limits.max) {
      return {
        result: 'NEEDS_REVIEW',
        confidence: 0.65,
        score: 60,
        reason: `Average speed ${avgSpeedMps.toFixed(2)} m/s is above typical range for ${input.type}`,
        provider: 'rule-based',
        model: 'kalcerly-rules-v1',
      }
    }

    // Verified
    const confidence = Math.min(0.70 + (input.pointCount / 500) * 0.25, 0.95)
    return {
      result: 'VERIFIED',
      confidence: parseFloat(confidence.toFixed(4)),
      score: parseFloat((confidence * 100).toFixed(2)),
      reason: `Activity data is consistent with ${input.type} — speed and GPS data within expected range`,
      provider: 'rule-based',
      model: 'kalcerly-rules-v1',
    }
  }
}
