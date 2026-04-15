import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify manager role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'manager' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Use admin client to bypass RLS for comprehensive reports
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (e) {
      console.warn('Service role key not available, using regular client')
      adminClient = supabase
    }

    // Get all quizzes
    const { data: quizzes } = await adminClient
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })

    // Get all attempts with user info
    const { data: attempts } = await adminClient
      .from('quiz_attempts')
      .select(`
        *,
        profiles:user_id(full_name, email, employee_id, department),
        quizzes:quiz_id(title)
      `)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })

    // Get all employees
    const { data: employees } = await adminClient
      .from('profiles')
      .select('*')
      .eq('role', 'employee')

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new()

    // Sheet 1: Summary
    const summaryData = [
      { Metric: 'Total Quizzes', Value: quizzes?.length || 0 },
      { Metric: 'Total Attempts', Value: attempts?.length || 0 },
      { Metric: 'Total Employees', Value: employees?.length || 0 },
      { Metric: 'Average Score', Value: attempts?.length ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length) + '%' : 'N/A' },
      { Metric: 'Report Generated', Value: new Date().toLocaleString() },
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // Sheet 2: Quiz Performance
    const quizPerformance = (quizzes || []).map((quiz: any) => {
      const quizAttempts = (attempts || []).filter((a: any) => a.quiz_id === quiz.id)
      const avgScore = quizAttempts.length > 0 
        ? Math.round(quizAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / quizAttempts.length)
        : 0
      const passRate = quizAttempts.length > 0
        ? Math.round(quizAttempts.filter((a: any) => a.score >= (quiz.passing_score || 70)).length / quizAttempts.length * 100)
        : 0
      return {
        'Quiz Title': quiz.title,
        'Total Attempts': quizAttempts.length,
        'Average Score (%)': avgScore,
        'Pass Rate (%)': passRate,
        'Status': quiz.is_active ? 'Active' : 'Inactive',
        'Created': new Date(quiz.created_at).toLocaleDateString(),
      }
    })
    const wsQuizPerf = XLSX.utils.json_to_sheet(quizPerformance)
    wsQuizPerf['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 10 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, wsQuizPerf, 'Quiz Performance')

    // Sheet 3: All Results
    const allResults = (attempts || []).map((a: any, i: number) => ({
      'S.No': i + 1,
      'Employee Name': a.profiles?.full_name || 'Unknown',
      'Email': a.profiles?.email || '',
      'Employee ID': a.profiles?.employee_id || 'N/A',
      'Department': a.profiles?.department || 'N/A',
      'Quiz': a.quizzes?.title || 'Unknown Quiz',
      'Score (%)': a.score || 0,
      'Time Taken': formatTime(a.time_taken_seconds || 0),
      'Completed At': a.completed_at ? new Date(a.completed_at).toLocaleString() : 'N/A',
    }))
    const wsResults = XLSX.utils.json_to_sheet(allResults)
    wsResults['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsResults, 'All Results')

    // Sheet 4: Employee Stats
    const employeeStats = (employees || []).map((emp: any) => {
      const empAttempts = (attempts || []).filter((a: any) => a.user_id === emp.id)
      const avgScore = empAttempts.length > 0
        ? Math.round(empAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / empAttempts.length)
        : 0
      return {
        'Name': emp.full_name || 'Unknown',
        'Email': emp.email,
        'Employee ID': emp.employee_id || 'N/A',
        'Department': emp.department || 'N/A',
        'Quizzes Taken': empAttempts.length,
        'Average Score (%)': avgScore,
      }
    })
    const wsEmployees = XLSX.utils.json_to_sheet(employeeStats)
    wsEmployees['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, wsEmployees, 'Employee Stats')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const filename = `skilltest-report-${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e: any) {
    console.error('Report download error:', e)
    return NextResponse.json({ error: e.message || 'Failed to generate report' }, { status: 500 })
  }
}

function formatTime(seconds: number): string {
  if (!seconds) return 'N/A'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}
