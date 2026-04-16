import { getAllBadges } from '@/lib/actions/employee'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Lock, Rocket, Trophy, Zap, Flame, BookOpen, Crown } from 'lucide-react'

const iconMap: Record<string, any> = {
  rocket: Rocket,
  trophy: Trophy,
  zap: Zap,
  flame: Flame,
  fire: Flame,
  'book-open': BookOpen,
  award: Award,
  crown: Crown,
}

export default async function BadgesPage() {
  const { data: badges } = await getAllBadges()

  const earned = badges?.filter((b: any) => b.earned) || []
  const locked = badges?.filter((b: any) => !b.earned) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-7 w-7 text-purple-500" />
            Badges
          </h1>
          <p className="text-muted-foreground mt-1">
            Earn badges by completing quizzes and building streaks.
            {earned.length > 0 && ` You've earned ${earned.length} of ${badges?.length || 0}!`}
          </p>
        </div>
        {earned.length > 0 && (
          <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm font-semibold">
            🏅 {earned.length} Earned
          </div>
        )}
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Earned Badges
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((badge: any) => {
              const IconComp = iconMap[badge.icon] || Award
              return (
                <Card key={badge.id} className="relative overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-bl-full" />
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                      <IconComp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900">{badge.name}</h3>
                      <p className="text-sm text-purple-700/70 mt-1">{badge.description}</p>
                      <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        +{badge.points} pts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            Locked Badges — Keep going!
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((badge: any) => {
              const IconComp = iconMap[badge.icon] || Award
              return (
                <Card key={badge.id} className="border-dashed opacity-60 hover:opacity-80 transition-opacity">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <IconComp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground/70 mt-1">{badge.description}</p>
                      <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        +{badge.points} pts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {earned.length === 0 && locked.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Badges Available</h3>
            <p className="text-muted-foreground text-sm">Start taking quizzes to earn your first badge!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
