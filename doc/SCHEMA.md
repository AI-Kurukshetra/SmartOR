# SCHEMA

## Migration History

- `supabase/migrations/20260314095347_init_smartor_core.sql`
- `supabase/migrations/20260314122600_add_overview_metrics.sql`
- `supabase/migrations/20260314130500_add_hospital_integrations.sql`

## Current Tables

- hospitals
- profiles
- hospital_memberships
- operating_rooms
- surgeons
- staff_members
- equipment
- surgery_cases
- notifications
- conflicts
- block_time_allocations
- waitlist_entries
- preference_cards
- document_records
- cost_centers
- message_threads
- overview_metrics
- hospital_integrations

## Enums

- `app_role`
- `room_status`
- `case_status`
- `urgency_level`
- `insurance_status`
- `documentation_status`
- `equipment_status`
- `notification_level`
- `ehr_status`
- `conflict_severity`

## Auth / Profile Integration

- `profiles.id` references `auth.users.id`
- `handle_new_user()` trigger inserts or updates `profiles` on auth signup
- `profiles.default_hospital_id` points at the user’s default hospital workspace

## RLS Direction Implemented

- `is_hospital_member(hospital_id)` gates read access for hospital-scoped records
- `can_manage_hospital(hospital_id)` allows writes for `hospital_admin`, `or_director`, and `scheduler`
- `can_admin_hospital(hospital_id)` allows membership and hospital admin management
- `profiles` can only be read or updated by the owning authenticated user
- `overview_metrics` follows member-read + manager-write policies aligned with other hospital-scoped operational tables
- `hospital_integrations` follows member-read + manager-write policies (`can_manage_hospital`) for hospital-level integration boundary management

## UI Domain Model Implemented In Mock Data

- `hospitals`
- `operating_rooms`
- `surgeons`
- `staff_members`
- `equipment`
- `surgery_cases`
- `notifications`
- `conflicts`
- `block_times`
- `waitlist_entries`
- `preference_cards`
- `document_records`
- `cost_centers`
- `message_threads`

## Seed Workflow

- `pnpm seed:demo` runs `scripts/seed-smartor-demo.mjs`
- The seed script creates demo auth users, profiles, hospital memberships, and realistic SmartOR operational rows across the existing public tables
- The seed script requires the initial schema migration `supabase/migrations/20260314095347_init_smartor_core.sql` to already be applied in the target Supabase project
- The initial migration and demo seed were applied to Supabase project `agnjgojoozdyepakkkhy` on `2026-03-14 10:31`, and the seeded row counts were verified remotely
- `npx -y supabase db push` was run on `2026-03-14 13:25`, applying `20260314122600_add_overview_metrics.sql` and `20260314130500_add_hospital_integrations.sql` to the linked remote project
