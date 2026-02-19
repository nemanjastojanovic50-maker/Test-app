-- Optional email for workers (e.g. for mailto shift details)
alter table public.workers add column if not exists email text;
