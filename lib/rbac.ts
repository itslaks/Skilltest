/**
 * Centralized RBAC (Role-Based Access Control) utility.
 *
 * Single source of truth for all role resolution and permission checks.
 * Always reads from the `profiles` table (DB) as the authoritative source.
 * Falls back to `user_metadata.role` only when the profile row is missing
 * (e.g., first login before the trigger runs).
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/types/database'

export type RBACRole = 'employee' | 'manager' | 'admin'

/**
 * Resolves the current user's role from DB, with metadata fallback.
 * Returns null if not authenticated.
 */
export async function getCurrentUserRole(): Promise<{ userId: string; role: RBACRole } | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // DB role is the source of truth; fallback to user_metadata only if profile missing
  const role = (profile?.role || user.user_metadata?.role || 'employee') as RBACRole

  // If profile exists but role is missing, sync it from metadata
  if (profile && !profile.role && user.user_metadata?.role) {
    await supabase
      .from('profiles')
      .update({ role: user.user_metadata.role })
      .eq('id', user.id)
  }

  return { userId: user.id, role }
}

/**
 * Asserts the current user is authenticated and has one of the allowed roles.
 * Redirects to login or /employee if not.
 * Returns the resolved role on success.
 */
export async function requireRole(...allowedRoles: RBACRole[]): Promise<{ userId: string; role: RBACRole }> {
  const result = await getCurrentUserRole()

  if (!result) {
    redirect('/auth/login')
  }

  if (!allowedRoles.includes(result.role)) {
    // Redirect to their own dashboard, not a 403
    redirect(result.role === 'employee' ? '/employee' : '/manager')
  }

  return result
}

/**
 * Asserts the current user is a manager or admin.
 * Use this in all manager pages/routes.
 */
export async function requireManager(): Promise<{ userId: string; role: RBACRole }> {
  return requireRole('manager', 'admin')
}

/**
 * Asserts the current user is an employee (or higher).
 * Use this in all employee pages/routes.
 */
export async function requireEmployee(): Promise<{ userId: string; role: RBACRole }> {
  return requireRole('employee', 'manager', 'admin')
}

/**
 * Returns true if the role is manager or admin.
 */
export function isManager(role: string | null | undefined): boolean {
  return role === 'manager' || role === 'admin'
}

/**
 * Use in API route handlers (cannot redirect, returns NextResponse on failure).
 * Returns { userId, role } on success, or a 401/403 NextResponse on failure.
 * Usage:
 *   const auth = await requireManagerForApi()
 *   if (auth instanceof NextResponse) return auth
 */
export async function requireManagerForApi(): Promise<{ userId: string; role: RBACRole } | import('next/server').NextResponse> {
  const { NextResponse } = await import('next/server')
  const result = await getCurrentUserRole()
  if (!result) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  if (!isManager(result.role)) {
    return NextResponse.json({ error: 'Forbidden: manager role required' }, { status: 403 })
  }
  return result
}
