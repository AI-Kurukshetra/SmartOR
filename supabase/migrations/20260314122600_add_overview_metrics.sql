create table public.overview_metrics (
  id text primary key,
  hospital_id text not null references public.hospitals (id) on delete cascade,
  metric_key text not null,
  metric_label text not null,
  metric_value numeric(12, 2) not null default 0,
  unit text not null default 'count' check (unit in ('count', 'percent', 'currency', 'minutes')),
  target_value numeric(12, 2),
  trend text not null default 'stable' check (trend in ('up', 'down', 'stable')),
  owner text not null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (hospital_id, metric_key)
);

create index overview_metrics_hospital_id_idx on public.overview_metrics (hospital_id);
create index overview_metrics_metric_key_idx on public.overview_metrics (metric_key);

create trigger set_overview_metrics_updated_at
  before update on public.overview_metrics
  for each row execute function public.set_updated_at();

alter table public.overview_metrics enable row level security;

create policy "overview_metrics_select_member"
  on public.overview_metrics
  for select
  using (public.is_hospital_member(hospital_id));

create policy "overview_metrics_insert_manager"
  on public.overview_metrics
  for insert
  with check (public.can_manage_hospital(hospital_id));

create policy "overview_metrics_update_manager"
  on public.overview_metrics
  for update
  using (public.can_manage_hospital(hospital_id))
  with check (public.can_manage_hospital(hospital_id));

create policy "overview_metrics_delete_manager"
  on public.overview_metrics
  for delete
  using (public.can_manage_hospital(hospital_id));

insert into public.overview_metrics (
  id,
  hospital_id,
  metric_key,
  metric_label,
  metric_value,
  unit,
  target_value,
  trend,
  owner,
  note
)
select
  concat('metric-', h.slug, '-hospital-utilization'),
  h.id,
  'hospital_utilization',
  'Hospital utilization',
  h.occupancy_rate,
  'percent',
  85,
  'stable',
  'OR Command',
  'Baseline utilization metric seeded from hospital profile'
from public.hospitals h
on conflict (hospital_id, metric_key) do nothing;

insert into public.overview_metrics (
  id,
  hospital_id,
  metric_key,
  metric_label,
  metric_value,
  unit,
  target_value,
  trend,
  owner,
  note
)
select
  concat('metric-', h.slug, '-on-time-starts'),
  h.id,
  'on_time_starts',
  'On-time starts',
  h.on_time_starts,
  'percent',
  90,
  'stable',
  'Scheduling',
  'Baseline on-time start metric seeded from hospital profile'
from public.hospitals h
on conflict (hospital_id, metric_key) do nothing;

insert into public.overview_metrics (
  id,
  hospital_id,
  metric_key,
  metric_label,
  metric_value,
  unit,
  target_value,
  trend,
  owner,
  note
)
select
  concat('metric-', h.slug, '-open-alerts'),
  h.id,
  'open_alerts',
  'Open alerts',
  h.alerts_open,
  'count',
  2,
  'stable',
  'Coordination Desk',
  'Baseline alert load metric seeded from hospital profile'
from public.hospitals h
on conflict (hospital_id, metric_key) do nothing;
