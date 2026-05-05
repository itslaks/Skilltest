'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, RadioTower } from 'lucide-react'

export function OpsAutoRefresh({ intervalMs = 30000, compact = false }: { intervalMs?: number; compact?: boolean }) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(intervalMs / 1000))
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isPending, startTransition] = useTransition()

  const refreshNow = useCallback(() => {
    setSecondsLeft(Math.ceil(intervalMs / 1000))
    setLastRefresh(new Date())
    startTransition(() => router.refresh())
  }, [intervalMs, router])

  useEffect(() => {
    const id = window.setInterval(refreshNow, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, refreshNow])

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? Math.ceil(intervalMs / 1000) : value - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 ${compact ? '' : 'shadow-sm'}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <RadioTower className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">Live sync active</p>
          <p className="text-xs text-emerald-700">
            Refreshes every {Math.round(intervalMs / 1000)}s. Next refresh in {secondsLeft}s{lastRefresh ? ` - last ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={refreshNow}
        disabled={isPending}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
        Refresh now
      </button>
    </div>
  )
}
