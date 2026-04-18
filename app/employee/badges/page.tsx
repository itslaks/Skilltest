import { getAllBadges } from '@/lib/actions/employee'
import { Award, Lock, Rocket, Trophy, Zap, Flame, BookOpen, Crown, Target, Medal, ShieldCheck, TrendingUp } from 'lucide-react'

const iconMap: Record<string, any> = {
  rocket: Rocket,
  trophy: Trophy,
  zap: Zap,
  flame: Flame,
  fire: Flame,
  'book-open': BookOpen,
  award: Award,
  crown: Crown,
  target: Target,
  medal: Medal,
  shield: ShieldCheck,
  trending: TrendingUp,
}

export default async function BadgesPage() {
  const { data: badges } = await getAllBadges()

  const earned = badges?.filter((b: any) => b.earned) || []
  const locked = badges?.filter((b: any) => !b.earned) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Earn badges by completing quizzes and building streaks.
            {earned.length > 0 && ` You've earned ${earned.length} of ${badges?.length || 0}!`}
          </p>
        </div>
        {earned.length > 0 && (
          <div className="px-4 py-2 rounded-xl bg-white border border-pink-200 text-pink-700 text-sm font-semibold shadow-sm">
            🏅 {earned.length} Earned
          </div>
        )}
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />Earned Badges
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((badge: any) => {
              const IconComp = iconMap[badge.icon] || Award
              return (
                <div key={badge.id} className="relative overflow-hidden rounded-2xl bg-white border border-violet-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-violet-100/60 rounded-bl-full pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                    <IconComp className="h-6 w-6 text-white" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-violet-900">{badge.name}</h3>
                    <p className="text-xs text-violet-700/70 mt-1">{badge.description}</p>
                    <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                      +{badge.points} pts
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Lock className="h-3 w-3" />Locked — Keep going!
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((badge: any) => {
              const IconComp = iconMap[badge.icon] || Award
              return (
                <div key={badge.id} className="rounded-2xl bg-white border border-border/60 border-dashed shadow-sm p-5 flex items-start gap-4 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <IconComp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-muted-foreground">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground/70 mt-1">{badge.description}</p>
                    <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      +{badge.points} pts
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {earned.length === 0 && locked.length === 0 && (
        <div className="rounded-2xl bg-white border border-border/60 shadow-sm py-16 text-center">
          <Award className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold mb-1">No Badges Yet</h3>
          <p className="text-sm text-muted-foreground">Start taking quizzes to earn your first badge!</p>
        </div>
      )}
    </div>
  )
}
