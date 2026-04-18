import { NextResponse } from 'next/server'
import { requireManagerForApi } from '@/lib/rbac'
import { createAdminClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth

  const supabase = createAdminClient()
  const { data: employees, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, employee_id, department, domain, created_at, user_stats(total_points, tests_completed, average_score, current_streak)')
    .eq('role', 'employee')
    .order('full_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (employees || []).map((employee: any, index: number) => {
    const stats = employee.user_stats?.[0]
    return {
      'S.No': index + 1,
      'Employee Name': employee.full_name || 'Unnamed',
      'Email': employee.email,
      'Employee ID': employee.employee_id || 'N/A',
      'Department': employee.department || 'N/A',
      'Domain': employee.domain || 'N/A',
      'Total Points': stats?.total_points || 0,
      'Quizzes Completed': stats?.tests_completed || 0,
      'Average Score (%)': stats?.average_score || 0,
      'Current Streak': stats?.current_streak || 0,
      'Joined On': employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A',
    }
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Message: 'No employees found' }])
  ws['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Employees')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="employees-report.xlsx"',
    },
  })
}
