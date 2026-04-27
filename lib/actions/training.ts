'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireEmployee, requireManager } from '@/lib/rbac'
import type {
  ApiResponse,
  AttendanceStatus,
  FeedbackSentiment,
  NotificationAudience,
  NotificationChannel,
  SessionMode,
  SessionStatus,
  TrainingBatchStatus,
} from '@/lib/types/database'

function asOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asRequiredString(value: FormDataEntryValue | null, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function asBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true'
}

function parseIds(values: FormDataEntryValue[]) {
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
}

function normalizeBatchStatus(status: string): TrainingBatchStatus {
  if (status === 'active') return 'running'
  if (status === 'at_risk') return 'running'
  if (status === 'closed') return 'closed'
  if (status === 'completed') return 'completed'
  return 'planned'
}

function isBatchRunning(status: string) {
  return status === 'running' || status === 'active' || status === 'at_risk'
}

const DEFAULT_GOVERNANCE_SETTINGS = {
  attendanceCutoffTime: '10:00',
  absenceAlertDays: 3,
  topperAssessmentWeight: 70,
  topperProjectWeight: 30,
  topperMinAttendance: 75,
  feedbackWindowDays: 5,
}

function settingNumber(value: unknown, fallback: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

async function readGovernanceSettings(admin = createAdminClient()) {
  const { data } = await admin
    .from('training_system_settings')
    .select('key, value')
    .in('key', [
      'attendance_cutoff_time',
      'absence_alert_days',
      'topper_assessment_weight',
      'topper_project_weight',
      'topper_min_attendance',
      'feedback_window_days',
    ])

  const map = new Map((data || []).map((item: any) => [item.key, item.value]))
  return {
    attendanceCutoffTime: String(map.get('attendance_cutoff_time') || DEFAULT_GOVERNANCE_SETTINGS.attendanceCutoffTime),
    absenceAlertDays: settingNumber(map.get('absence_alert_days'), DEFAULT_GOVERNANCE_SETTINGS.absenceAlertDays),
    topperAssessmentWeight: settingNumber(map.get('topper_assessment_weight'), DEFAULT_GOVERNANCE_SETTINGS.topperAssessmentWeight),
    topperProjectWeight: settingNumber(map.get('topper_project_weight'), DEFAULT_GOVERNANCE_SETTINGS.topperProjectWeight),
    topperMinAttendance: settingNumber(map.get('topper_min_attendance'), DEFAULT_GOVERNANCE_SETTINGS.topperMinAttendance),
    feedbackWindowDays: settingNumber(map.get('feedback_window_days'), DEFAULT_GOVERNANCE_SETTINGS.feedbackWindowDays),
  }
}

function attendanceCutoffForTime(date: Date, cutoffTime: string) {
  const [hoursRaw, minutesRaw] = cutoffTime.split(':')
  const cutoff = new Date(date)
  cutoff.setHours(Number(hoursRaw) || 10, Number(minutesRaw) || 0, 0, 0)
  return cutoff
}

export async function getTrainingOpsManagerData() {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const [batchesRes, trainersRes, employeesRes] = await Promise.all([
    admin
      .from('training_batches')
      .select(`
        *,
        trainer:trainer_id(id, full_name, email),
        coordinator:coordinator_id(id, full_name, email),
        batch_members(count),
        training_sessions(count)
      `)
      .or(`created_by.eq.${userId},coordinator_id.eq.${userId},trainer_id.eq.${userId}`)
      .order('created_at', { ascending: false }),
    admin
      .from('profiles')
      .select('id, full_name, email, role, domain, department')
      .in('role', ['trainer', 'training_coordinator', 'manager', 'admin'])
      .order('full_name', { ascending: true }),
    admin
      .from('profiles')
      .select('id, full_name, email, domain, department, employee_id')
      .eq('role', 'employee')
      .order('full_name', { ascending: true }),
  ])

  const batches = batchesRes.data || []
  const trainers = trainersRes.data || []
  const employees = employeesRes.data || []
  const governanceSettings = await readGovernanceSettings(admin)

  const batchIds = batches.map((batch: any) => batch.id)

  const [membersRes, sessionsRes, notificationsRes, feedbackRes, quizzesRes] = await Promise.all([
    batchIds.length
      ? admin
          .from('batch_members')
          .select(`
            *,
            batch:batch_id(id, title),
            profile:user_id(id, full_name, email, domain, department, employee_id)
          `)
          .in('batch_id', batchIds)
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('training_sessions')
          .select(`
            *,
            batch:batch_id(id, title, domain, status),
            trainer:trainer_id(id, full_name, email)
          `)
          .in('batch_id', batchIds)
          .order('session_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('training_notifications')
          .select(`
            *,
            batch:batch_id(id, title),
            session:session_id(id, title, session_date),
            recipient:recipient_user_id(id, full_name, email)
          `)
          .in('batch_id', batchIds)
          .order('created_at', { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('training_feedback')
          .select(`
            *,
            batch:batch_id(id, title),
            session:session_id(id, title, session_date),
            trainee:user_id(id, full_name, email)
          `)
          .in('batch_id', batchIds)
          .order('created_at', { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('quizzes')
          .select('id, title, topic, difficulty, batch_id, is_active')
          .in('batch_id', batchIds)
      : Promise.resolve({ data: [] }),
  ])

  const members = membersRes.data || []
  const sessions = sessionsRes.data || []
  const notifications = notificationsRes.data || []
  const feedback = feedbackRes.data || []
  const quizzes = quizzesRes.data || []
  const sessionIds = sessions.map((session: any) => session.id)
  const attendanceRes = sessionIds.length
    ? await admin
        .from('session_attendance')
        .select(`
          *,
          session:session_id(id, title, session_date, batch_id),
          profile:user_id(id, full_name, email)
        `)
        .in('session_id', sessionIds)
    : { data: [] }
  const attendance = attendanceRes.data || []

  const totalAttendance = attendance.length
  const positiveAttendance = attendance.filter((entry: any) => entry.status === 'present' || entry.status === 'late').length
  const attendanceRate = totalAttendance > 0 ? Math.round((positiveAttendance / totalAttendance) * 100) : 0
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const now = new Date()
  const attendanceDueToday = sessions.filter((session: any) => {
    if (!session.attendance_required || session.status === 'cancelled') return false
    const sessionDate = new Date(session.session_date)
    if (sessionDate.toISOString().slice(0, 10) !== todayKey) return false
    if (now < attendanceCutoffForTime(sessionDate, governanceSettings.attendanceCutoffTime)) return false
    const records = attendance.filter((entry: any) => entry.session_id === session.id)
    return records.length === 0 || records.every((entry: any) => entry.status === 'absent' && !entry.check_in_time)
  }).length

  const sessionsByBatch = new Map<string, any[]>()
  for (const session of sessions) {
    const items = sessionsByBatch.get(session.batch_id) || []
    items.push(session)
    sessionsByBatch.set(session.batch_id, items)
  }

  const attendanceBySessionUser = new Map<string, any>()
  for (const entry of attendance) {
    attendanceBySessionUser.set(`${entry.session_id}:${entry.user_id}`, entry)
  }

  let absenceAlerts = 0
  for (const member of members) {
    const batchSessions = (sessionsByBatch.get(member.batch_id) || [])
      .filter((session: any) => session.attendance_required && session.status !== 'cancelled')
      .sort((a: any, b: any) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
      .slice(0, governanceSettings.absenceAlertDays)
    if (batchSessions.length < governanceSettings.absenceAlertDays) continue
    const absentThreeDays = batchSessions.every((session: any) => {
      const entry = attendanceBySessionUser.get(`${session.id}:${member.user_id}`)
      return !entry || entry.status === 'absent'
    })
    if (absentThreeDays) absenceAlerts++
  }

  const summary = {
    totalBatches: batches.length,
    activeBatches: batches.filter((batch: any) => isBatchRunning(batch.status)).length,
    atRiskBatches: batches.filter((batch: any) => batch.status === 'at_risk').length,
    totalCandidates: members.length,
    discontinuedCandidates: members.filter((member: any) => member.enrollment_status === 'discontinued' || member.enrollment_status === 'dropped').length,
    notClearedCandidates: members.filter((member: any) => member.enrollment_status === 'not_cleared').length,
    offeredCandidates: members.filter((member: any) => member.enrollment_status === 'offered').length,
    onboardedCandidates: members.filter((member: any) => member.enrollment_status === 'onboarded' || member.enrollment_status === 'active').length,
    remainingCandidates: members.filter((member: any) => ['invited', 'active', 'onboarded'].includes(member.enrollment_status)).length,
    upcomingSessions: sessions.filter((session: any) => session.status === 'scheduled').length,
    attendanceRate,
    attendanceDueToday,
    absenceAlerts,
    notificationsSent: notifications.filter((item: any) => item.delivery_status === 'sent').length,
    negativeFeedbackCount: feedback.filter((item: any) => item.sentiment === 'negative').length,
  }

  return {
    summary,
    batches,
    sessions,
    trainers,
    employees,
    members,
    attendance,
    notifications,
    feedback,
    quizzes,
    governanceSettings,
  }
}

export async function getTrainingGovernanceSettings() {
  await requireManager()
  const admin = createAdminClient()
  return readGovernanceSettings(admin)
}

export async function updateTrainingGovernanceSettings(formData: FormData): Promise<ApiResponse<boolean>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const cutoff = asRequiredString(formData.get('attendance_cutoff_time'), DEFAULT_GOVERNANCE_SETTINGS.attendanceCutoffTime)
  const absenceDays = Math.max(1, Number(asRequiredString(formData.get('absence_alert_days'), String(DEFAULT_GOVERNANCE_SETTINGS.absenceAlertDays))) || DEFAULT_GOVERNANCE_SETTINGS.absenceAlertDays)
  const assessmentWeight = Math.max(0, Number(asRequiredString(formData.get('topper_assessment_weight'), String(DEFAULT_GOVERNANCE_SETTINGS.topperAssessmentWeight))) || DEFAULT_GOVERNANCE_SETTINGS.topperAssessmentWeight)
  const projectWeight = Math.max(0, Number(asRequiredString(formData.get('topper_project_weight'), String(DEFAULT_GOVERNANCE_SETTINGS.topperProjectWeight))) || DEFAULT_GOVERNANCE_SETTINGS.topperProjectWeight)
  const minAttendance = Math.max(0, Number(asRequiredString(formData.get('topper_min_attendance'), String(DEFAULT_GOVERNANCE_SETTINGS.topperMinAttendance))) || DEFAULT_GOVERNANCE_SETTINGS.topperMinAttendance)
  const feedbackDays = Math.max(1, Number(asRequiredString(formData.get('feedback_window_days'), String(DEFAULT_GOVERNANCE_SETTINGS.feedbackWindowDays))) || DEFAULT_GOVERNANCE_SETTINGS.feedbackWindowDays)

  const rows = [
    { key: 'attendance_cutoff_time', value: cutoff, updated_by: userId, updated_at: new Date().toISOString() },
    { key: 'absence_alert_days', value: absenceDays, updated_by: userId, updated_at: new Date().toISOString() },
    { key: 'topper_assessment_weight', value: assessmentWeight, updated_by: userId, updated_at: new Date().toISOString() },
    { key: 'topper_project_weight', value: projectWeight, updated_by: userId, updated_at: new Date().toISOString() },
    { key: 'topper_min_attendance', value: minAttendance, updated_by: userId, updated_at: new Date().toISOString() },
    { key: 'feedback_window_days', value: feedbackDays, updated_by: userId, updated_at: new Date().toISOString() },
  ]

  const { error } = await admin.from('training_system_settings').upsert(rows, { onConflict: 'key' })
  if (error) return { error: error.message }

  revalidatePath('/manager/settings')
  revalidatePath('/manager/operations')
  return { data: true }
}

export async function getEmployeeTrainingData() {
  const { userId } = await requireEmployee()
  const admin = createAdminClient()

  const { data: memberships } = await admin
    .from('batch_members')
    .select(`
      *,
      batch:batch_id(*,
        trainer:trainer_id(id, full_name, email),
        coordinator:coordinator_id(id, full_name, email)
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })

  const batchIds = (memberships || []).map((membership: any) => membership.batch_id)

  const [sessionsRes, attendanceRes, notificationsRes, feedbackRes, quizzesRes] = await Promise.all([
    batchIds.length
      ? admin
          .from('training_sessions')
          .select(`
            *,
            batch:batch_id(id, title, domain, status),
            trainer:trainer_id(id, full_name, email)
          `)
          .in('batch_id', batchIds)
          .order('session_date', { ascending: true })
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('session_attendance')
          .select(`
            *,
            session:session_id(id, title, session_date, batch_id)
          `)
          .eq('user_id', userId)
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('training_notifications')
          .select(`
            *,
            batch:batch_id(id, title),
            session:session_id(id, title, session_date)
          `)
          .or(`recipient_user_id.eq.${userId},batch_id.in.(${batchIds.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('training_feedback')
          .select(`
            *,
            batch:batch_id(id, title),
            session:session_id(id, title, session_date)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    batchIds.length
      ? admin
          .from('quizzes')
          .select('id, title, topic, difficulty, batch_id, is_active')
          .in('batch_id', batchIds)
          .eq('is_active', true)
      : Promise.resolve({ data: [] }),
  ])

  const sessions = sessionsRes.data || []
  const attendance = attendanceRes.data || []
  const notifications = notificationsRes.data || []
  const feedback = feedbackRes.data || []
  const quizzes = quizzesRes.data || []

  const nextSession = sessions.find((session: any) => session.status === 'scheduled')
  const attendanceRate = attendance.length
    ? Math.round((attendance.filter((entry: any) => entry.status === 'present' || entry.status === 'late').length / attendance.length) * 100)
    : 0

  return {
    memberships: memberships || [],
    sessions,
    nextSession,
    attendance,
    attendanceRate,
    notifications,
    feedback,
    quizzes,
  }
}

export async function createTrainingBatch(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const title = asRequiredString(formData.get('title'))
  const description = asOptionalString(formData.get('description'))
  const domain = asOptionalString(formData.get('domain'))
  const cadence = asOptionalString(formData.get('cadence'))
  const capacity = asOptionalString(formData.get('capacity'))
  const priority = asOptionalString(formData.get('priority'))
  const supportModel = asOptionalString(formData.get('support_model'))
  const timezone = asOptionalString(formData.get('timezone'))
  const status = normalizeBatchStatus(asRequiredString(formData.get('status'), 'planned') || 'planned')
  const startDate = asOptionalString(formData.get('start_date'))
  const endDate = asOptionalString(formData.get('end_date'))
  const trainerId = asOptionalString(formData.get('trainer_id'))
  const employeeIds = parseIds(formData.getAll('employee_ids'))
  const quizIds = parseIds(formData.getAll('quiz_ids'))

  if (!title) {
    return { error: 'Batch title is required.' }
  }

  const customDetails = [
    cadence ? `Cadence: ${cadence}` : null,
    capacity ? `Capacity: ${capacity}` : null,
    priority ? `Priority: ${priority}` : null,
    supportModel ? `Support model: ${supportModel}` : null,
    timezone ? `Timezone: ${timezone}` : null,
  ].filter(Boolean)

  const batchDescription = [description, customDetails.length ? customDetails.join(' | ') : null]
    .filter(Boolean)
    .join('\n\n')

  const { data: batch, error } = await admin
    .from('training_batches')
    .insert({
      title,
      description: batchDescription || null,
      domain,
      status,
      start_date: startDate,
      end_date: endDate,
      trainer_id: trainerId,
      coordinator_id: userId,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error || !batch) {
    return { error: error?.message || 'Unable to create training batch.' }
  }

  if (employeeIds.length > 0) {
    const memberRows = employeeIds.map((employeeId) => ({
      batch_id: batch.id,
      user_id: employeeId,
      enrollment_status: 'active',
      support_status: 'on_track',
    }))

    await admin.from('batch_members').upsert(memberRows, { onConflict: 'batch_id,user_id' })
  }

  if (quizIds.length > 0) {
    await admin
      .from('quizzes')
      .update({ batch_id: batch.id })
      .in('id', quizIds)
      .eq('created_by', userId)
  }

  await admin.from('training_notifications').insert({
    batch_id: batch.id,
    title: `Batch created: ${title}`,
    message: `A new training batch has been created with ${employeeIds.length} learner(s) and ${quizIds.length} linked assessment(s).`,
    audience: 'coordinators',
    channel: 'in_app',
    delivery_status: 'sent',
    sent_at: new Date().toISOString(),
    created_by: userId,
  })

  revalidatePath('/manager')
  revalidatePath('/manager/operations')
  revalidatePath('/manager/quizzes')
  revalidatePath('/employee')
  revalidatePath('/employee/training')

  return { data: { id: batch.id } }
}

export async function updateTrainingBatchStatus(formData: FormData): Promise<ApiResponse<boolean>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const batchId = asRequiredString(formData.get('batch_id'))
  const status = normalizeBatchStatus(asRequiredString(formData.get('status'), 'planned') || 'planned')

  if (!batchId) {
    return { error: 'Batch is required.' }
  }

  const { data: currentBatch } = await admin
    .from('training_batches')
    .select('id, title, status')
    .eq('id', batchId)
    .single()

  const { error } = await admin
    .from('training_batches')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', batchId)
    .or(`created_by.eq.${userId},coordinator_id.eq.${userId}`)

  if (error) {
    return { error: error.message }
  }

  await admin.from('training_notifications').insert({
    batch_id: batchId,
    title: `Batch status changed: ${currentBatch?.title || 'Training batch'}`,
    message: `Lifecycle moved from ${(currentBatch?.status || 'planned').replace('_', ' ')} to ${status}.`,
    audience: 'coordinators',
    channel: 'in_app',
    delivery_status: 'sent',
    sent_at: new Date().toISOString(),
    created_by: userId,
  })

  revalidatePath('/manager')
  revalidatePath('/manager/operations')
  revalidatePath('/employee')
  revalidatePath('/employee/training')
  return { data: true }
}

export async function createTrainingSession(formData: FormData): Promise<ApiResponse<{ id: string }>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const batchId = asRequiredString(formData.get('batch_id'))
  const title = asRequiredString(formData.get('title'))
  const agenda = asOptionalString(formData.get('agenda'))
  const trainerId = asOptionalString(formData.get('trainer_id'))
  const sessionDate = asRequiredString(formData.get('session_date'))
  const mode = (asRequiredString(formData.get('mode'), 'virtual') || 'virtual') as SessionMode
  const status = (asRequiredString(formData.get('status'), 'scheduled') || 'scheduled') as SessionStatus
  const attendanceRequired = asBoolean(formData.get('attendance_required'))

  if (!batchId || !title || !sessionDate) {
    return { error: 'Batch, title, and session date are required.' }
  }

  const { data: session, error } = await admin
    .from('training_sessions')
    .insert({
      batch_id: batchId,
      trainer_id: trainerId,
      title,
      agenda,
      session_date: sessionDate,
      mode,
      status,
      attendance_required: attendanceRequired,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error || !session) {
    return { error: error?.message || 'Unable to create session.' }
  }

  const { data: members } = await admin
    .from('batch_members')
    .select('user_id')
    .eq('batch_id', batchId)

  if (members && members.length > 0) {
    const attendanceRows = members.map((member) => ({
      session_id: session.id,
      user_id: member.user_id,
      status: 'absent',
      updated_by: userId,
    }))

    await admin.from('session_attendance').upsert(attendanceRows, { onConflict: 'session_id,user_id' })
  }

  await admin.from('training_notifications').insert({
    batch_id: batchId,
    session_id: session.id,
    title: `New session scheduled: ${title}`,
    message: `A ${mode} session has been scheduled for ${new Date(sessionDate).toLocaleString()}.`,
    audience: 'batch',
    channel: 'in_app',
    delivery_status: 'sent',
    sent_at: new Date().toISOString(),
    created_by: userId,
  })

  revalidatePath('/manager')
  revalidatePath('/manager/operations')
  revalidatePath('/employee')
  revalidatePath('/employee/training')

  return { data: { id: session.id } }
}

export async function updateAttendanceStatus(formData: FormData): Promise<ApiResponse<boolean>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const sessionId = asRequiredString(formData.get('session_id'))
  const userTargetId = asRequiredString(formData.get('user_id'))
  const status = asRequiredString(formData.get('status')) as AttendanceStatus
  const notes = asOptionalString(formData.get('notes'))

  if (!sessionId || !userTargetId || !status) {
    return { error: 'Session, learner, and status are required.' }
  }

  const payload = {
    session_id: sessionId,
    user_id: userTargetId,
    status,
    notes,
    updated_by: userId,
    check_in_time: status === 'present' || status === 'late' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin
    .from('session_attendance')
    .upsert(payload, { onConflict: 'session_id,user_id' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/manager/operations')
  revalidatePath('/employee/training')
  return { data: true }
}

export async function createTrainingNotification(formData: FormData): Promise<ApiResponse<boolean>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const batchId = asOptionalString(formData.get('batch_id'))
  const sessionId = asOptionalString(formData.get('session_id'))
  const recipientUserId = asOptionalString(formData.get('recipient_user_id'))
  const title = asRequiredString(formData.get('title'))
  const message = asRequiredString(formData.get('message'))
  const audience = (asRequiredString(formData.get('audience'), 'batch') || 'batch') as NotificationAudience
  const channel = (asRequiredString(formData.get('channel'), 'in_app') || 'in_app') as NotificationChannel
  const scheduledFor = asOptionalString(formData.get('scheduled_for'))

  if (!title || !message) {
    return { error: 'Notification title and message are required.' }
  }

  const deliveryStatus = scheduledFor ? 'scheduled' : 'sent'
  const { error } = await admin.from('training_notifications').insert({
    batch_id: batchId,
    session_id: sessionId,
    recipient_user_id: recipientUserId,
    title,
    message,
    audience,
    channel,
    scheduled_for: scheduledFor,
    delivery_status: deliveryStatus,
    sent_at: deliveryStatus === 'sent' ? new Date().toISOString() : null,
    created_by: userId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/manager')
  revalidatePath('/manager/operations')
  revalidatePath('/employee')
  revalidatePath('/employee/training')
  return { data: true }
}

export async function createFeedbackWindow(formData: FormData): Promise<ApiResponse<boolean>> {
  const { userId } = await requireManager()
  const admin = createAdminClient()

  const batchId = asRequiredString(formData.get('batch_id'))
  const sessionId = asOptionalString(formData.get('session_id'))
  const title = asRequiredString(formData.get('title'), 'Training feedback request')
  const closesAt = asRequiredString(formData.get('closes_at'))

  if (!batchId || !closesAt) {
    return { error: 'Batch and closure date are required.' }
  }

  const { data: window, error } = await admin
    .from('training_feedback_windows')
    .insert({
      batch_id: batchId,
      session_id: sessionId,
      title,
      closes_at: closesAt,
      status: 'open',
      created_by: userId,
    })
    .select('id')
    .single()

  if (error || !window) {
    return { error: error?.message || 'Unable to open feedback window.' }
  }

  const { data: notification } = await admin
    .from('training_notifications')
    .insert({
      batch_id: batchId,
      session_id: sessionId,
      title: `Feedback open: ${title}`,
      message: `Feedback collection is open until ${new Date(closesAt).toLocaleString()}.`,
      audience: 'batch',
      channel: 'email',
      delivery_status: 'sent',
      sent_at: new Date().toISOString(),
      created_by: userId,
    })
    .select('id')
    .single()

  const { data: members } = await admin
    .from('batch_members')
    .select('profile:user_id(email)')
    .eq('batch_id', batchId)

  if (notification?.id && members?.length) {
    await admin.from('training_notification_dispatch_log').insert(
      members.map((member: any) => ({
        notification_id: notification.id,
        recipient_email: member.profile?.email || null,
        channel: 'email',
        provider_status: 'logged',
        provider_message: 'Email dispatch logged for demo/governance. Connect SMTP provider for live sending.',
      }))
    )
  }

  revalidatePath('/manager/operations')
  revalidatePath('/employee/training')
  return { data: true }
}

export async function submitTrainingFeedback(formData: FormData): Promise<ApiResponse<boolean>> {
  const { userId } = await requireEmployee()
  const admin = createAdminClient()

  const batchId = asOptionalString(formData.get('batch_id'))
  const sessionId = asOptionalString(formData.get('session_id'))
  const rating = Number(asRequiredString(formData.get('rating'), '0'))
  const feedbackText = asRequiredString(formData.get('feedback_text'))
  const actionItem = asOptionalString(formData.get('action_item'))

  if (!feedbackText || !rating) {
    return { error: 'Rating and feedback are required.' }
  }

  let sentiment: FeedbackSentiment = 'neutral'
  if (rating >= 4) sentiment = 'positive'
  if (rating <= 2) sentiment = 'negative'

  const { error } = await admin.from('training_feedback').insert({
    batch_id: batchId,
    session_id: sessionId,
    user_id: userId,
    submitted_by: userId,
    rating,
    sentiment,
    feedback_text: feedbackText,
    action_item: actionItem,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/manager')
  revalidatePath('/manager/operations')
  revalidatePath('/employee/training')
  return { data: true }
}
