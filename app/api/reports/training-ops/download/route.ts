import { createAdminClient, createClient } from '@/lib/supabase/server'
import { requireManagerForApi } from '@/lib/rbac'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const supabase = await createClient()
  let dataClient: any = supabase
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    dataClient = createAdminClient()
  }

  const { data: batches, error: batchError } = await dataClient
    .from('training_batches')
    .select(`
      *,
      trainer:trainer_id(full_name, email),
      coordinator:coordinator_id(full_name, email)
    `)
    .or(`created_by.eq.${userId},coordinator_id.eq.${userId},trainer_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (batchError) {
    return NextResponse.json({ error: batchError.message }, { status: 500 })
  }

  const batchIds = (batches || []).map((batch: any) => batch.id)
  const [membersRes, sessionsRes, notificationsRes, feedbackRes, quizzesRes] = await Promise.all([
    batchIds.length
      ? dataClient
          .from('batch_members')
          .select('*, profile:user_id(full_name, email, employee_id, department, domain)')
          .in('batch_id', batchIds)
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? dataClient
          .from('training_sessions')
          .select('*, batch:batch_id(title), trainer:trainer_id(full_name, email)')
          .in('batch_id', batchIds)
          .order('session_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? dataClient
          .from('training_notifications')
          .select('*, batch:batch_id(title), session:session_id(title), recipient:recipient_user_id(full_name, email)')
          .in('batch_id', batchIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? dataClient
          .from('training_feedback')
          .select('*, batch:batch_id(title), session:session_id(title), trainee:user_id(full_name, email)')
          .in('batch_id', batchIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? dataClient
          .from('quizzes')
          .select('id, title, topic, difficulty, passing_score, is_active, batch_id')
          .in('batch_id', batchIds)
      : Promise.resolve({ data: [] }),
  ])

  const sessions = sessionsRes.data || []
  const sessionIds = sessions.map((session: any) => session.id)
  const attendanceRes = sessionIds.length
    ? await dataClient
        .from('session_attendance')
        .select('*, session:session_id(title, session_date, batch_id), profile:user_id(full_name, email, employee_id)')
        .in('session_id', sessionIds)
    : { data: [] }

  const members = membersRes.data || []
  const attendance = attendanceRes.data || []
  const notifications = notificationsRes.data || []
  const feedback = feedbackRes.data || []
  const quizzes = quizzesRes.data || []

  const membersByBatch = groupBy(members, 'batch_id')
  const sessionsByBatch = groupBy(sessions, 'batch_id')
  const quizzesByBatch = groupBy(quizzes, 'batch_id')
  const attendanceBySession = groupBy(attendance, 'session_id')
  const feedbackByBatch = groupBy(feedback, 'batch_id')

  const wb = XLSX.utils.book_new()

  const batchRows = (batches || []).map((batch: any) => {
    const batchMembers = membersByBatch.get(batch.id) || []
    const batchSessions = sessionsByBatch.get(batch.id) || []
    const batchQuizzes = quizzesByBatch.get(batch.id) || []
    const batchAttendance = batchSessions.flatMap((session: any) => attendanceBySession.get(session.id) || [])
    const present = batchAttendance.filter((entry: any) => ['present', 'late'].includes(entry.status)).length
    const attendanceRate = batchAttendance.length ? Math.round((present / batchAttendance.length) * 100) : 0
    return {
      'Batch ID': batch.id,
      'Batch Name': batch.title,
      'Domain': batch.domain || 'N/A',
      'Status': normalizeStatus(batch.status),
      'Start Date': batch.start_date || 'TBD',
      'End Date': batch.end_date || 'TBD',
      'Trainer': batch.trainer?.full_name || batch.trainer?.email || 'Unassigned',
      'Coordinator': batch.coordinator?.full_name || batch.coordinator?.email || 'Unassigned',
      'Candidates': batchMembers.length,
      'Sessions': batchSessions.length,
      'Assessments': batchQuizzes.length,
      'Attendance Health (%)': attendanceRate,
      'Feedback Responses': (feedbackByBatch.get(batch.id) || []).length,
    }
  })

  addSheet(wb, 'Batch Summary', batchRows)
  addSheet(wb, 'Candidate Status', members.map((member: any) => ({
    'Batch': member.batch_id,
    'Candidate Name': member.profile?.full_name || 'Unknown',
    'Email': member.profile?.email || '',
    'Employee ID': member.profile?.employee_id || 'N/A',
    'Domain': member.profile?.domain || member.profile?.department || 'N/A',
    'Enrollment Status': member.enrollment_status,
    'Support Status': member.support_status,
    'Joined At': member.joined_at ? new Date(member.joined_at).toLocaleString() : 'N/A',
  })))
  addSheet(wb, 'Attendance', attendance.map((entry: any) => ({
    'Session': entry.session?.title || 'Session',
    'Session Date': entry.session?.session_date ? new Date(entry.session.session_date).toLocaleString() : 'N/A',
    'Candidate Name': entry.profile?.full_name || 'Unknown',
    'Email': entry.profile?.email || '',
    'Employee ID': entry.profile?.employee_id || 'N/A',
    'Status': entry.status,
    'Check In': entry.check_in_time ? new Date(entry.check_in_time).toLocaleString() : 'N/A',
    'Notes': entry.notes || '',
    'Last Updated': entry.updated_at ? new Date(entry.updated_at).toLocaleString() : 'N/A',
  })))
  addSheet(wb, 'Assessments', quizzes.map((quiz: any) => ({
    'Batch ID': quiz.batch_id,
    'Assessment': quiz.title,
    'Topic': quiz.topic,
    'Difficulty': quiz.difficulty,
    'Passing Score': quiz.passing_score,
    'Status': quiz.is_active ? 'Active' : 'Inactive',
  })))
  addSheet(wb, 'Feedback', feedback.map((item: any) => ({
    'Batch': item.batch?.title || 'N/A',
    'Session': item.session?.title || 'N/A',
    'Candidate': item.trainee?.full_name || item.trainee?.email || 'Unknown',
    'Rating': item.rating,
    'Sentiment': item.sentiment,
    'Feedback': item.feedback_text,
    'Action Item': item.action_item || '',
    'Submitted At': item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A',
  })))
  addSheet(wb, 'Notifications', notifications.map((item: any) => ({
    'Title': item.title,
    'Batch': item.batch?.title || 'N/A',
    'Session': item.session?.title || 'N/A',
    'Recipient': item.recipient?.full_name || item.recipient?.email || item.audience,
    'Channel': item.channel,
    'Status': item.delivery_status,
    'Scheduled For': item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : 'N/A',
    'Sent At': item.sent_at ? new Date(item.sent_at).toLocaleString() : 'N/A',
    'Message': item.message,
  })))

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `maverick-training-ops-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function groupBy(items: any[], key: string) {
  const grouped = new Map<string, any[]>()
  for (const item of items) {
    const groupKey = item[key]
    if (!groupKey) continue
    const group = grouped.get(groupKey) || []
    group.push(item)
    grouped.set(groupKey, group)
  }
  return grouped
}

function addSheet(wb: XLSX.WorkBook, name: string, rows: Record<string, any>[]) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Message: 'No data available yet' }])
  ws['!cols'] = Object.keys(rows[0] || { Message: '' }).map((key) => ({ wch: Math.max(14, Math.min(36, key.length + 8)) }))
  XLSX.utils.book_append_sheet(wb, ws, name)
}

function normalizeStatus(status: string) {
  if (status === 'active') return 'Running'
  if (status === 'at_risk') return 'Running - At Risk'
  return status.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
