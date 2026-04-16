import { getEmployeeStats, getAvailableQuizzes } from '@/lib/actions/employee'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Trophy, Flame, Target, Star, ArrowRight, FileQuestion, Clock, Zap, Award, Sparkles,
} from 'lucide-react'

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const { data: stats } = await getEmployeeStats()
  const { data: quizzes } = await getAvailableQuizzes()

  const activeQuizzes = quizzes?.filter((q: any) => !q.attemptStatus || q.attemptStatus === 'in_progress') || []
  const completedQuizzes = quizzes?.filter((q: any) => q.attemptStatus === 'completed') || []

  const statCards = [
    {
      title: 'Total Points',
      value: stats?.stats?.total_points || 0,
      suffix: '',
      icon: Star,
      gradient: 'from-yellow-500 to-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-500',
      text: 'text-amber-700',
    },
    {
      title: 'Current Streak',
      value: stats?.stats?.current_streak || 0,
      suffix: ' days',
      icon: Flame,
      gradient: 'from-orange-500 to-red-600',
      bg: 'bg-orange-50 border-orange-100',
      iconBg: 'bg-orange-500',
      text: 'text-orange-700',
    },
    {
      title: 'Quizzes Done',
      value: stats?.stats?.tests_completed || 0,
      suffix: '',
      icon: Target,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50 border-green-100',
      iconBg: 'bg-green-500',
      text: 'text-green-700',
    },
    {
      title: 'Average Score',
      value: Math.round(stats?.stats?.average_score || 0),
      suffix: '%',
      icon: Trophy,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-500',
      text: 'text-blue-700',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-16 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Employee Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Hey, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-white/75 max-w-md text-sm md:text-base">
              Keep learning, earn badges, and climb the leaderboard!
            </p>
          </div>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold w-full sm:w-auto">
            <Link href="/employee/quizzes">
              <FileQuestion className="mr-2 h-5 w-5" />
              Take a Quiz
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`relative overflow-hidden shadow-sm hover:shadow-md transition-shadow ${stat.bg}`}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br opacity-20 rounded-full blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.text}`}>
                {stat.value}
                {stat.suffix && <span className="text-base font-normal text-muted-foreground">{stat.suffix}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/employee/quizzes" className="group">
          <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <FileQuestion className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">Take Quizzes</h3>
                <p className="text-sm text-muted-foreground">{activeQuizzes.length} available</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/employee/leaderboard" className="group">
          <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">Leaderboard</h3>
                <p className="text-sm text-muted-foreground">See rankings</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/employee/badges" className="group">
          <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">Badges</h3>
                <p className="text-sm text-muted-foreground">{stats?.badges?.length || 0} earned</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Badges */}
      {stats?.badges && stats.badges.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Your Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((ub: any) => (
                <div key={ub.id} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-sm font-semibold">{ub.badges?.name}</p>
                    <p className="text-xs text-muted-foreground">{ub.badges?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Quizzes */}
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
          <div>
            <CardTitle>Available Quizzes</CardTitle>
            <CardDescription>Take a quiz to earn points and badges</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employee/quizzes">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeQuizzes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeQuizzes.slice(0, 6).map((quiz: any) => (
                <div key={quiz.id} className="flex flex-col p-4 rounded-lg border hover:border-primary/50 transition-colors">
                  <h3 className="font-medium truncate">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{quiz.description || quiz.topic}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">{quiz.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {quiz.time_limit_minutes}m
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" /> {quiz.questions?.[0]?.count || quiz.question_count} Q
                    </span>
                  </div>
                  <Button size="sm" className="mt-3" asChild>
                    <Link href={`/employee/quizzes/${quiz.id}`}>
                      {quiz.attemptStatus === 'in_progress' ? 'Continue' : 'Start Quiz'}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quizzes available right now</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAttempts.slice(0, 5).map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{attempt.quizzes?.title}</p>
                    <p className="text-xs text-muted-foreground">{attempt.quizzes?.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${attempt.score >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                      {attempt.score}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
                    </p>
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
