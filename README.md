# Maverick Execution Platform - Training Management System

> Enterprise training execution, assessment governance, and reporting platform.
> Built for Hexaware Technologies with Next.js 16 and Supabase.

## Overview

Maverick TMS is a full-stack Training Management System for managing the complete training lifecycle: batch creation, candidate onboarding, trainer assignment, attendance discipline, assessment uploads, project evaluation evidence, feedback, toppers, dashboards, and exports.

The platform is designed to replace spreadsheet-driven follow-ups with a governed execution control room. It combines BRD-required TMS workflows with a differentiated Maverick interface and an AI/behavioral analytics layer.

## What Makes It Stand Out

- Maverick command-center interface for operations, reports, and governance.
- Batch Comparison and Batch DNA radar chart for side-by-side execution health.
- Trainer Scorecard metrics across batches, attendance, assessment scores, and feedback.
- Automation Credibility panel showing configured rules, last governance sweep, alert counts, and audit evidence.
- Candidate status management for active, discontinued, not cleared, offered, and onboarded states.
- Schedule timeline combining sessions and assessments.
- Supabase Storage uploads for assessment question files and project evidence.
- AI insights including readiness, cognitive load, knowledge decay, and trainer impact signals.

## Role System

| Role | Responsibility |
|------|----------------|
| Admin | User roles, trainer approvals, governance settings, topper criteria, audit logs |
| Training Coordinator / Manager | Batches, schedules, candidate imports, dashboards, feedback, exports |
| Trainer | Assigned batches, attendance, assessment uploads, project evaluations |
| Employee / Candidate | Assigned assessments, training schedule, attendance view, feedback |

RBAC is enforced through server-side route guards and Supabase RLS policies.

## Core TMS Features

### Batch Lifecycle

- Create, edit, complete, and close training batches.
- Assign lead trainer and trainer panel.
- Upload candidate master data and map candidates into batches.
- Track batch lifecycle and candidate status.

### Attendance

- Manual attendance entry.
- Excel attendance upload.
- Configurable cut-off time, defaulting to 10:00 AM.
- Consecutive absence alerts.
- Attendance version history and upload logs.

### Assessments

- Assessment setup by type: sprint review, API/coding, coding, project, other.
- Scheduled assessment dates and score thresholds.
- Excel-based assessment score import.
- Candidate existence, score range, duplicate, and batch/setup validation.
- Project evaluation scores with evidence upload.

### Automation & Notifications

- Email notification support through Resend.
- Attendance cut-off alerts.
- Absence streak alerts.
- Upcoming assessment reminders.
- Feedback window reminders.
- Notification dispatch logs and automation run history.

### Feedback

- Coordinator-triggered feedback windows.
- Candidate feedback submission.
- Content quality and trainer effectiveness ratings.
- Sentiment analytics and exportable feedback reports.

### Dashboards & Reports

- Operations control room.
- Batch comparison and radar visualization.
- Trainer performance metrics.
- Assessment clearance rates.
- Consolidated batch reports with status filters.
- Attendance, assessment, feedback, topper, and PDF/Excel exports.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Styling | Tailwind CSS |
| UI | shadcn/ui, Radix UI, lucide-react |
| Charts | Recharts |
| Reports | xlsx, jsPDF |
| Email | Resend |
| Validation | Zod |

## Database Migrations

Run the SQL scripts in order from `scripts/001_create_profiles.sql` through:

```text
scripts/024_complete_brd_tms_controls.sql
scripts/025_trainer_approval.sql
```

`025_trainer_approval.sql` enables the trainer approval workflow with approval status tracking.

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=your_app_url
RESEND_API_KEY=your_resend_key
EMAIL_FROM="Maverick TMS <noreply@yourdomain.com>"
GEMINI_API_KEY=optional
GROQ_API_KEY=optional
```

## Getting Started

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Default Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hexaware.com` | `Zxcv,0987` |
| Sample Trainer | `trainer@hexaware.com` | `Asdf,1234` |

## Key Demo Routes

| Screen | Route |
|--------|-------|
| Login | `/auth/login` |
| Admin Governance Console | `/manager/admin` |
| Operations Control Room | `/manager/operations` |
| Evidence Desk / Reports | `/manager/reports` |
| Employee Training Hub | `/employee/training` |

## Project Structure

```text
app/
  api/               API routes for imports, exports, AI, and training actions
  auth/              Login, sign-up, reset password, approval states
  employee/          Candidate portal
  manager/           Admin, coordinator, trainer, reports, operations
components/
  manager/           TMS controls, charts, importers, navigation
  employee/          Candidate experience
  insights/          AI and behavioral analytics components
lib/
  actions/           Server actions
  security/          Validation and environment helpers
  supabase/          Supabase clients
  types/             Shared TypeScript types
scripts/             Supabase migrations and smoke tests
```

## Verification

Current verification commands:

```bash
npm run build
npm run lint
```

Both should complete without errors. The current lint baseline has one unrelated warning in the sign-up page.

## License

Internal use - Hexaware Technologies Capstone Project.
