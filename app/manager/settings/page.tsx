import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/manager/profile-form'
import { getTrainingGovernanceSettings, updateTrainingGovernanceSettings } from '@/lib/actions/training'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Key, Globe, Clock, Trophy, MessageSquareText } from 'lucide-react'

async function updateGovernanceAction(formData: FormData) {
  'use server'
  await updateTrainingGovernanceSettings(formData)
}

export default async function ManagerSettingsPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/auth/login')
  const governance = await getTrainingGovernanceSettings()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform preferences</p>
      </div>

      {/* Profile form */}
      <ProfileForm profile={profile} />

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            TMS Governance Controls
          </CardTitle>
          <CardDescription>
            Simple business controls for attendance discipline, feedback windows, and topper criteria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateGovernanceAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium"><Clock className="h-4 w-4" />Attendance cut-off</span>
                <input name="attendance_cutoff_time" type="time" defaultValue={governance.attendanceCutoffTime} className="h-11 rounded-xl border border-zinc-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Absence alert days</span>
                <input name="absence_alert_days" type="number" min="1" max="10" defaultValue={governance.absenceAlertDays} className="h-11 rounded-xl border border-zinc-200 px-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium"><MessageSquareText className="h-4 w-4" />Default feedback window</span>
                <input name="feedback_window_days" type="number" min="1" max="30" defaultValue={governance.feedbackWindowDays} className="h-11 rounded-xl border border-zinc-200 px-3" />
              </label>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
                <Trophy className="h-4 w-4" />
                Topper criteria
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium">Assessment weight (%)</span>
                  <input name="topper_assessment_weight" type="number" min="0" max="100" defaultValue={governance.topperAssessmentWeight} className="h-11 rounded-xl border border-amber-200 bg-white px-3" />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium">Project weight (%)</span>
                  <input name="topper_project_weight" type="number" min="0" max="100" defaultValue={governance.topperProjectWeight} className="h-11 rounded-xl border border-amber-200 bg-white px-3" />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium">Minimum attendance (%)</span>
                  <input name="topper_min_attendance" type="number" min="0" max="100" defaultValue={governance.topperMinAttendance} className="h-11 rounded-xl border border-amber-200 bg-white px-3" />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p>These values drive the manager action center, feedback workflow, and reproducible topper reports.</p>
              <Button type="submit" className="rounded-full bg-black text-white hover:bg-zinc-800">Save governance controls</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Read-only account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Account ID</p>
              <p className="text-sm font-mono truncate">{profile.id}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Role</p>
              <Badge variant="default" className="capitalize">{profile.role}</Badge>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {profile.employee_id && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Employee ID</p>
              <p className="text-sm font-mono">{profile.employee_id}</p>
            </div>
          )}
          {profile.domain && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Domain</p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{profile.domain}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Password changes and account deletion are managed through your Supabase authentication provider.
            Contact your administrator for password resets or account access issues.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
