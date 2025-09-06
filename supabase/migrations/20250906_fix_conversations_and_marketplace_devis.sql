-- Conversations: add mission_id to support UI filters
alter table if exists public.conversations
  add column if not exists mission_id uuid;

-- FK to missions if not already present
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'conversations_mission_id_fkey'
      and table_schema = 'public' and table_name = 'conversations'
  ) then
    alter table public.conversations
      add constraint conversations_mission_id_fkey
      foreign key (mission_id) references public.missions(id) on delete set null;
  end if;
end $$;

create index if not exists idx_conversations_mission on public.conversations (mission_id);

-- Marketplace devis: enable RLS and policies for current user/admin
alter table if exists public.marketplace_devis enable row level security;

drop policy if exists marketplace_devis_select on public.marketplace_devis;
drop policy if exists marketplace_devis_insert on public.marketplace_devis;
drop policy if exists marketplace_devis_update on public.marketplace_devis;

create policy marketplace_devis_select
  on public.marketplace_devis for select
  using (
    -- Le convoyeur peut voir ses devis
    convoyeur_id = auth.uid()
    or
    -- Le créateur de la mission peut voir les devis associés
    exists (
      select 1 from public.marketplace_missions mm
      where mm.id = marketplace_devis.mission_id and mm.created_by = auth.uid()
    )
    or public.is_admin()
  );

create policy marketplace_devis_insert
  on public.marketplace_devis for insert
  with check (
    convoyeur_id = auth.uid() or public.is_admin()
  );

create policy marketplace_devis_update
  on public.marketplace_devis for update
  using (
    convoyeur_id = auth.uid() or public.is_admin()
  )
  with check (
    convoyeur_id = auth.uid() or public.is_admin()
  );

-- Helpful indexes
create index if not exists idx_marketplace_devis_mission on public.marketplace_devis (mission_id);
create index if not exists idx_marketplace_devis_convoyeur on public.marketplace_devis (convoyeur_id);