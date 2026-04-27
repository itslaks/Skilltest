const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

function loadLocalEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  const env = fs.readFileSync(envPath, 'utf8')
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (!process.env[key]) {
      process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '')
    }
  }
}

loadLocalEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables. Check .env.local.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const ACCOUNTS = [
  {
    email: 'admin@hexaware.com',
    password: 'Zxcv,0987',
    full_name: 'Hexaware Admin',
    role: 'admin',
    approval_status: 'approved',
    department: 'Administration',
  },
  {
    email: 'trainer@hexaware.com',
    password: 'Asdf,1234',
    full_name: 'Sample Trainer',
    role: 'trainer',
    approval_status: 'approved',
    department: 'Training',
  },
]

async function seedAccount(account) {
  const { email, password, full_name, role, approval_status, department } = account
  console.log(`\n🔍 Processing: ${email} (${role})`)

  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) { console.error('  ❌ listUsers error:', listError.message); return }

  let user = users.users.find(u => u.email === email)

  if (!user) {
    console.log(`  Creating auth account...`)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role, department, approval_status },
    })
    if (createError) { console.error('  ❌ Create error:', createError.message); return }
    user = newUser.user
    console.log(`  ✅ Auth account created.`)
  } else {
    console.log(`  Account exists — updating password & metadata...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, full_name, role, department, approval_status },
    })
    if (updateError) { console.error('  ❌ Update error:', updateError.message); return }
    console.log(`  ✅ Auth account updated.`)
  }

  // Upsert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email,
      full_name,
      role,
      approval_status,
      department,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (profileError) {
    console.error(`  ❌ Profile upsert error:`, profileError.message)
  } else {
    console.log(`  ✅ Profile verified — role: ${role}, approval: ${approval_status}`)
  }
}

async function main() {
  console.log('🚀 Seeding admin & trainer accounts...\n')
  for (const account of ACCOUNTS) {
    await seedAccount(account)
  }
  console.log('\n✅ All done! Credentials:')
  console.log('   Admin   → admin@hexaware.com   / Zxcv,0987')
  console.log('   Trainer → trainer@hexaware.com / Asdf,1234')
}

main()
