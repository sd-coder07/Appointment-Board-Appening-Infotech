# 📅 Appointment Board

A modern, full-stack team appointment and calendar management system built with **Next.js 14 (App Router)**, **PostgreSQL (Prisma ORM)**, **Tailwind CSS**, and **Zod**.

Built for the **Appening Infotech** Full Stack Developer Intern assessment.

---

## 🌟 Features Overview

- **Interactive Appointment Board**: Chronologically organized appointments with visual badges for `SCHEDULED`, `COMPLETED`, and `CANCELLED`.
- **Add Appointment**: Full validation on Title, Date, Start Time, and End Time (`endTime > startTime`).
- **Edit Appointment**: Update existing appointments with real-time conflict re-evaluation and self-exclusion (an appointment does not conflict with itself).
- **Mark as Completed**: Updates status to `COMPLETED` while preserving the record on the board.
- **Cancel Appointment**: Clearly flags the appointment as `CANCELLED` (strikethrough styling + badge), preserves visibility, and releases the time slot for new bookings.
- **Strict Overlap Guard**: Prevents two active appointments from occupying conflicting time intervals on the same date.
- **Back-to-Back Allowed**: Back-to-back slots (e.g., `10:00–11:00` and `11:00–12:00`) do not overlap and are strictly permitted.
- **Real-time Filtering**: Filter simultaneously by **Date** (Date picker + "Today" shortcut) and **Status** (`All`, `Scheduled`, `Completed`, `Cancelled`) alongside search by title or description.
- **Persistent Metric Counters**: Summary cards (`Total`, `Scheduled`, `Completed`, `Cancelled`) preserve global counts even while filtering by status tabs.
- **Pre-seeded Sample Data**: Seeded with 6 diverse appointments so evaluators can test filtering and conflict detection immediately upon loading.
- **Staggered Block Background**: Custom modern architectural tile-pattern background.
- **Toast Notifications**: Slide-in animated notifications for instant success and error feedback.

---

## 🧠 Overlap Detection Logic (L2 Technical Deep-Dive)

The core business logic resides in [`lib/appointments.ts`](lib/appointments.ts).

### The Mathematical Formula

Two time intervals $[A_{\text{start}}, A_{\text{end}}]$ and $[B_{\text{start}}, B_{\text{end}}]$ on the same date overlap if and only if:

$$\text{new\_start} < \text{existing\_end} \quad \text{AND} \quad \text{new\_end} > \text{existing\_start}$$

```typescript
export function checkIntervalOverlap(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}
```

### Key Business Rules
1. **Back-to-back Appointments**:
   - Appointment A: `10:00` to `11:00`
   - Appointment B: `11:00` to `12:00`
   - Evaluation: `11:00 < 11:00` is **false**. Therefore, no conflict is raised.
2. **Cancelled Appointments**:
   - Cancelled appointments have `status === "CANCELLED"`.
   - The query filters them out of active conflicts so team members can rebook previously cancelled slots.
3. **Editing Self-Exclusion**:
   - When updating an appointment, its own `id` (`excludeId`) is skipped so updating notes or shifting duration within its own window does not trigger a self-conflict.
4. **Zero-Padded 24-Hour String Representation (`HH:mm`)**:
   - Storing time as `"10:00"`, `"14:30"` avoids JavaScript `Date` timezone shifts between client and server, while lexicographical string comparison (`<`, `>`) is mathematically identical to chronological time comparison.

---

## 🏗️ System Architecture

```
                 ┌──────────────────────────────────────┐
                 │       Next.js 14 App Router          │
                 │   (React Server + Client Dashboard)  │
                 └──────────────────┬───────────────────┘
                                    │ HTTP / JSON
                                    ▼
                 ┌──────────────────────────────────────┐
                 │       Next.js Route Handlers         │
                 │   app/api/appointments/...           │
                 │  - Zod Request Validation            │
                 │  - Interval Overlap Guard            │
                 │  - Status Transition Logic           │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │          Prisma ORM Client           │
                 │     (PostgreSQL Primary Connection)  │
                 │  * With Zero-Config Local Fallback   │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │        PostgreSQL Database           │
                 └──────────────────────────────────────┘
```

