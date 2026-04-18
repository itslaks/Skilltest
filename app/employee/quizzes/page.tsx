import { getAvailableQuizzes } from '@/lib/actions/employee'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, FileQuestion, CheckCircle2, Play, Trophy } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Browse assessments, track progress, earn points</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="h-9 rounded-xl text-xs font-semibold" asChild>
            <Link href="/employee/leaderboard">
              <Trophy className="mr-1.5 h-3.5 w-3.5" />Live Leaderboard
            </Link>
          </Button>
          <div className="flex gap-2 text-xs font-medium bg-white border border-border/60 px-4 py-2 rounded-xl shadow-sm">
          <span className="text-emerald-600">{available.length} available</span>
          {inProgress.length > 0 && <><span className="text-muted-foreground">·</span><span className="text-amber-600">{inProgress.length} in progress</span></>}
          {completed.length > 0 && <><span className="text-muted-foreground">·</span><span className="text-blue-600">{completed.length} done</span></>}
          </div>
        </div>
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />In Progress
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((quiz: any) => <QuizCard key={quiz.id} quiz={quiz} status="in_progress" />)}
          </div>
        </section>
      )}

      {/* Available */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Available</h2>
        {available.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((quiz: any) => <QuizCard key={quiz.id} quiz={quiz} status="available" />)}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-border/60 shadow-sm py-14 text-center">
            <FileQuestion className="h-14 w-14 mx-auto mb-3 text-muted-foreground opacity-30" />
            <h3 className="font-semibold mb-1">No quizzes available</h3>
            <p className="text-sm text-muted-foreground">Check back later for new assessments.</p>
          </div>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Completed
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((quiz: any) => <QuizCard key={quiz.id} quiz={quiz} status="completed" />)}
          </div>
        </section>
      )}
    </div>
  )
}

function QuizCard({ quiz, status }: { quiz: any; status: string }) {
  return (
    <div className={`relative flex flex-col rounded-2xl bg-white border shadow-sm overflow-hidden transition-all hover:shadow-md ${
      status === 'in_progress' ? 'border-amber-200' : status === 'completed' ? 'border-emerald-100' : 'border-border/60 hover:border-primary/30'
    }`}>
      {/* Status badge */}
      {status === 'in_progress' && (
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 uppercase tracking-wide">In Progress</span>
        </div>
      )}
      {status === 'completed' && quiz.attemptScore !== undefined && (
        <div className="absolute top-3 right-3">
          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${(quiz.attemptScore || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {quiz.attemptScore}%
          </span>
        </div>
      )}

      <div className={`p-5 flex flex-col flex-1 ${status === 'in_progress' ? 'pt-9' : ''}`}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[quiz.difficulty] || 'bg-gray-100 text-gray-700'}`}>{quiz.difficulty}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{quiz.topic}</span>
        </div>
        <h3 className="font-bold text-sm mb-1 pr-14 line-clamp-2">{quiz.title}</h3>
        {quiz.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{quiz.description}</p>}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/40">
          <span className="flex items-center gap-1"><FileQuestion className="h-3 w-3 text-violet-400" />{quiz.questions?.[0]?.count || quiz.question_count} Q</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-400" />{quiz.time_limit_minutes}m</span>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            className={`flex-1 h-9 rounded-xl text-xs font-semibold border-0 ${status === 'completed' ? '' : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700'}`}
            variant={status === 'completed' ? 'outline' : 'default'}
            asChild
          >
            <Link href={status === 'completed' ? `/employee/quizzes/${quiz.id}/results` : `/employee/quizzes/${quiz.id}`}>
              {status === 'completed' ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Results</> : status === 'in_progress' ? <><Play className="h-3.5 w-3.5 mr-1.5" />Continue</> : <><Play className="h-3.5 w-3.5 mr-1.5" />Start Quiz</>}
            </Link>
          </Button>
          {status === 'completed' && (
            <Button className="h-9 rounded-xl text-xs font-semibold" asChild>
              <Link href={`/employee/quizzes/${quiz.id}/leaderboard`}>
                <Trophy className="h-3.5 w-3.5 mr-1.5" />Rank
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
