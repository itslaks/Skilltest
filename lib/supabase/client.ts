import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !/^https?:\/\//.test(url) || url.includes('your')) {
    throw new Error(
      'Supabase is not configured. Set real NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY values in .env.local.'
    )
  }

  return createBrowserClient(url, key)
}
