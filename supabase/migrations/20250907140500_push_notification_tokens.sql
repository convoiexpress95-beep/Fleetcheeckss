-- Push notification tokens storage
create table if not exists public.push_notification_tokens (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  device_type text not null default 'expo',
  device_info jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token)
);

create index if not exists push_tokens_user_idx on public.push_notification_tokens(user_id);

alter table public.push_notification_tokens enable row level security;

create policy push_tokens_user_all on public.push_notification_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at trigger reuse
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists push_tokens_set_updated_at on public.push_notification_tokens;
create trigger push_tokens_set_updated_at
before update on public.push_notification_tokens
for each row execute procedure public.set_updated_at();
