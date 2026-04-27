'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet, Upload, CheckCircle2, XCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

type BatchOption = { id: string; title: string }

export function BatchCandidateImporter({ batches }: { batches: BatchOption[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id || '')
  const [rows, setRows] = useState<Record<string, any>[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function readFile(file: File) {
    setError('')
    setMessage('')
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const parsed = XLSX.utils.sheet_to_json<Record<string, any>>(sheet)
        if (!parsed.length) {
          setError('The candidate assignment file is empty.')
          return
        }
        setRows(parsed)
      } catch {
        setError('Could not read this file. Use Excel or CSV.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function upload() {
    if (!batchId || !rows?.length) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/training/batch-candidate-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, records: rows, fileName }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Candidate assignment failed.')
      setMessage(`${payload.successfulRecords}/${payload.totalRecords} candidate rows assigned. ${payload.failedRecords} row(s) need review.`)
      setRows(null)
    } catch (err: any) {
      setError(err.message || 'Candidate assignment failed.')
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
            Batch candidate upload
          </div>
          <p className="mt-1 text-sm text-zinc-500">Map candidate master rows into a batch without manual selection.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <a href="/api/training/batch-candidate-template">Download template</a>
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Target batch</span>
          <select value={batchId} onChange={(event) => setBatchId(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3">
            {batches.length === 0 ? <option value="">Create a batch first</option> : batches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.title}</option>
            ))}
          </select>
        </label>
        <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-100 lg:self-end">
          <Upload className="h-4 w-4" />
          Select file
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])} />
        </label>
      </div>

      {rows ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p><strong>{rows.length}</strong> candidate row(s) ready from {fileName}.</p>
            <Button onClick={upload} disabled={loading || !batchId} className="rounded-full bg-black text-white hover:bg-zinc-800">
              {loading ? 'Assigning...' : 'Assign candidates'}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.keys(rows[0] || {}).slice(0, 6).map((column) => (
              <Badge key={column} variant="outline" className="bg-white">{column}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {message ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</div> : null}
      {error ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><XCircle className="h-4 w-4" />{error}</div> : null}
    </div>
  )
}
