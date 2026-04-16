import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'
import {
  LayoutDashboard,
  FileQuestion,
  Trophy,
  Award,
  Sparkles,
  LogOut,
  User,
} from 'lucide-react'

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is a manager/admin - redirect them to manager dashboard
  const role = profile?.role || user.user_metadata?.role
  if (role === 'manager' || role === 'admin') {
    redirect('/manager')
  }

  const navigation = [
    { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
    { name: 'Quizzes', href: '/employee/quizzes', icon: FileQuestion },
    { name: 'Leaderboard', href: '/employee/leaderboard', icon: Trophy },
    { name: 'Badges', href: '/employee/badges', icon: Award },
  ]

  // Get basic stats for nav display
  const { data: userStats } = await supabase
    .from('user_stats')
    .select('total_points, current_streak')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/employee" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground tracking-tight">SkillTest</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Employee Portal</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:block">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="flex items-center gap-3">
            {/* Points pill */}
            {userStats?.total_points !== undefined && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                <span className="text-sm">⭐</span>
                <span className="text-sm font-semibold">{userStats.total_points}</span>
                <span className="text-xs text-amber-600">pts</span>
              </div>
            )}
            {/* Streak pill */}
            {userStats?.current_streak !== undefined && userStats.current_streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold">{userStats.current_streak}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'E'}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-none">{profile?.full_name?.split(' ')[0] || 'Employee'}</p>
              </div>
            </div>
            <form action={signOut}>
              <button 
                type="submit" 
                title="Sign Out"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
