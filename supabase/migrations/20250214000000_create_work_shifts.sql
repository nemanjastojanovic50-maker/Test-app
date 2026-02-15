-- WORK_SHIFTS: one row per worksite per work date per user (shift rates)
create table if not exists public.work_shifts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  worksite_id uuid not null references public.worksites(id) on delete cascade,
  work_date date not null,
  required_workers int not null default 0,
  client_rate int not null default 0,
  worker_pay int not null default 0,
  created_at timestamptz default now(),
  unique (owner_id, worksite_id, work_date)
);

create index if not exists work_shifts_owner_worksite_date
  on public.work_shifts (owner_id, worksite_id, work_date);

alter table public.work_shifts enable row level security;

create policy "work_shifts_select" on public.work_shifts
  for select to authenticated using (owner_id = auth.uid());
create policy "work_shifts_insert" on public.work_shifts
  for insert to authenticated with check (owner_id = auth.uid());
create policy "work_shifts_update" on public.work_shifts
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "work_shifts_delete" on public.work_shifts
  for delete to authenticated using (owner_id = auth.uid());
