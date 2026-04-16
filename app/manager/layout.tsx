import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireManager } from '@/lib/rbac'
import { ManagerSidebar } from '@/components/manager/sidebar'
import { ManagerHeader } from '@/components/manager/header'

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await requireManager()

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return (
    <div className="min-h-screen bg-slate-50/80">
      <ManagerSidebar profile={profile} />
      <div className="lg:pl-64">
        <ManagerHeader profile={profile} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
