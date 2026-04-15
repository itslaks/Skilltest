<div align="center">

# 🎯 AssessHub

### ✨ Gamified Employee Assessment Platform ✨

> 🚀 A **production-ready, scalable** employee assessment platform built for **1000+ concurrent users** — featuring AI-powered quiz generation, manager-controlled quiz assignments, gamification, and real-time analytics.

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [📊 Database Schema](#-database-schema)
- [🔄 Quiz Assignment Flow](#-quiz-assignment-flow)
- [🤖 AI Question Generation](#-ai-question-generation)
- [🛡 Security & Scalability](#-security--scalability)
- [🏆 Gamification System](#-gamification-system)
- [📋 Environment Variables](#-environment-variables)
- [🧪 NPM Scripts](#-npm-scripts)
- [❓ Troubleshooting](#-troubleshooting)
- [📜 License](#-license)

---

## ✨ Features

### 👔 Manager Portal — `/manager`

| Feature | Description |
|:--------|:------------|
| 📊 **Dashboard** | Real-time overview — total quizzes, attempts, average scores, active employees |
| 📝 **Quiz Creation** | Create quizzes with topic, difficulty, time limit, question count, passing score & feedback URL |
| 🎚 **Difficulty Distribution** | Automatic **50%/10% split** — 50% at chosen difficulty, 10% each from the other four levels |
| 🤖 **AI Question Generation** | Hybrid: **OpenAI GPT-4o-mini** → **Google Gemini 1.5 Flash** → **Template engine** fallback |
| ✏️ **Quiz Editor** | Full inline editing — add/remove/reorder questions, toggle correct answers |
| 🔀 **Quiz Toggle** | Activate / deactivate quizzes with one click |
| 👥 **Employee Management** | View all signed-up employees with stats, department, and activity info |
| 📤 **Excel Import** | Bulk import employees via Excel/CSV — auto-categorizes by domain |
| � **Quiz Import** | 🆕 Import quiz questions from Excel files with template download |
| �📋 **Quiz Assignment** | 🆕 Assign quizzes to specific employees — employees see **only** their assigned quizzes |
| 🏆 **Leaderboard** | Per-quiz leaderboard with rank, score, time, and correct answers |
| 📥 **Excel Export** | Download leaderboards as `.xlsx` files |
| 📈 **Reports & Analytics** | Per-quiz performance, pass rates, domain distribution, engagement metrics |
| 📊 **Comprehensive Report Download** | 🆕 Download full reports with Summary, Quiz Performance, All Results & Employee Stats sheets |
| ⚙️ **Settings** | Profile management |

### 👩‍💻 Employee Portal — `/employee`

| Feature | Description |
|:--------|:------------|
| 🏠 **Dashboard** | Points, streak, quizzes taken, average score, assigned quizzes, earned badges |
| 📋 **Assigned Quizzes** | 🆕 Employees see **zero quizzes by default** — only quizzes assigned by a manager appear |
| 🎮 **Quiz Player** | Interactive MCQ interface with rich UX _(see below)_ |
| 📊 **Results** | Score display (pass/fail), stats grid, leaderboard ranking, feedback form link |
| 🏆 **Global Leaderboard** | Podium for top 3, full ranking by total points |
| 🎖 **Badge Collection** | Visual grid of earned & locked badges with progress indicators |

#### 🎮 Quiz Player Experience

```
⏱  Countdown timer — red pulse animation when < 60s remaining
📊  Real-time progress bar — questions answered / total
🔥  Streak counter — consecutive correct answers with fire animation
✅  Instant feedback — correct/incorrect highlighting + explanation text
🚀  Auto-submit — automatically submits when timer expires
🔀  Randomized questions — shuffled order on every attempt
```

### 🔐 Authentication System

| Feature | Description |
|:--------|:------------|
| 📧 **Email/Password Sign-Up** | Employee-only self-registration (manager accounts created by admins) |
| � **Password-Only Sign-In** | Secure password-based authentication (no magic links) |
| 🛡 **Server-Side Role Enforcement** | Role is **always** set to `employee` on sign-up — cannot be bypassed via API |
| 🔒 **Supabase Auth + RLS** | Row Level Security on every table — users only access their own data |
| 🚪 **Protected Routes** | Middleware-based session validation on all `/manager` and `/employee` routes |
| ↩️ **Auto-Redirect** | Employees → `/employee`, Managers → `/manager` after login |

### 🌐 Landing Page

> A fully designed marketing landing page with **16 sections** including:

```
🦸 Hero Section          📊 Metrics Section        💰 Pricing Section
✨ Features Section       🔗 Integrations Section   💬 Testimonials Section
📖 How It Works          🛡 Security Section        👨‍💻 Developers Section
🏗 Infrastructure        🎯 CTA Section             🔻 Footer Section
🎨 Animated Sphere       🔺 Animated Tetrahedron    🌊 Animated Wave
🧭 Navigation Bar
```

---

## 🏗 Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| ⚡ **Framework** | Next.js 16 (App Router + Turbopack) | Server components, streaming, server actions |
| 🟦 **Language** | TypeScript 5 | Full type safety across client & server |
| 🎨 **Styling** | Tailwind CSS 4 + `tw-animate-css` | Utility-first CSS with animations |
| 🧩 **Components** | Radix UI + shadcn-style primitives | 50+ accessible UI components |
| 🔤 **Typography** | Instrument Sans, Instrument Serif, JetBrains Mono | Google Fonts via `next/font` |
| 🎭 **Icons** | Lucide React | 1000+ consistent SVG icons |
| 🗄 **Database** | Supabase (PostgreSQL + RLS) | Managed Postgres with row-level security |
| 🔑 **Auth** | Supabase Auth | Password, magic link, session management |
| ✅ **Validation** | Zod | Runtime schema validation on all inputs |
| 📊 **Charts** | Recharts | Data visualization in reports |
| 📄 **Excel** | SheetJS (`xlsx`) | Import employees, export leaderboards |
| 🤖 **AI** | OpenAI GPT-4o-mini / Google Gemini 1.5 Flash | AI-powered question generation |
| 🎡 **3D** | Three.js + `@react-three/fiber` | Landing page 3D animations |
| 📈 **Analytics** | Vercel Analytics | Production usage tracking |
| 🔄 **State** | React 19 (transitions, server actions) | `useTransition`, `useActionState` |
| 📦 **Package Manager** | pnpm | Fast, disk-efficient package management |

---

## 📂 Project Structure

```
📁 app/
├── 🏠 page.tsx                    # Landing page (marketing)
├── 🎨 layout.tsx                  # Root layout (fonts, analytics)
├── 🌍 globals.css                 # Global styles
│
├── 🔐 auth/
│   ├── login/                     # Password + magic link login
│   ├── sign-up/                   # Employee self-registration
│   ├── sign-up-success/           # Confirmation page
│   ├── callback/                  # Supabase auth callback handler
│   └── error/                     # Auth error display
│
├── 👩‍💻 employee/
│   ├── layout.tsx                 # Employee shell (nav, auth guard)
│   ├── page.tsx                   # Employee dashboard
│   ├── quizzes/                   # Quiz listing + quiz player + results
│   ├── leaderboard/               # Global leaderboard
│   └── badges/                    # Badge collection
│
├── 👔 manager/
│   ├── layout.tsx                 # Manager shell (sidebar, auth + role guard)
│   ├── page.tsx                   # Manager dashboard
│   ├── quizzes/                   # Quiz CRUD + detail + editor
│   │   ├── new/                   # Create new quiz
│   │   └── [id]/                  # Quiz detail + edit + assignments
│   ├── employees/                 # Employee list + import + quiz assignment
│   ├── reports/                   # Analytics & reporting
│   └── settings/                  # Profile settings
│
└── 🔌 api/
    ├── generate-questions/        # AI question generation endpoint
    ├── generate-from-content/     # AI question generation from content
    ├── extract-content/           # Extract content from files/URLs
    ├── leaderboard/[quizId]/      # Leaderboard Excel download
    ├── reports/download/          # 🆕 Comprehensive reports Excel download
    └── health/                    # 🆕 API health check endpoint

📁 components/
├── 🌐 landing/                    # 16 landing page section components
│   ├── animated-sphere.tsx        # Three.js 3D sphere
│   ├── animated-tetrahedron.tsx   # Three.js 3D tetrahedron
│   ├── animated-wave.tsx          # Three.js wave animation
│   ├── hero-section.tsx           # Hero with CTA
│   ├── features-section.tsx       # Feature showcase
│   ├── how-it-works-section.tsx   # Step-by-step flow
│   ├── metrics-section.tsx        # Stats counter
│   ├── pricing-section.tsx        # Pricing plans
│   ├── testimonials-section.tsx   # User testimonials
│   ├── security-section.tsx       # Security features
│   └── ...                        # + 6 more sections
│
├── 👔 manager/
│   ├── sidebar.tsx                # Collapsible sidebar navigation
│   ├── header.tsx                 # Top bar with user info
│   ├── quiz-editor.tsx            # Question CRUD editor
│   ├── quiz-importer.tsx          # 🆕 Import quiz questions from Excel
│   ├── quiz-toggle-active.tsx     # Toggle quiz on/off
│   ├── quiz-delete-button.tsx     # Quiz deletion with confirm
│   ├── quiz-assignment-manager.tsx # 🆕 Assign quizzes to employees
│   ├── employee-importer.tsx      # Excel bulk import
│   ├── content-question-generator.tsx # Generate questions from content
│   └── profile-form.tsx           # Profile edit form
│
├── 🧩 ui/                        # 50+ shadcn-style primitives
│   ├── button.tsx, input.tsx, card.tsx, dialog.tsx ...
│   ├── accordion.tsx, tabs.tsx, select.tsx, checkbox.tsx ...
│   ├── toast.tsx, spinner.tsx, badge.tsx, avatar.tsx ...
│   └── ...
│
└── 🎨 theme-provider.tsx         # Dark/light theme context

📁 lib/
├── ⚡ actions/
│   ├── auth.ts                    # Sign-up, sign-in, magic link, sign-out, profile
│   ├── quiz.ts                    # Quiz CRUD, question CRUD, bulk operations
│   ├── employee.ts                # Quiz taking, results, leaderboard, badges, stats
│   └── manager.ts                 # Employee import, quiz assignment, employee listing
│
├── 🛡 security/
│   ├── validation.ts              # Zod schemas for ALL inputs (17+ schemas)
│   ├── env.ts                     # Secure env var loading + runtime validation
│   ├── rate-limit.ts              # Rate limiter (available for infra-level use)
│   └── index.ts                   # Barrel exports
│
├── 🗄 supabase/
│   ├── client.ts                  # Browser Supabase client
│   ├── server.ts                  # Server-side Supabase client
│   └── proxy.ts                   # Middleware session updater
│
├── 📐 types/
│   └── database.ts                # All TypeScript interfaces (15+ types)
│
└── 🔧 utils.ts                   # `cn()` classname merger

📁 scripts/                        # SQL migrations (run in order)
├── 001_create_profiles.sql        # Users table + RLS
├── 002_create_quizzes.sql         # Quizzes table + RLS
├── 003_create_questions.sql       # Questions table + RLS
├── 004_create_attempts.sql        # Quiz attempts table + RLS
├── 005_create_gamification.sql    # Badges + user_badges + user_stats
├── 006_create_triggers.sql        # Auto-update triggers
├── 007_seed_badges.sql            # 8 default achievement badges
├── 008_add_passing_score.sql      # Passing score column
└── 009_create_quiz_assignments.sql # 🆕 Quiz assignment table + RLS

📁 hooks/
├── use-mobile.ts                  # Mobile detection hook
└── use-toast.ts                   # Toast notification hook

📁 styles/
└── globals.css                    # Additional global styles

📁 public/                         # Static assets (logos, icons, placeholders)
```

---

## 🚀 Getting Started

> 📖 **Detailed step-by-step guide:** see [EXECUTE.md](./EXECUTE.md)

### Prerequisites

| Tool | Version | Link |
|:-----|:--------|:-----|
| 🟢 Node.js | ≥ 18.x | https://nodejs.org |
| 📦 pnpm / npm | latest | `npm install -g pnpm` |
| 🐙 Git | any | https://git-scm.com |
| 🟩 Supabase | free tier | https://supabase.com |

### Quick Start

```bash
# 1️⃣  Clone the repository
git clone https://github.com/itslaks/Skilltest.git
cd app

# 2️⃣  Install dependencies
pnpm install
# or: npm install --legacy-peer-deps

# 3️⃣  Configure environment
cp .env.example .env.local
# Fill in Supabase URL, keys, site URL (see Environment Variables section)

# 4️⃣  Run database migrations (in Supabase SQL Editor — in order!)
#     scripts/001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009

# 5️⃣  Start development server
pnpm dev
# or: npm run dev
```

🌐 Open **http://localhost:3000** in your browser.

### First-Time Setup

```
1. Open /auth/sign-up → register an employee account
2. In Supabase dashboard → Authentication → Users → confirm the email
3. To create a manager: update the user's role to 'manager' in the
   profiles table via Supabase SQL Editor or Table Editor
4. Manager can now log in at /auth/login → redirects to /manager
5. Manager assigns quizzes to employees from the Employees page
```

---

## 📊 Database Schema

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATABASE TABLES                           │
├──────────────────┬───────────────────────────────────────────────┤
│ 🟦 profiles       │ User accounts — role, department, domain,    │
│                   │ employee_id, manager_id, avatar              │
├──────────────────┼───────────────────────────────────────────────┤
│ 🟩 quizzes        │ Quiz definitions — topic, difficulty, time   │
│                   │ limit, question count, passing score, active │
├──────────────────┼───────────────────────────────────────────────┤
│ 🟨 questions      │ MCQ questions — JSONB options                │
│                   │ [{text, isCorrect}], difficulty, explanation │
├──────────────────┼───────────────────────────────────────────────┤
│ 🆕 quiz_assignments│ Links quizzes → employees (assigned_by,     │
│                   │ assigned_at, due_date). Unique per pair.     │
├──────────────────┼───────────────────────────────────────────────┤
│ 🟧 quiz_attempts  │ Attempt records — answers, score, time,      │
│                   │ points, status (in_progress / completed)     │
├──────────────────┼───────────────────────────────────────────────┤
│ 🏆 badges         │ Achievement definitions — criteria, points,   │
│                   │ icon (8 seeded badges)                       │
├──────────────────┼───────────────────────────────────────────────┤
│ 🎖 user_badges    │ Junction: which users earned which badges    │
├──────────────────┼───────────────────────────────────────────────┤
│ 📈 user_stats     │ Aggregated stats — total points, streak,     │
│                   │ tests completed, average score               │
├──────────────────┼───────────────────────────────────────────────┤
│ 📤 employee_imports│ Import operation logs — success/fail counts  │
└──────────────────┴───────────────────────────────────────────────┘
```

**Difficulty levels:** `🟢 easy` · `🔵 medium` · `🟡 hard` · `🟠 advanced` · `🔴 hardcore`

**Row Level Security (RLS):** ✅ Enabled on **every table** — employees can only read their own data, managers can manage their quizzes and employees.

---

## 🔄 Quiz Assignment Flow

> 🆕 **Employees see zero quizzes by default.** Quizzes only appear after a manager explicitly assigns them.

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  📝 Manager  │────▶│  Creates a Quiz  │────▶│  Quiz is Active │
│  Dashboard   │     │  (topic, time,   │     │  but invisible  │
│              │     │   difficulty)    │     │  to employees   │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  👥 Manager  │────▶│ Assign Quiz to   │────▶│ quiz_assignments│
│  Employees   │     │ specific         │     │ row created     │
│  Page        │     │ employees        │     │                 │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  👩‍💻 Employee │────▶│ Sees ONLY        │────▶│  Takes the Quiz │
│  Dashboard   │     │ assigned quizzes │     │  → Score, Badge │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

**Server-side enforcement:**
- `getAvailableQuizzes()` → filters by `quiz_assignments` table
- `getQuizForAttempt()` → verifies assignment before showing questions
- `startQuizAttempt()` → verifies assignment before creating attempt
- Direct URL access to unassigned quizzes is **blocked**

---

## 🤖 AI Question Generation

The platform supports a **hybrid approach** for dynamic MCQ generation:

| Priority | Provider | Model | Trigger |
|:---------|:---------|:------|:--------|
| 1️⃣ | **OpenAI** | GPT-4o-mini | `OPENAI_API_KEY` is set |
| 2️⃣ | **Google Gemini** | 1.5 Flash | `GOOGLE_GEMINI_API_KEY` is set |
| 3️⃣ | **Template Engine** | Built-in | Always available (no API key needed) |

### 📐 Difficulty Distribution Rule

```
Selected difficulty gets   ██████████████████████████████  50%
Each other difficulty gets ██████                          10%  × 4
                           ────────────────────────────────────
                           Total                           100%
```

> Example: A 20-question quiz at **Hard** difficulty → 10 hard, 2 easy, 2 medium, 2 advanced, 2 hardcore

---

## 🛡 Security & Scalability

### 🔒 Security Measures

| Layer | Protection |
|:------|:-----------|
| 🛡 **Input Validation** | Zod schemas on **every** server action — 17+ schemas, max 397 chars, strict mode |
| 💉 **Injection Prevention** | Regex refinements reject `<script>`, `javascript:`, inline event handlers |
| 🔐 **RLS (Row Level Security)** | Enabled on all 9 tables — users cannot access data they shouldn't see |
| 🔑 **Environment Variables** | Runtime validation at startup — fails fast if required vars are missing |
| 🚫 **Role Enforcement** | Sign-up always creates `employee` role — server-side override regardless of client payload |
| 🔒 **Security Headers** | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` |
| 🚪 **Route Protection** | Middleware validates session on every request; layout guards check role |
| ⚠️ **Error Pages** | Whitelisted error codes only — no raw user input displayed |

### ⚡ Scalability for 1000+ Concurrent Users

| Design Decision | Reason |
|:----------------|:-------|
| 🚫 **No in-memory rate limiting** | In-memory maps don't share across serverless instances — would block legitimate users at scale |
| 🗄 **Database indexes** | Composite indexes on `(user_id, quiz_id)` for fast assignment lookups |
| 📊 **Efficient queries** | Assignments fetched first → then quizzes filtered by ID (avoids full table scans) |
| 🔀 **Upsert for assignments** | `ON CONFLICT` prevents duplicates without pre-checking |
| ⚡ **Turbopack** | Next.js 16 with Turbopack for faster builds and HMR |
| 🏗 **Server Components** | Pages load data on the server — minimal client-side JS |
| 🔄 **`revalidatePath`** | Targeted cache invalidation instead of full page reloads |

> 💡 **For production:** Use infrastructure-level rate limiting (Cloudflare, Vercel WAF, or Redis-backed solutions) instead of in-process limits.

---

## 🏆 Gamification System

### 🎖 Badges (8 Pre-Seeded)

| Badge | Criteria | Points |
|:------|:---------|:-------|
| 🚀 **Quick Learner** | Complete your first quiz | 50 |
| 🏆 **Perfect Score** | Achieve 100% on any quiz | 100 |
| ⚡ **Speed Demon** | Finish in < 50% of time limit | 75 |
| 🔥 **Streak Starter** | 3-day quiz streak | 50 |
| 🔥🔥 **Streak Master** | 7-day quiz streak | 150 |
| 📚 **Dedicated Learner** | Complete 5 quizzes | 75 |
| 🏅 **Quiz Champion** | Complete 10 quizzes | 150 |
| 👑 **Knowledge Master** | Complete 25 quizzes | 300 |

### 📊 Points System

```
✅ Correct answer        → 10 points each
⚡ Speed bonus           → +25 points (finish in < 50% of time limit)
🔥 Perfect quiz bonus    → +50 points (all answers correct)
```

### 📈 Tracked Stats

- 🏆 Total points · 🔥 Current streak · 📊 Longest streak · 📝 Tests completed · 📈 Average score

---

## 📋 Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key (**server-only, never expose**) |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Your app URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | ❌ Optional | Override auth callback URL for development |
| `OPENAI_API_KEY` | ❌ Optional | OpenAI API key for AI question generation |
| `GOOGLE_GEMINI_API_KEY` | ❌ Optional | Google Gemini API key (fallback AI provider) |

---

## 🧪 NPM Scripts

| Command | Description |
|:--------|:------------|
| `pnpm dev` | 🚀 Start dev server with Turbopack |
| `pnpm build` | 📦 Create production build |
| `pnpm start` | 🌐 Serve the production build |
| `pnpm lint` | 🔍 Run ESLint |

---

## ❓ Troubleshooting

| Problem | Solution |
|:--------|:---------|
| 🔴 `Module not found: @supabase/supabase-js` | Run `pnpm install` or `npm install --legacy-peer-deps` |
| 🔴 `useSearchParams() should be wrapped in Suspense` | Already fixed — run `pnpm build` again |
| 🔴 Build fails with env errors | Ensure `.env.local` exists with all required variables |
| 🔴 `EACCES` or `ExecutionPolicy` error (Windows) | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| 🔴 Supabase RLS errors (`new row violates policy`) | Run all SQL scripts (001–009) in order; verify user role in `profiles` |
| 🟡 Employee sees no quizzes | Manager must assign quizzes from the **Employees** page first |
| 🟡 Cannot sign up as manager | By design — update role to `manager` in Supabase `profiles` table |
| 🟡 AI questions not generating | Set `OPENAI_API_KEY` or `GOOGLE_GEMINI_API_KEY` in `.env.local` |

---

## 📦 SQL Migration Order

Run these in your **Supabase SQL Editor** in exact order:

```
001_create_profiles.sql         ─── 👤 User profiles table
002_create_quizzes.sql          ─── 📝 Quizzes table
003_create_questions.sql        ─── ❓ Questions table
004_create_attempts.sql         ─── 📊 Quiz attempts table
005_create_gamification.sql     ─── 🏆 Badges, user_badges, user_stats
006_create_triggers.sql         ─── ⚙️ Auto-update triggers
007_seed_badges.sql             ─── 🎖 Seed 8 default badges
008_add_passing_score.sql       ─── ✅ Passing score column
009_create_quiz_assignments.sql ─── 🆕 Quiz ↔ Employee assignments
010_fix_leaderboard_rls.sql     ─── 🔧 Fix leaderboard RLS policies
```

> All scripts use `IF NOT EXISTS` — safe to re-run.

---

## 📝 Changelog

### v1.1.0 (April 2026)

#### 🆕 New Features
- **Quiz Import from Excel** — Managers can now import quiz questions from Excel files with a downloadable template
- **Comprehensive Report Download** — Download full analytics reports with 4 sheets: Summary, Quiz Performance, All Results, Employee Stats
- **Health Check API** — New `/api/health` endpoint to verify environment configuration

#### 🔧 Improvements
- **Enhanced UI** — Professional, vibrant login page with gradient backgrounds and decorative elements
- **Improved Manager Dashboard** — Welcome banner, gradient stat cards, and quick action buttons
- **Improved Employee Dashboard** — Matching professional design with better visual hierarchy
- **Removed Magic Links** — Simplified authentication to password-only login for better security

#### 🐛 Bug Fixes
- **Fixed Employee Leaderboard** — Now properly handles authentication and displays global rankings
- **Fixed Excel Downloads** — Added robust error handling with fallback when service role key is unavailable
- **Fixed Report Generation** — Reports API now correctly generates multi-sheet Excel files

---

<div align="center">

### 🛠 Built with ❤️ by [itslaks](https://github.com/itslaks)

**AssessHub** — Making employee assessments smarter, gamified, and scalable.

</div>

---

## 📜 License

This project is private. All rights reserved.
