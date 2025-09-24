-- Add archived flag to missions for report archiving
alter table if exists public.missions
  add column if not exists archived boolean not null default false;

-- Optional index to speed up filtering
create index if not exists missions_archived_updated_idx on public.missions(archived, updated_at desc);