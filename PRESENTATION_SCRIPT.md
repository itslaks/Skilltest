# Maverick TMS Presentation Script

Hexaware Technologies | Capstone Project

## Opening

"Good morning/afternoon everyone.

Today we are presenting the Maverick Execution Platform - Training Management System.

This is not just a quiz application. It is an execution and governance platform for the complete training lifecycle: batch creation, candidate onboarding, trainer coordination, attendance discipline, assessment score uploads, project evaluations, feedback, dashboards, automation, toppers, and reports."

## Positioning

"The BRD asks for centralized training execution. Our platform goes beyond that by giving coordinators a command-center view of what is happening right now, what is at risk, and what evidence exists for every action."

Key message:

- Centralized batch, candidate, trainer, attendance, assessment, feedback, and reporting workflows.
- Automated governance alerts with visible audit evidence.
- Differentiated Maverick interface, not a generic admin template.
- AI and behavioral analytics for a contest-winning layer beyond the BRD.

## Demo Flow

### 1. Login and Roles

Show `/auth/login`.

"The platform has separate experiences for Admin, Trainer, Training Coordinator, and Employee. Access is controlled through server-side RBAC and Supabase RLS."

Explain:

- Admin lands in governance.
- Trainer gets scoped access to assigned batches.
- Employee sees personal training, assessments, attendance, and feedback.

### 2. Admin Governance Console

Navigate to `/manager/admin`.

"The Admin Governance Console controls trainer approvals, user roles, attendance cut-off rules, feedback windows, and topper criteria."

Show:

- Pending trainer approvals.
- Role management.
- TMS controls.
- Admin audit log.

Talk track:

"This is important because the BRD requires operational governance, not just data entry. Admin decisions and sensitive changes are visible and auditable."

### 3. Operations Control Room

Navigate to `/manager/operations`.

"This is the core Maverick control room. It is designed to look different from a standard card dashboard while still staying professional and operational."

Show:

- Active batches.
- Upcoming sessions.
- Attendance health.
- Action alerts.
- Assessment clearance.
- Batch export.

Then focus on the Automation Credibility section:

"For judges, automation needs to be visible. Here we show configured cut-off time, absence rule, feedback window, last governance sweep, total alerts created, and how this can be connected to a production scheduler such as Vercel Cron or Supabase Edge Scheduler."

Show Automation Runbook:

- Attendance cut-off.
- Absence streak.
- Assessment reminder.
- Feedback reminder.
- Last run status per check.
- Optional batch override.

Key line:

"The platform does not just send reminders. It logs every governance run, stores notification records, and includes the evidence in reports."

### 4. Batch Lifecycle

Still on `/manager/operations`.

Show:

- Batch creation.
- Trainer panel assignment.
- Candidate assignment.
- Assessment linking.
- Batch status updates.
- Candidate status dropdowns.

Talk track:

"Coordinators can manage the full batch lifecycle from one operating view. Candidate statuses such as discontinued, not cleared, offered, and onboarded are first-class data, not spreadsheet notes."

### 5. Attendance and Assessment Uploads

Show:

- Manual attendance marking.
- Excel attendance upload.
- Assessment score upload.
- Upload validation results.
- Attendance version history.
- Assessment upload error panel.

Talk track:

"This replaces manual spreadsheets with controlled uploads, validations, audit history, and error reporting."

### 6. Schedule and Feedback

Show:

- Batch Schedule Timeline.
- Feedback and Reminder Pulse.
- Feedback analytics.
- Feedback window trigger.

Talk track:

"The schedule timeline unifies sessions and assessments. Feedback is not isolated; it feeds directly into trainer effectiveness, content quality, sentiment, and reports."

### 7. Batch Comparison and Trainer Performance

Show:

- Batch Comparison and DNA radar.
- Reports page `/manager/reports`.
- Trainer Performance Metrics.

Talk track:

"The BRD explicitly calls for batch-wise comparison and trainer-wise metrics. We made both visual and presentation-ready. This lets leadership compare training programs, attendance, clearance, and trainer impact side by side."

### 8. Evidence Desk and Reports

Navigate to `/manager/reports`.

"The reports page is now positioned as an Evidence Desk. Every export is tied to execution proof: attendance, assessments, feedback, toppers, automation, and consolidated batch filters."

Show:

- Consolidated report filters.
- Toppers.
- PDF and Excel downloads.
- Topper criteria transparency.

Key line:

"The topper logic is configurable and transparent, so rankings are reproducible instead of subjective."

### 9. Employee Training Hub

Navigate to `/employee/training`.

Show:

- Current batch.
- Attendance history.
- Latest reminders.
- Feedback submission.
- Linked assessments.

Talk track:

"Employees also see the operational layer. They are not just taking quizzes; they can see training schedule, reminders, attendance status, and submit structured feedback."

## BRD Coverage Summary

Use this if judges ask about requirements:

- Batch lifecycle: covered.
- Candidate onboarding and batch assignment: covered.
- Attendance manual and Excel upload: covered.
- Attendance cut-off and absence alerts: covered.
- Assessment setup and Excel score uploads: covered.
- Trainer and coordinator role management: covered.
- Email notifications and dispatch logs: covered.
- Feedback initiation, collection, analytics, and export: covered.
- Dashboards and metrics: covered.
- Batch comparison: covered.
- Trainer-wise performance: covered.
- Topper identification: covered.
- Excel and PDF exports: covered.
- RBAC and trainer-scoped access: covered.
- Audit and logging: covered.

## Closing

"Maverick TMS gives Hexaware a disciplined training execution platform. It reduces spreadsheet dependency, improves visibility, automates follow-ups, and gives leadership the evidence needed to make decisions.

What makes it contest-ready is not only BRD coverage. It is the Maverick command-center experience, automation credibility, trainer impact analytics, Batch DNA, and audit-ready reporting."

## Quick Reference

| Action | URL | Credentials |
|--------|-----|-------------|
| Admin login | `/auth/login` | `admin@hexaware.com` / `Zxcv,0987` |
| Trainer login | `/auth/login` | `trainer@hexaware.com` / `Asdf,1234` |
| Admin console | `/manager/admin` | Admin only |
| Operations control room | `/manager/operations` | Trainer/Coordinator/Admin |
| Evidence Desk | `/manager/reports` | Coordinator/Admin |
| Employee training hub | `/employee/training` | Employee |

## Pre-Demo Checklist

- Run all Supabase migrations through `025_trainer_approval.sql`.
- Confirm `admin@hexaware.com` has role `admin` and approved status.
- Confirm `trainer@hexaware.com` has role `trainer` and approved status.
- Seed at least two batches with sessions, attendance, assessment scores, and feedback.
- Run one automation check before demo so the Automation Credibility panel shows evidence.
- Open `/manager/operations`, `/manager/reports`, and `/manager/admin` in separate tabs.
- Run `npm run build` before final deployment.

## One-Minute Backup Pitch

"Maverick TMS is a complete training execution platform. It manages batches, trainers, candidates, attendance, assessments, feedback, toppers, dashboards, alerts, and reports. The standout layer is the Maverick operations control room: batch DNA comparison, trainer scorecards, automation evidence, and audit-ready reporting. It satisfies the BRD and gives judges something visually and operationally different from a standard dashboard."
