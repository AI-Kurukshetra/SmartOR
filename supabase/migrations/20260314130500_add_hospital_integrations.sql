create table public.hospital_integrations (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  integration_key text not null,
  integration_label text not null,
  vendor_name text not null,
  status text not null default 'Pending' check (status in ('Connected', 'Sandbox', 'Pending', 'Disconnected')),
  base_url text,
  last_sync_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (hospital_id, integration_key)
);

create index hospital_integrations_hospital_id_idx on public.hospital_integrations (hospital_id);
create index hospital_integrations_status_idx on public.hospital_integrations (status);

create trigger set_hospital_integrations_updated_at
  before update on public.hospital_integrations
  for each row execute function public.set_updated_at();

alter table public.hospital_integrations enable row level security;

create policy "hospital_integrations_select_member"
  on public.hospital_integrations
  for select
  using (public.is_hospital_member(hospital_id));

create policy "hospital_integrations_insert_manager"
  on public.hospital_integrations
  for insert
  with check (public.can_manage_hospital(hospital_id));

create policy "hospital_integrations_update_manager"
  on public.hospital_integrations
  for update
  using (public.can_manage_hospital(hospital_id))
  with check (public.can_manage_hospital(hospital_id));

create policy "hospital_integrations_delete_manager"
  on public.hospital_integrations
  for delete
  using (public.can_manage_hospital(hospital_id));

insert into public.hospital_integrations (
  id,
  hospital_id,
  integration_key,
  integration_label,
  vendor_name,
  status,
  base_url,
  last_sync_at,
  notes
)
select
  concat('integration-', h.slug, '-ehr'),
  h.id,
  'ehr',
  'EHR Core',
  case
    when h.slug = 'north-harbor' then 'Epic'
    when h.slug = 'st-catherine-west' then 'Cerner'
    else 'EHR Vendor'
  end,
  h.ehr_status::text,
  concat('https://', h.slug, '.ehr.smartor.demo/fhir'),
  null,
  'Primary EHR boundary for surgical scheduling and patient context.'
from public.hospitals h
on conflict (hospital_id, integration_key) do nothing;

insert into public.hospital_integrations (
  id,
  hospital_id,
  integration_key,
  integration_label,
  vendor_name,
  status,
  base_url,
  last_sync_at,
  notes
)
select
  concat('integration-', h.slug, '-patient-messaging'),
  h.id,
  'patient_messaging',
  'Patient Messaging',
  'Twilio Health',
  'Sandbox',
  concat('https://', h.slug, '.notify.smartor.demo'),
  null,
  'Outbound case updates and patient-family communication rails.'
from public.hospitals h
on conflict (hospital_id, integration_key) do nothing;

insert into public.hospital_integrations (
  id,
  hospital_id,
  integration_key,
  integration_label,
  vendor_name,
  status,
  base_url,
  last_sync_at,
  notes
)
select
  concat('integration-', h.slug, '-billing'),
  h.id,
  'billing',
  'Billing Pipeline',
  'RevCycle Hub',
  'Pending',
  null,
  null,
  'Charges and authorization data exchange boundary.'
from public.hospitals h
on conflict (hospital_id, integration_key) do nothing;

insert into public.hospital_integrations (
  id,
  hospital_id,
  integration_key,
  integration_label,
  vendor_name,
  status,
  base_url,
  last_sync_at,
  notes
)
select
  concat('integration-', h.slug, '-analytics'),
  h.id,
  'analytics',
  'Analytics Warehouse',
  'Snowflake',
  'Connected',
  concat('https://', h.slug, '.analytics.smartor.demo'),
  timezone('utc', now()) - interval '2 hours',
  'Near-real-time feed for OR utilization and financial reporting.'
from public.hospitals h
on conflict (hospital_id, integration_key) do nothing;
