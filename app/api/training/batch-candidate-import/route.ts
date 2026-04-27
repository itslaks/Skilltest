import { createAdminClient } from '@/lib/supabase/server'
import { requireManagerForApi } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'

const VALID_ENROLLMENT = new Set(['invited', 'active', 'completed', 'dropped', 'discontinued', 'not_cleared', 'offered', 'onboarded'])
const VALID_SUPPORT = new Set(['on_track', 'needs_support', 'critical'])

export async function POST(request: NextRequest) {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth
  const { userId } = auth

  const { batchId, records, fileName } = await request.json()
  if (!batchId || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: 'Batch and candidate rows are required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: batch, error: batchError } = await admin
    .from('training_batches')
    .select('id, title')
    .eq('id', batchId)
    .single()

  if (batchError || !batch) {
    return NextResponse.json({ error: batchError?.message || 'Batch not found.' }, { status: 404 })
  }

  const emails = records.map((row: any) => normalize(row.Email || row.email || row.Candidate_Email_Address)).filter(Boolean)
  const employeeIds = records.map((row: any) => normalize(row.Employee_ID || row.employee_id || row.Candidate_ID)).filter(Boolean)
  const filters = [
    emails.length ? `email.in.(${emails.map((email: string) => `"${email}"`).join(',')})` : '',
    employeeIds.length ? `employee_id.in.(${employeeIds.map((id: string) => `"${id}"`).join(',')})` : '',
  ].filter(Boolean)

  const query = admin.from('profiles').select('id, email, employee_id')
  const { data: profiles } = filters.length ? await query.or(filters.join(',')) : { data: [] }
  const byEmail = new Map((profiles || []).map((profile: any) => [normalize(profile.email), profile]))
  const byEmployeeId = new Map((profiles || []).map((profile: any) => [normalize(profile.employee_id), profile]))

  const errors: any[] = []
  const rows: any[] = []

  records.forEach((record: any, index: number) => {
    const email = normalize(record.Email || record.email || record.Candidate_Email_Address)
    const employeeId = normalize(record.Employee_ID || record.employee_id || record.Candidate_ID)
    const profile = byEmail.get(email) || byEmployeeId.get(employeeId)
    const enrollment = normalize(record.Enrollment_Status || record.enrollment_status || 'active')
    const support = normalize(record.Support_Status || record.support_status || 'on_track')

    if (!profile) {
      errors.push({ row: index + 1, error: 'Candidate not found. Import the candidate master first.', email, employeeId })
      return
    }
    if (!VALID_ENROLLMENT.has(enrollment)) {
      errors.push({ row: index + 1, error: 'Invalid enrollment status.', email, employeeId })
      return
    }
    if (!VALID_SUPPORT.has(support)) {
      errors.push({ row: index + 1, error: 'Invalid support status.', email, employeeId })
      return
    }

    rows.push({
      batch_id: batchId,
      user_id: profile.id,
      enrollment_status: enrollment,
      support_status: support,
    })
  })

  if (rows.length) {
    const { error } = await admin.from('batch_members').upsert(rows, { onConflict: 'batch_id,user_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await admin.from('training_notifications').insert({
    batch_id: batchId,
    title: `Candidate upload processed: ${batch.title}`,
    message: `${rows.length} candidate(s) assigned from ${fileName || 'candidate upload'}. ${errors.length} row(s) need review.`,
    audience: 'coordinators',
    channel: 'email',
    delivery_status: 'sent',
    sent_at: new Date().toISOString(),
    created_by: userId,
  })

  return NextResponse.json({
    success: true,
    totalRecords: records.length,
    successfulRecords: rows.length,
    failedRecords: errors.length,
    errors,
  })
}

function normalize(value: unknown) {
  return value === null || value === undefined ? '' : String(value).trim().toLowerCase()
}
