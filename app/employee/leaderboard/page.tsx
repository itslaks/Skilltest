import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Flame, Star, Crown } from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) redirect('/auth/login')

  let adminClient
  try { adminClient = createAdminClient() } catch { adminClient = supabase }

  const { data: leaderboard, error: leaderboardError } = await adminClient
    .from('user_stats')
    .select('*, profiles:user_id(full_name, email, avatar_url, department, employee_id)')
    .order('total_points', { ascending: false })
    .limit(100)

  if (leaderboardError) console.error('Leaderboard error:', leaderboardError)

  const hasLeaderboardData = leaderboard && leaderboard.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Top performers across all assessments</p>
      </div>

      {/* Top 3 podium */}
      {hasLeaderboardData && leaderboard.length >= 3 && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 shadow-sm p-6">
          <p className="text-center text-sm font-bold text-amber-800 mb-6">🏆 Top Performers</p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2 pt-8">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl ring-4 ring-slate-300 shadow-md">🥈</div>
              <p className="font-semibold text-sm text-center truncate w-full text-slate-700">{(leaderboard[1] as any).profiles?.full_name?.split(' ')[0] || 'User'}</p>
              <p className="text-xl font-bold text-slate-600">{leaderboard[1].total_points} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center text-3xl ring-4 ring-yellow-400 shadow-lg">🥇</div>
              <p className="font-bold text-center truncate w-full text-amber-800">{(leaderboard[0] as any).profiles?.full_name?.split(' ')[0] || 'User'}</p>
              <p className="text-2xl font-bold text-yellow-600">{leaderboard[0].total_points} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
            </div>
            <div className="flex flex-col items-center gap-2 pt-12">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-xl ring-4 ring-amber-300 shadow-md">🥉</div>
              <p className="font-semibold text-sm text-center truncate w-full text-amber-700">{(leaderboard[2] as any).profiles?.full_name?.split(' ')[0] || 'User'}</p>
              <p className="text-lg font-bold text-amber-600">{leaderboard[2].total_points} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="rounded-2xl bg-white border border-border/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
          <h2 className="font-semibold">All Rankings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Based on total points earned</p>
        </div>
        <div className="divide-y divide-border/40">
          {hasLeaderboardData ? leaderboard.map((entry: any, i: number) => (
            <div key={entry.user_id} className={`flex items-center justify-between px-5 py-3.5 transition-colors ${entry.user_id === user?.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-muted/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                  : i === 1 ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-300'
                  : i === 2 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                  : 'bg-muted text-muted-foreground'
                }`}>{i + 1}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-blue-400 to-violet-500'}`}>
                  {entry.profiles?.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {entry.profiles?.full_name || 'Unknown'}
                    {entry.user_id === user?.id && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">You</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.profiles?.department || 'Employee'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                  <Star className="h-3 w-3" /><span className="text-xs font-bold">{entry.total_points}</span>
                </div>
                {entry.current_streak > 0 && (
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                    <Flame className="h-3 w-3" /><span className="text-xs font-medium">{entry.current_streak}</span>
                  </div>
                )}
                <div className="hidden sm:flex items-center gap-1 text-muted-foreground text-xs">
                  <Trophy className="h-3 w-3 text-blue-400" /><span>{entry.tests_completed}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-16">
              <Trophy className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="font-semibold mb-1">No Rankings Yet</h3>
              <p className="text-sm text-muted-foreground">Complete quizzes to appear on the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
