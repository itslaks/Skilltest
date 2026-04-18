import { NextResponse } from 'next/server'
import { requireManagerForApi } from '@/lib/rbac'
import * as XLSX from 'xlsx'

export async function GET() {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth

  const rows = [
    {
      's.no': 1,
      Email: 'employee@company.com',
      name: 'Employee Name',
      domain: 'General',
      employee_id: 'EMP001',
    },
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 8 },
    { wch: 30 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Employees')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="employee-import-template.xlsx"',
    },
  })
}
