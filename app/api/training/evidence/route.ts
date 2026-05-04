import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireTrainingStaffForApi } from '@/lib/rbac'
import { canAccessTrainingBatch } from '@/lib/training-access'

export async function GET(request: NextRequest) {
  const auth = await requireTrainingStaffForApi()
  if (auth instanceof NextResponse) return auth
  const { userId, role } = auth

  const storagePath = request.nextUrl.searchParams.get('path') || ''
  const [bucket, folder, batchId] = storagePath.split('/')

  if (bucket !== 'training-evidence' || !folder || !batchId) {
    return NextResponse.json({ error: 'Invalid evidence path.' }, { status: 400 })
  }

  if (!(await canAccessTrainingBatch(batchId, userId, role))) {
    return NextResponse.json({ error: 'Forbidden: batch access denied' }, { status: 403 })
  }

  const objectPath = storagePath.split('/').slice(1).join('/')
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(objectPath, 300)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || 'Evidence file not found.' }, { status: 404 })
  }

  return NextResponse.redirect(data.signedUrl)
}
