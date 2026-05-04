'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type BatchMetrics = {
  id: string
  name: string
  attendance: number
  assessment: number
  clearance: number
  learners: number
}

export function BatchComparisonChart({ data }: { data: BatchMetrics[] }) {
  if (!data || data.length === 0) return null
  const scored = data.map((batch) => ({
    ...batch,
    executionScore: Math.round((batch.attendance * 0.35) + (batch.assessment * 0.35) + (batch.clearance * 0.3)),
  }))
  const strongest = [...scored].sort((a, b) => b.executionScore - a.executionScore)[0]
  const needsAction = [...scored].sort((a, b) => a.executionScore - b.executionScore)[0]
  const averageClearance = Math.round(scored.reduce((sum, batch) => sum + batch.clearance, 0) / scored.length)

  return (
    <Card className="border-zinc-200 shadow-sm spotlight-card">
      <CardHeader>
        <CardTitle>Batch Comparison & DNA</CardTitle>
        <CardDescription>Side-by-side attendance, assessment average, and clearance strength across active batches.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <Signal label="Strongest batch" value={strongest.name} detail={`${strongest.executionScore}% execution score`} tone="bg-emerald-50 text-emerald-900 border-emerald-100" />
          <Signal label="Needs action" value={needsAction.name} detail={`${needsAction.executionScore}% execution score`} tone="bg-amber-50 text-amber-900 border-amber-100" />
          <Signal label="Avg clearance" value={`${averageClearance}%`} detail={`${scored.length} batch(es) compared`} tone="bg-blue-50 text-blue-900 border-blue-100" />
        </div>
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="bar">Performance Bar Chart</TabsTrigger>
            <TabsTrigger value="radar">Batch DNA (Radar)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="attendance" name="Attendance %" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assessment" name="Assessment Avg %" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clearance" name="Clearance %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="radar" className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" maxHeight={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid opacity={0.3} />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Attendance %" dataKey="attendance" stroke="#2563eb" fill="#2563eb" fillOpacity={0.22} />
                <Radar name="Assessment Avg %" dataKey="assessment" stroke="#059669" fill="#059669" fillOpacity={0.22} />
                <Radar name="Clearance %" dataKey="clearance" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.22} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function Signal({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-2 truncate text-lg font-semibold" title={value}>{value}</p>
      <p className="mt-1 text-sm opacity-75">{detail}</p>
    </div>
  )
}
