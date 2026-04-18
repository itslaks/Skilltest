import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/lib/rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { 
  ArrowLeft, BarChart3, FileSpreadsheet, MessageSquare, 
  TrendingUp, Users, Trophy, Target 
} from 'lucide-react'
import { AssessmentAnalyzer } from '@/components/manager/assessment-analyzer'
import { DownloadReportButton } from '@/components/manager/download-report-button'
import { QuickDeleteButton } from '@/components/manager/quick-delete-button'

export default async function AnalyticsPage() {
  const { userId } = await requireManager()

  const supabase = await createClient()

  // Get quizzes for selection
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title, topic, difficulty, is_active')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  // Get import history
  const { data: importHistory } = await supabase
    .from('assessment_imports')
    .select('*')
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get overall stats
  const { data: overallStats } = await supabase
    .from('quiz_attempts')
    .select('score, correct_answers, total_questions, time_taken_seconds, quizzes!inner(created_by)')
    .eq('quizzes.created_by', userId)
    .eq('status', 'completed')

  const totalAttempts = overallStats?.length || 0
  const avgScore = totalAttempts > 0
    ? Math.round((overallStats?.reduce((a, b) => a + (b.score || 0), 0) || 0) / totalAttempts)
    : 0
  const totalCorrect = overallStats?.reduce((a, b) => a + (b.correct_answers || 0), 0) || 0
  const totalQuestions = overallStats?.reduce((a, b) => a + (b.total_questions || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-purple-600" />
            Analytics & AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload assessment data, analyze results, and get AI-powered insights
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalAttempts}</p>
              <p className="text-xs text-blue-600/70 font-medium">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{avgScore}%</p>
              <p className="text-xs text-green-600/70 font-medium">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500 rounded-xl">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{totalCorrect}/{totalQuestions}</p>
              <p className="text-xs text-purple-600/70 font-medium">Correct Answers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-xl">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{importHistory?.length || 0}</p>
              <p className="text-xs text-orange-600/70 font-medium">Data Imports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Analyzer */}
      <AssessmentAnalyzer />

      {/* Quiz Shortcuts */}
      {quizzes && quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Per-Quiz Report Shortcuts
            </CardTitle>
            <CardDescription>Export results or remove a quiz without leaving analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/50 rounded-xl border border-border/60 overflow-hidden">
              {quizzes.map((quiz: any) => (
                <div key={quiz.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {quiz.topic} / {quiz.difficulty} / {quiz.is_active ? 'Active' : 'Draft'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs" asChild>
                      <Link href={`/manager/quizzes/${quiz.id}`}>Open</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs" asChild>
                      <Link href={`/manager/quizzes/${quiz.id}/edit`}>Edit</Link>
                    </Button>
                    <DownloadReportButton quizId={quiz.id} quizTitle={quiz.title} />
                    <QuickDeleteButton quizId={quiz.id} quizTitle={quiz.title} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      {importHistory && importHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Recent Imports
            </CardTitle>
            <CardDescription>Your assessment data import history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importHistory.map((imp: any) => (
                <div key={imp.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{imp.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(imp.created_at).toLocaleDateString()} • {imp.total_records} records
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      imp.status === 'completed' ? 'bg-green-100 text-green-700' :
                      imp.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {imp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
