import { createClient } from '@/lib/supabase/server'
import { requireManagerForApi } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'
import { callAI, buildCompactAssessmentContext } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const supabase = await createClient()

  try {
    const { message, sessionId, quizId, assessmentData } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
    }

    // Create or get session
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: userId,
          quiz_id: quizId || null,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
      }
      currentSessionId = newSession.id
    }

    // Save user message
    await supabase.from('ai_chat_messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: message,
    })

    // Build compact context
    let context = ''
    if (assessmentData && Array.isArray(assessmentData) && assessmentData.length > 0) {
      context = buildCompactAssessmentContext(assessmentData)
    } else if (quizId) {
      const { data: results } = await supabase
        .from('assessment_results')
        .select('candidate_name,candidate_email,percentage,time_taken_minutes,performance_category,percentile')
        .eq('quiz_id', quizId)
        .order('percentage', { ascending: false })
        .limit(60)

      if (results?.length) context = buildCompactAssessmentContext(results)
    }

    // Call AI (OpenAI preferred, Gemini fallback)
    const systemPrompt = `You are a training analytics assistant for managers. Be concise and data-driven.
${context ? `\nASSESSMENT DATA:\n${context}\n` : 'No data loaded — ask user to provide assessment data.'}
Rules: identify patterns, give actionable advice, format numbers cleanly, max 3 bullet points per insight.`

    const { text: assistantMessage } = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      { maxTokens: 600, temperature: 0.5 }
    )

    // Save assistant message
    await supabase.from('ai_chat_messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      content: assistantMessage,
    })

    return NextResponse.json({
      message: assistantMessage,
      sessionId: currentSessionId,
    })

  } catch (error: any) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 })
  }
}

// GET endpoint to fetch chat history
export async function GET(request: NextRequest) {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  try {
    if (sessionId) {
      // Get messages for a specific session
      const { data: messages, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return NextResponse.json({ messages })
    } else {
      // Get all sessions for user
      const { data: sessions, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return NextResponse.json({ sessions })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