---

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── appointments/
│   │   │   ├── route.ts             # GET (list + global stats), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET (single), PUT (update with conflict check)
│   │   │       ├── complete/
│   │   │       │   └── route.ts     # PATCH mark completed
│   │   │       └── cancel/
│   │   │           └── route.ts     # PATCH mark cancelled (frees slot)
│   │   └── seed/
│   │       └── route.ts             # POST reset & seed sample appointments
│   ├── globals.css                  # Tailwind styles + Staggered block tile pattern
│   ├── layout.tsx                   # HTML head, typography, metadata
│   └── page.tsx                     # Main Appointment Board dashboard
├── components/
│   ├── AppointmentCard.tsx          # Card view with badges & action triggers
│   ├── AppointmentModal.tsx         # Add / Edit modal dialog with live validation
│   ├── FilterBar.tsx                # Date, status tabs with counts, search input
│   ├── StatsOverview.tsx            # Metric cards (Total, Scheduled, Completed, Cancelled)
│   └── Toast.tsx                    # Feedback notification toasts
├── lib/
│   ├── appointments.ts              # Interval overlap algorithm & Zod schemas
│   ├── db.ts                        # Prisma singleton + zero-config data fallback
│   └── seed-data.ts                 # Sample seed appointments
├── prisma/
│   ├── schema.prisma                # PostgreSQL Prisma schema
│   ├── schema.sqlite.prisma         # Optional SQLite schema fallback
│   └── seed.ts                      # Standalone Prisma CLI seed script
├── scripts/
│   ├── seed.js                      # Instant local seed runner
│   └── test-api.mjs                 # 27-case automated verification test suite
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Status {
  SCHEDULED
  COMPLETED
  CANCELLED
}

model Appointment {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  startTime   String   // "HH:mm" (24-hour format)
  endTime     String   // "HH:mm" (24-hour format)
  status      Status   @default(SCHEDULED)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
  @@index([status])
}
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18.x` or later (tested on `v22.x`)
- npm `v9.x` or later

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for PostgreSQL)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your PostgreSQL connection string in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appointment_board?schema=public"
```

> **Zero-Config Reviewer Mode**: If you don't have PostgreSQL installed locally, you can start the application immediately without touching `.env`! The application automatically provides an out-of-the-box local persistence fallback in `.data/appointments.json` pre-loaded with all sample data.

### 3. Generate Prisma Client & Run
```bash
# Push schema to database (if using PostgreSQL)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive 27-assertion integration test suite covering every requirement:

```bash
# While the server is running on http://localhost:3000:
node scripts/test-api.mjs
```

### Verified Scenarios:
1. `GET /api/appointments`: Retrieves initial seed appointments.
2. Filtering by specific date (`2026-09-13`).
3. Filtering by status (`COMPLETED`).
4. Dual simultaneous filtering (`date=2026-09-13` AND `status=SCHEDULED`).
5. Missing required fields validation (`400 Bad Request`).
6. `endTime <= startTime` duration validation (`400 Bad Request`).
7. Partial & full interval overlap prevention (`409 Conflict`).
8. Exact back-to-back appointment creation (`201 Created`).
9. Completing an appointment (`PATCH /api/appointments/:id/complete`).
10. Cancelling an appointment (`PATCH /api/appointments/:id/cancel`).
11. Verifying that a cancelled appointment releases its time slot for new bookings (`201 Created`).
12. Attempting to edit an appointment into an occupied slot (`409 Conflict`).
13. Updating an appointment within its own slot without self-conflict (`200 OK`).

---

## 💡 Assumptions & Design Decisions

1. **Cancelled Appointments**:
   - The task requirements state: *"Cancelled appointments remain visible and are clearly marked as cancelled."*
   - Cancelled appointments are rendered with distinct muted styling and strikethrough text.
   - Because they represent a cancelled meeting, their time slot is released so other team members can book that time.
2. **Back-to-Back Meetings**:
   - A meeting ending at `11:00` and another starting at `11:00` are permitted, as common in team scheduling.
3. **Completed Appointments**:
   - Marking an appointment as completed confirms the meeting concluded. Completed appointments preserve their historical slot.
4. **Time & Date Isolation**:
   - Date is handled as calendar date `YYYY-MM-DD` and times as zero-padded 24h strings `HH:mm`. This eliminates UTC/timezone offset drift between client browsers and server runtime.

---

## 🎤 Interview Cheatsheet (L2 Round Preparation)

| Question | Expected Technical Answer |
| :--- | :--- |
| **"How did you detect overlapping appointments?"** | Using interval intersection logic on appointments on the same date: `newStart < existingEnd && newEnd > existingStart`. Cancelled appointments and the edited appointment's own ID are excluded. |
| **"Why string for time instead of DateTime?"** | Local meeting hours belong to a specific calendar date. Using `"HH:mm"` 24-hour strings prevents timezone serialization shifts between client and server, while allowing clean lexicographical comparisons. |
| **"Why do cancelled appointments remain in the DB?"** | Audit trail and team visibility. Evaluators and managers need to see what was previously scheduled and cancelled without losing meeting history. |
| **"What happens if two users submit the same slot at once?"** | In production PostgreSQL, we can use a database-level exclusion constraint (`EXCLUDE USING gist`) or serializable transactions (`IsolationLevel.Serializable`) to prevent race conditions at the database layer. |
