import { requireManagerForApi } from '@/lib/rbac'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const auth = await requireManagerForApi()
  if (auth instanceof NextResponse) return auth

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet([
    {
      Email: 'candidate@company.com',
      Employee_ID: 'EMP001',
      Enrollment_Status: 'active',
      Support_Status: 'on_track',
    },
  ])
  ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 20 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Batch Candidates')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="batch-candidate-assignment-template.xlsx"',
    },
  })
}
