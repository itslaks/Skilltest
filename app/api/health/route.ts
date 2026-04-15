import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const allConfigured = Object.values(checks).every(Boolean)

  return NextResponse.json({
    status: allConfigured ? 'healthy' : 'missing_config',
    checks,
    message: allConfigured 
      ? 'All environment variables are configured' 
      : 'Some environment variables are missing. Check your .env.local file.',
  })
}
