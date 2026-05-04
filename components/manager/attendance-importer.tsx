'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

type SessionOption = {
  id: string
  title: string
  batchTitle: string
  sessionDate: string
}

type AttendanceImporterProps = {
  sessions: SessionOption[]
}

type UploadResult = {
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  errors?: Array<{ row: number; error: string; email?: string; employeeId?: string }>
}

export function AttendanceImporter({ sessions }: AttendanceImporterProps) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id || '')
  const [preview, setPreview] = useState<Record<string, any>[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function readFile(file: File) {
    setError('')
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)
        if (!rows.length) {
          setError('The attendance file is empty.')
          return
        }
        setPreview(rows)
      } catch {
        setError('Could not read this file. Use the attendance template or a valid Excel/CSV file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function upload() {
    if (!sessionId || !preview?.length) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/training/attendance-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, records: preview, fileName }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Attendance upload failed.')
      setResult(payload)
      setPreview(null)
    } catch (err: any) {
      setError(err.message || 'Attendance upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <FileSpreadsheet className="h-4 w-4" />
            Excel attendance upload
          </div>
          <p className="mt-1 text-sm text-zinc-500">Upload one sheet with Email or Employee_ID and Status.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <a href="/api/training/attendance-template">Download template</a>
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Target session</span>
          <select value={sessionId} onChange={(event) => setSessionId(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3">
            {sessions.length === 0 ? (
              <option value="">Create a session first</option>
            ) : sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.batchTitle} - {session.title} - {new Date(session.sessionDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-100 lg:self-end">
          <Upload className="h-4 w-4" />
          Select file
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} />
        </label>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {preview ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p><strong>{preview.length}</strong> row(s) ready from {fileName}.</p>
            <Button onClick={upload} disabled={loading || !sessionId} className="rounded-full bg-black text-white hover:bg-zinc-800">
              {loading ? 'Uploading...' : 'Upload attendance'}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(preview[0] || {}).slice(0, 6).map((column) => (
              <Badge key={column} variant="outline" className="bg-white">{column}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Attendance upload complete
          </div>
          <p className="mt-1">{result.successfulRecords}/{result.totalRecords} rows updated. {result.failedRecords} row(s) need review.</p>
          {result.errors?.length ? (
            <div className="mt-2 space-y-1 text-xs text-rose-700">
              {result.errors.slice(0, 8).map((item) => (
                <p key={item.row}>Row {item.row}: {item.error}{item.email ? ` - ${item.email}` : ''}{item.employeeId ? ` - ${item.employeeId}` : ''}</p>
              ))}
              {result.errors.length > 8 ? <p>{result.errors.length - 8} more row issue(s) are available in the upload log.</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
