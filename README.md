# SkillTest

Gamified employee assessment platform for managers and employees.

SkillTest helps managers create quizzes, assign them to employees, track completion, export ranked results, and keep employees motivated with points, streaks, badges, and live leaderboards.

## Highlights

- Manager dashboard with action items and operational health checks
- Full quiz CRUD with activate/deactivate, edit, assign, export, and delete actions
- Per-quiz and cumulative leaderboards with Excel downloads
- Employee dashboard with next-best-step guidance
- Real-time leaderboard refresh after quiz completion
- Employee import from Excel/CSV with validation and duplicate checks
- Question import from Excel/CSV with strict parsing and answer validation
- AI question generation from topics or uploaded content
- AI-generated answer options are randomized and balanced across A/B/C/D
- Forgot-password and reset-password flow through Supabase Auth
- Gamification with points, streaks, badges, podiums, and ranking views

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | Tailwind CSS, Radix UI, shadcn-style components |
| Auth | Supabase Auth |
| Database | Supabase Postgres with RLS |
| Excel | SheetJS / xlsx |
| AI | OpenAI GPT-4o-mini, Google Gemini fallback |
| Analytics | Vercel Analytics |

## Manager Features

### Dashboard

The manager dashboard includes a practical Action Center that flags:

- quizzes with too few questions
- draft quizzes ready to activate
- active quizzes with no completions
- employees who have not engaged yet
- low-score coaching opportunities

### Quiz Management

Managers can:

- create quizzes
- edit quiz details and questions
- import questions from spreadsheet files
- generate questions with AI
- activate or deactivate quizzes
- assign quizzes to employees
- view quiz details and completion data
- export ranked quiz results
- delete quizzes

Each quiz card also shows readiness guidance such as:

- Needs more questions
- Ready to activate
- Needs assignment
- Waiting for completions
- Collecting results

### Reports And Exports

Managers can export:

- individual quiz results
- cumulative leaderboard results
- full reports
- employee reports

Quiz exports include ranked results with employee name, email, score, answers, points, and completion time.

### Employee Management

Managers can:

- add employees
- edit employee details
- delete employees
- import employees from Excel/CSV
- download an employee import template
- export employee data and performance stats

The importer validates required fields, detects duplicate emails, accepts common column names, and reports skipped rows clearly.

## Employee Features

Employees can:

- view assigned quizzes only
- continue in-progress quizzes
- complete timed quizzes
- see instant feedback
- view quiz results
- view per-quiz leaderboards
- view cumulative leaderboard
- track points, streaks, average score, and completed quizzes
- earn badges

The employee dashboard includes a Next Best Step card that guides the user to continue a quiz, start a quiz, review leaderboard results, or check badges.

## AI And Import Features

SkillTest supports:

- topic-based AI question generation
- content-based AI generation from PDF, DOCX, TXT, or pasted text
- direct spreadsheet question import
- improved text extraction cleanup for uploaded documents
- strict question parsing with all four options required
- correct answer validation as A/B/C/D or exact option text
- duplicate question detection
- randomized saved option order so correct answers do not follow a visible pattern

## Authentication

Authentication uses Supabase Auth.

Supported flows:

- email/password sign up
- email/password sign in
- forgot password
- reset password through Supabase recovery callback
- role-based redirects for employee and manager dashboards

## Database Setup

Run the SQL scripts in `scripts/` in order inside the Supabase SQL editor.

Core setup:

```text
scripts/001_create_profiles.sql
scripts/002_create_quizzes.sql
scripts/003_create_questions.sql
scripts/004_create_attempts.sql
scripts/005_create_gamification.sql
scripts/006_create_triggers.sql
scripts/007_seed_badges.sql
scripts/008_add_passing_score.sql
scripts/009_create_quiz_assignments.sql
scripts/010_fix_leaderboard_rls.sql
scripts/011_fix_manager_rls.sql
scripts/012_create_assessment_imports.sql
scripts/013_fix_rbac_trigger.sql
scripts/014_add_status_to_quizzes.sql
scripts/015_remove_question_approval_system.sql
scripts/016_safe_remove_approval_system.sql
scripts/017_enhanced_user_stats_trigger.sql
scripts/018_add_updated_at_to_questions.sql
scripts/019_more_meaningful_badges.sql
```

`scripts/019_more_meaningful_badges.sql` adds additional badges and expands badge-awarding rules.

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

AI keys are optional, but at least one is required for AI question generation from content.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build:

```bash
npm run build
```

Type check:

```bash
npx tsc --noEmit --pretty false
```

## Useful Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/auth/login` | Login |
| `/auth/sign-up` | Employee sign up |
| `/auth/reset-password` | Request reset link |
| `/auth/update-password` | Set new password |
| `/manager` | Manager dashboard |
| `/manager/quizzes` | Quiz CRUD and readiness |
| `/manager/employees` | Employee CRUD and imports |
| `/manager/leaderboard` | Manager leaderboards and exports |
| `/manager/analytics` | AI analytics and per-quiz shortcuts |
| `/manager/reports` | Reports and exports |
| `/employee` | Employee dashboard |
| `/employee/quizzes` | Assigned quizzes |
| `/employee/leaderboard` | Employee cumulative leaderboard |
| `/employee/badges` | Badges |

## Troubleshooting

### Employees do not see quizzes

Quizzes must be assigned by a manager before employees can view them.

### Leaderboards do not update live

Enable Supabase Realtime for the relevant tables, especially `quiz_attempts` and `user_stats`.

### Manager cannot export or view data

Confirm `SUPABASE_SERVICE_ROLE_KEY` is set and the RLS fix scripts have been run.

### New badges do not appear

Run `scripts/019_more_meaningful_badges.sql` in Supabase.

### Password reset redirects to login

Confirm `NEXT_PUBLIC_APP_URL` points to the same origin used in the reset email.

## License

MIT
