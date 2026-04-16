import { getAvailableQuizzes } from '@/lib/actions/employee'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Clock, FileQuestion, CheckCircle2, ArrowRight, Trophy } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-blue-100 text-blue-700',
  hard: 'bg-amber-100 text-amber-700',
  advanced: 'bg-orange-100 text-orange-700',
  hardcore: 'bg-red-100 text-red-700',
}

export default async function EmployeeQuizzesPage() {
  const { data: quizzes } = await getAvailableQuizzes()

  const available = quizzes?.filter((q: any) => !q.attemptStatus) || []
  const inProgress = quizzes?.filter((q: any) => q.attemptStatus === 'in_progress') || []
  const completed = quizzes?.filter((q: any) => q.attemptStatus === 'completed') || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">Browse assessments, track progress, earn points</p>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground bg-muted/60 px-4 py-2 rounded-xl">
          <span className="font-semibold text-green-600">{available.length} available</span>
          {inProgress.length > 0 && <span>• <span className="font-semibold text-yellow-600">{inProgress.length} in progress</span></span>}
          {completed.length > 0 && <span>• <span className="font-semibold text-blue-600">{completed.length} done</span></span>}
        </div>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            In Progress
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((quiz: any) => (
              <QuizCard key={quiz.id} quiz={quiz} status="in_progress" />
            ))}
          </div>
        </section>
      )}

      {/* Available */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Available Quizzes</h2>
        {available.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((quiz: any) => (
              <QuizCard key={quiz.id} quiz={quiz} status="available" />
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <FileQuestion className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No quizzes available</h3>
              <p className="text-muted-foreground">Check back later for new assessments.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completed
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((quiz: any) => (
              <QuizCard key={quiz.id} quiz={quiz} status="completed" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function QuizCard({ quiz, status }: { quiz: any; status: string }) {
  const statusConfig = {
    available: { border: 'border-border hover:border-blue-300 hover:shadow-blue-100', badge: null },
    in_progress: { border: 'border-yellow-300 bg-yellow-50/30 shadow-yellow-100', badge: 'In Progress' },
    completed: { border: 'border-green-200 bg-green-50/20', badge: null },
  }[status] || { border: '', badge: null }

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${statusConfig.border}`}>
      {statusConfig.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">
            {statusConfig.badge}
          </span>
        </div>
      )}
      {status === 'completed' && (
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-base font-bold px-2.5 py-1 rounded-full ${
            (quiz.attemptScore || 0) >= 70 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {quiz.attemptScore}%
          </span>
        </div>
      )}
      <CardContent className="p-5 space-y-4">
        <div className={status === 'in_progress' ? 'mt-5' : ''}>
          <h3 className="font-bold text-base truncate pr-16">{quiz.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{quiz.description || quiz.topic}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColors[quiz.difficulty] || 'bg-gray-100 text-gray-700'}`}>
            {quiz.difficulty}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {quiz.topic}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1.5">
            <FileQuestion className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium">{quiz.questions?.[0]?.count || quiz.question_count}</span> questions
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-orange-500" />
            <span className="font-medium">{quiz.time_limit_minutes}</span> min
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <Button 
            className={`flex-1 font-semibold ${status === 'available' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            variant={status === 'completed' ? 'outline' : 'default'} 
            asChild
          >
            <Link href={status === 'completed' ? `/employee/quizzes/${quiz.id}/results` : `/employee/quizzes/${quiz.id}`}>
              {status === 'completed' ? '📋 View Results' : status === 'in_progress' ? '▶ Continue' : '🚀 Start Quiz'}
            </Link>
          </Button>
          {status === 'completed' && (
            <Button variant="outline" size="icon" asChild title="View Leaderboard" className="border-yellow-200 hover:bg-yellow-50">
              <Link href={`/employee/quizzes/${quiz.id}/leaderboard`}>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
