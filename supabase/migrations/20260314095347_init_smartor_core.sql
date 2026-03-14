create extension if not exists pgcrypto;

create type public.app_role as enum (
  'hospital_admin',
  'or_director',
  'scheduler',
  'surgeon',
  'staff'
);

create type public.room_status as enum (
  'Available',
  'Pre-op',
  'In Surgery',
  'Turnover',
  'Delayed'
);

create type public.case_status as enum (
  'Scheduled',
  'Pre-op',
  'Ready',
  'In Surgery',
  'Turnover',
  'Delayed',
  'Waitlist'
);

create type public.urgency_level as enum (
  'Elective',
  'Urgent',
  'Emergent'
);

create type public.insurance_status as enum (
  'Authorized',
  'Pending',
  'Missing'
);

create type public.documentation_status as enum (
  'Complete',
  'In Review',
  'Missing'
);

create type public.equipment_status as enum (
  'Ready',
  'Reserved',
  'In Use',
  'Sterilizing',
  'Maintenance'
);

create type public.notification_level as enum (
  'Info',
  'Watch',
  'Critical'
);

create type public.ehr_status as enum (
  'Connected',
  'Sandbox',
  'Pending'
);

create type public.conflict_severity as enum (
  'Low',
  'Medium',
  'High'
);

