/**
 * POST /api/ai-insight
 * Returns a brief AI-generated coaching insight for a given context type.
 * Designed to be lightweight — capped at 200 tokens per call.
 */
import { requireManagerForApi } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, buildCompactAssessmentContext } from '@/lib/ai'

export type InsightType = 'batch_health' | 'attendance' | 'trainer_performance' | 'quiz_results'

const INSIGHT_PROMPTS: Record<InsightType, string> = {
  batch_health: 'You are a training manager coach. Given batch health data, give 1 concise actionable recommendation in 2 sentences max.',
  attendance: 'You are a training manager coach. Given attendance data, identify the single biggest risk and suggest one action in 2 sentences max.',
  trainer_performance: 'You are a training manager coach. Given trainer metrics, name the top and bottom performer and suggest one improvement in 2 sentences max.',
  quiz_results: 'You are a training assessment coach. Given quiz result data, identify the weakest area and suggest one remediation in 2 sentences max.',
}

export async function POST(request: NextRequest) {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth

  try {
    const { type, data } = await request.json() as { type: InsightType; data: any }

    if (!type || !data) {
      return NextResponse.json({ error: 'type and data are required' }, { status: 400 })
    }

    const systemPrompt = INSIGHT_PROMPTS[type] ?? INSIGHT_PROMPTS.batch_health

    // Build compact data representation to keep token usage minimal
    const contextStr =
      type === 'quiz_results' && Array.isArray(data)
        ? buildCompactAssessmentContext(data)
        : typeof data === 'object'
        ? JSON.stringify(data, null, 0) // no whitespace = fewer tokens
        : String(data)

    const { text, provider } = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextStr },
      ],
      { maxTokens: 200, temperature: 0.4 }
    )

    return NextResponse.json({ insight: text.trim(), provider })
  } catch (error: any) {
    console.error('AI insight error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate insight' }, { status: 500 })
  }
}
