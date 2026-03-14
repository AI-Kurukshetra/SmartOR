# SmartOR

An intelligent surgical operations management platform for hospitals — a real-time command center for OR scheduling, staff coordination, and resource utilization.

## Overview

SmartOR gives surgical operations teams full visibility into operating room status, case lifecycle, staffing, and equipment — all in one place. It supports multiple hospitals and enforces role-based access so each user sees exactly what they need.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Styling | TailwindCSS 3.4 with custom design tokens |
| Icons | Lucide React |
| Validation | Zod |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Auth SSR | @supabase/ssr |
| Package Manager | pnpm |
| Deployment | Vercel |

## Features

- **Real-time OR Dashboard** — Live room status (Available, Pre-op, In Surgery, Turnover, Delayed) with conflict detection
- **Drag-and-Drop Scheduling** — Case sequencing with block time management and waitlist support
- **Case Lifecycle Tracking** — Full status flow from Scheduled through In Surgery to completion
- **Case Readiness** — Insurance authorization, documentation status, and pre-op checklists
- **Resource Management** — Equipment inventory, surgeon availability, and staff scheduling
- **Conflict Detection** — Auto-detected scheduling and resource conflicts with resolution recommendations
- **Role-Based Access** — Five distinct roles with fine-grained permission controls
- **Multi-Hospital Support** — Organization-level overview across multiple hospital sites
- **Integration Settings** — EHR, billing, messaging, and analytics API configuration
- **Financial Reporting** — Cost center tracking per hospital
- **Mobile Responsive** — PWA-ready with manifest support

## User Roles

| Role | Access |
|---|---|
| Hospital Admin | All modules including Admin Controls and Financial Reporting |
| OR Director | Operations, Scheduling, Coordination, Financial Reporting |
| Scheduler | Operations, Scheduling, Coordination, Financial Reporting |
| Surgeon | Operations, Scheduling, Coordination (read-focused) |
| Clinical Staff | Operations and Coordination |

## Project Structure

```
├── app/
│   ├── (auth)/                        # Login and registration routes
│   ├── hospitals/[hospitalSlug]/      # Per-hospital dashboard and modules
│   │   ├── operations/                # Live OR command board
│   │   ├── scheduling/                # Case scheduling workspace
│   │   ├── coordination/              # Team readiness and case status
│   │   ├── operations-resources/      # Staffing, surgeons, equipment
│   │   ├── admin-controls/            # Integrations and API settings
│   │   └── financial-reporting/       # Cost tracking
│   └── actions/                       # Server Actions for all mutations
├── components/smartor/                # Domain-specific UI components
├── lib/
│   ├── supabase/                      # Supabase client helpers
│   ├── smartor/                       # Data fetching, permissions, mock data
│   └── validations/                   # Zod schemas
├── supabase/
│   └── migrations/                    # SQL migration files
├── scripts/
│   └── seed-smartor-demo.mjs          # Demo data seeding script
├── doc/                               # Living project documentation
└── types/                             # Global TypeScript declarations
```

## Database Schema

18 tables covering the full domain:

- `hospitals`, `profiles`, `hospital_memberships`
- `operating_rooms`, `surgeons`, `staff_members`, `equipment`
- `surgery_cases`, `conflicts`, `notifications`, `waitlist_entries`
- `block_time_allocations`, `preference_cards`, `document_records`
- `cost_centers`, `message_threads`, `overview_metrics`, `hospital_integrations`

Row-level security enforces a member-read / manager-write pattern per hospital.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A Supabase project

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd smartor

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

Apply migrations to your Supabase project:

```bash
npx supabase db push
```

### Seed Demo Data

Populate the database with realistic demo users and hospital data:

```bash
pnpm seed:demo
```

This creates demo accounts for each role (admin, director, scheduler, surgeon, staff), sets up sample hospitals, and inserts OR rooms, cases, conflicts, equipment, and notifications. The script is idempotent — safe to run multiple times.

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm seed:demo` | Seed demo data into Supabase |

## Architecture

- **Server Components** fetch data from Supabase via `lib/smartor/data.ts`
- **Server Actions** handle all mutations with RLS enforcement
- **Middleware** refreshes Supabase sessions on every request
- **Permissions** are enforced in both UI (`lib/smartor/permissions.ts`) and Server Actions
- **Mock data fallback** (`lib/smartor/mock-data.ts`) supports demo mode without Supabase