create table public.hospitals (
  id text primary key,
  slug text not null unique,
  name text not null,
  city text not null,
  state text not null,
  network_name text not null,
  beds integer not null check (beds > 0),
  or_count integer not null default 0 check (or_count >= 0),
  occupancy_rate numeric(5, 2) not null default 0 check (occupancy_rate >= 0 and occupancy_rate <= 100),
  on_time_starts numeric(5, 2) not null default 0 check (on_time_starts >= 0 and on_time_starts <= 100),
  turnover_minutes integer not null default 0 check (turnover_minutes >= 0),
  alerts_open integer not null default 0 check (alerts_open >= 0),
  ehr_status public.ehr_status not null default 'Pending',
  adoption_score numeric(5, 2) not null default 0 check (adoption_score >= 0 and adoption_score <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text not null default '',
  job_title text,
  default_hospital_id text references public.hospitals (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.hospital_memberships (
  id uuid primary key default gen_random_uuid(),
  hospital_id text not null references public.hospitals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (hospital_id, user_id)
);

create unique index hospital_memberships_one_default_per_user
  on public.hospital_memberships (user_id)
  where is_default;

create table public.operating_rooms (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  name text not null,
  service_line text not null,
  status public.room_status not null default 'Available',
  active_case_id text,
  next_case_id text,
  utilization_rate numeric(5, 2) not null default 0 check (utilization_rate >= 0 and utilization_rate <= 100),
  turnover_minutes integer not null default 0 check (turnover_minutes >= 0),
  staffed_by text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.surgeons (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  name text not null,
  specialty text not null,
  block_preference text not null,
  availability jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (jsonb_typeof(availability) = 'array')
);

create table public.staff_members (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  name text not null,
  role text not null,
  shift text not null,
  assigned_room_id text,
  availability_label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.equipment (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  name text not null,
  type text not null,
  status public.equipment_status not null default 'Ready',
  assigned_case_id text,
  last_sterilized_at text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.surgery_cases (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  patient_name text not null,
  procedure_name text not null,
  surgeon_id text not null references public.surgeons (id) on delete restrict,
  operating_room_id text references public.operating_rooms (id) on delete set null,
  scheduled_start text not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  predicted_minutes integer not null check (predicted_minutes > 0),
  actual_minutes integer check (actual_minutes is null or actual_minutes > 0),
  status public.case_status not null default 'Scheduled',
  urgency public.urgency_level not null default 'Elective',
  insurance_status public.insurance_status not null default 'Pending',
  documentation_status public.documentation_status not null default 'Missing',
  delay_reason text,
  staff_ids text[] not null default '{}'::text[],
  equipment_ids text[] not null default '{}'::text[],
  pre_op_checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (jsonb_typeof(pre_op_checklist) = 'array')
);

create table public.notifications (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  level public.notification_level not null,
  title text not null,
  detail text not null,
  timestamp text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.conflicts (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  severity public.conflict_severity not null,
  title text not null,
  detail text not null,
  recommendation text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.block_time_allocations (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  service_line text not null,
  day text not null,
  owner text not null,
  allocated_hours numeric(6, 2) not null check (allocated_hours > 0),
  used_hours numeric(6, 2) not null default 0 check (used_hours >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.waitlist_entries (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  patient_name text not null,
  procedure_name text not null,
  priority public.urgency_level not null,
  requested_window text not null,
  reason text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.preference_cards (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  surgeon_id text not null references public.surgeons (id) on delete cascade,
  setup_notes text not null,
  preferred_devices text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.document_records (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  case_id text references public.surgery_cases (id) on delete set null,
  title text not null,
  type text not null,
  owner text not null,
  updated_at text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.cost_centers (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  department text not null,
  utilization_rate numeric(5, 2) not null default 0 check (utilization_rate >= 0 and utilization_rate <= 100),
  cost_per_procedure numeric(12, 2) not null check (cost_per_procedure > 0),
  revenue_per_or_day numeric(12, 2) not null check (revenue_per_or_day > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.message_threads (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  topic text not null,
  room_label text not null,
  participants text[] not null default '{}'::text[],
  last_message text not null,
  unread_count integer not null default 0 check (unread_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index operating_rooms_hospital_id_idx on public.operating_rooms (hospital_id);
create index surgeons_hospital_id_idx on public.surgeons (hospital_id);
create index staff_members_hospital_id_idx on public.staff_members (hospital_id);
create index equipment_hospital_id_idx on public.equipment (hospital_id);
create index surgery_cases_hospital_id_idx on public.surgery_cases (hospital_id);
create index surgery_cases_surgeon_id_idx on public.surgery_cases (surgeon_id);
create index surgery_cases_operating_room_id_idx on public.surgery_cases (operating_room_id);
create index notifications_hospital_id_idx on public.notifications (hospital_id);
create index conflicts_hospital_id_idx on public.conflicts (hospital_id);
create index block_time_allocations_hospital_id_idx on public.block_time_allocations (hospital_id);
create index waitlist_entries_hospital_id_idx on public.waitlist_entries (hospital_id);
create index preference_cards_hospital_id_idx on public.preference_cards (hospital_id);
create index document_records_hospital_id_idx on public.document_records (hospital_id);
create index cost_centers_hospital_id_idx on public.cost_centers (hospital_id);
create index message_threads_hospital_id_idx on public.message_threads (hospital_id);
create index hospital_memberships_user_id_idx on public.hospital_memberships (user_id);
create index hospital_memberships_hospital_id_idx on public.hospital_memberships (hospital_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when excluded.full_name = '' then public.profiles.full_name
          else excluded.full_name
        end,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_hospital_member(target_hospital_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hospital_memberships
    where hospital_id = target_hospital_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.can_admin_hospital(target_hospital_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hospital_memberships
    where hospital_id = target_hospital_id
      and user_id = (select auth.uid())
      and role = 'hospital_admin'
  );
$$;

create or replace function public.can_manage_hospital(target_hospital_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hospital_memberships
    where hospital_id = target_hospital_id
      and user_id = (select auth.uid())
      and role in ('hospital_admin', 'or_director', 'scheduler')
  );
$$;

create trigger set_hospitals_updated_at
  before update on public.hospitals
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_hospital_memberships_updated_at
  before update on public.hospital_memberships
  for each row execute function public.set_updated_at();

create trigger set_operating_rooms_updated_at
  before update on public.operating_rooms
  for each row execute function public.set_updated_at();

create trigger set_surgeons_updated_at
  before update on public.surgeons
  for each row execute function public.set_updated_at();

create trigger set_staff_members_updated_at
  before update on public.staff_members
  for each row execute function public.set_updated_at();

create trigger set_equipment_updated_at
  before update on public.equipment
  for each row execute function public.set_updated_at();

create trigger set_surgery_cases_updated_at
  before update on public.surgery_cases
  for each row execute function public.set_updated_at();

create trigger set_notifications_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

create trigger set_conflicts_updated_at
  before update on public.conflicts
  for each row execute function public.set_updated_at();

create trigger set_block_time_allocations_updated_at
  before update on public.block_time_allocations
  for each row execute function public.set_updated_at();

create trigger set_waitlist_entries_updated_at
  before update on public.waitlist_entries
  for each row execute function public.set_updated_at();

create trigger set_preference_cards_updated_at
  before update on public.preference_cards
  for each row execute function public.set_updated_at();

create trigger set_cost_centers_updated_at
  before update on public.cost_centers
  for each row execute function public.set_updated_at();

create trigger set_message_threads_updated_at
  before update on public.message_threads
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.hospital_memberships enable row level security;

create policy "profiles_select_self"
  on public.profiles
  for select
  using (id = (select auth.uid()));

create policy "profiles_update_self"
  on public.profiles
  for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "hospitals_select_member"
  on public.hospitals
  for select
  using (public.is_hospital_member(id));

create policy "hospitals_update_admin"
  on public.hospitals
  for update
  using (public.can_admin_hospital(id))
  with check (public.can_admin_hospital(id));

create policy "memberships_select_self_or_admin"
  on public.hospital_memberships
  for select
  using (
    user_id = (select auth.uid())
    or public.can_admin_hospital(hospital_id)
  );

create policy "memberships_insert_admin"
  on public.hospital_memberships
  for insert
  with check (public.can_admin_hospital(hospital_id));

create policy "memberships_update_admin"
  on public.hospital_memberships
  for update
  using (public.can_admin_hospital(hospital_id))
  with check (public.can_admin_hospital(hospital_id));

create policy "memberships_delete_admin"
  on public.hospital_memberships
  for delete
  using (public.can_admin_hospital(hospital_id));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'operating_rooms',
    'surgeons',
    'staff_members',
    'equipment',
    'surgery_cases',
    'notifications',
    'conflicts',
    'block_time_allocations',
    'waitlist_entries',
    'preference_cards',
    'document_records',
    'cost_centers',
    'message_threads'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy "%I_select_member" on public.%I for select using (public.is_hospital_member(hospital_id))',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_insert_manager" on public.%I for insert with check (public.can_manage_hospital(hospital_id))',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_update_manager" on public.%I for update using (public.can_manage_hospital(hospital_id)) with check (public.can_manage_hospital(hospital_id))',
      table_name,
      table_name
    );
    execute format(
      'create policy "%I_delete_manager" on public.%I for delete using (public.can_manage_hospital(hospital_id))',
      table_name,
      table_name
    );
  end loop;
end
$$;
