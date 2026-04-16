import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify manager role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
      const metaRole = user.user_metadata?.role
      if (!metaRole || (metaRole !== 'manager' && metaRole !== 'admin')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }), 
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Try admin client first, fall back to regular client
    let dataClient = supabase
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceKey) {
        dataClient = createAdminClient()
      }
    } catch (e) {
      console.warn('Using regular client for data fetch')
    }

    // Get quiz info
    const { data: quiz } = await dataClient
      .from('quizzes')
      .select('title')
      .eq('id', quizId)
      .single()

    // Get leaderboard data - fetch attempts first
    const { data: attempts, error: attemptsError } = await dataClient
      .from('quiz_attempts')
      .select('id, user_id, score, time_taken_seconds, completed_at')
      .eq('quiz_id', quizId)
      .eq('status', 'completed')
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true })

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError)
      return new NextResponse(
        JSON.stringify({ error: attemptsError.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch profiles separately if we have attempts
    let profilesMap: Record<string, any> = {}
    if (attempts && attempts.length > 0) {
      const userIds = [...new Set(attempts.map((a: any) => a.user_id))]
      const { data: profiles } = await dataClient
        .from('profiles')
        .select('id, full_name, email, employee_id, department')
        .in('id', userIds)
      
      if (profiles) {
        profilesMap = profiles.reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = p
          return acc
        }, {})
      }
    }

    // Build Excel data
    const rows = (attempts || []).map((a: any, i: number) => {
      const profile = profilesMap[a.user_id] || {}
      return {
        'S.No': i + 1,
        'Email': profile.email || 'N/A',
        'Name': profile.full_name || 'Unknown',
        'Score (%)': a.score || 0,
        'Completion Time': formatTime(a.time_taken_seconds),
        'Employee ID': profile.employee_id || 'N/A',
        'Department': profile.department || 'N/A',
      }
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ 'Message': 'No completed attempts yet' }])

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const filename = `leaderboard-${quiz?.title?.replace(/[^a-zA-Z0-9]/g, '-') || quizId}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: any) {
    console.error('Download error:', e)
    return NextResponse.json({ error: e.message || 'Failed to generate download' }, { status: 500 })
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}
