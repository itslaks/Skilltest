import { createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

export async function canAccessTrainingBatch(batchId: string, userId: string, role: UserRole) {
  const admin = createAdminClient()
  const { data: batch } = await admin
    .from('training_batches')
    .select('id, created_by, coordinator_id, trainer_id')
    .eq('id', batchId)
    .maybeSingle()

  if (!batch) return false
  if (role === 'admin') return true
  if (batch.created_by === userId || batch.coordinator_id === userId || batch.trainer_id === userId) return true

  const { data: assignment } = await admin
    .from('training_batch_trainers')
    .select('id')
    .eq('batch_id', batchId)
    .eq('trainer_id', userId)
    .maybeSingle()

  return Boolean(assignment)
}

export async function canTrainerAccessBatch(batchId: string, userId: string) {
  return canAccessTrainingBatch(batchId, userId, 'trainer')
}
