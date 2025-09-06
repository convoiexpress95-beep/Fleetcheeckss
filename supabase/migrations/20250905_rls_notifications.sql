-- RLS pour notifications: lecture/màj par l'utilisateur, insert pour triggers
alter table if exists public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;
drop policy if exists "System can create notifications" on public.notifications;

create policy "Users can view their own notifications"
  on public.notifications
  for select
  to authenticated
  using ( user_id = auth.uid() );

create policy "Users can update their own notifications"
  on public.notifications
  for update
  to authenticated
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

-- Autoriser l'insertion pour les événements système (triggers). Cette policy autorise les utilisateurs authentifiés
-- à créer des notifications. Pour un durcissement ultérieur, déporter les insertions côté Edge Function avec service_role.
create policy "Allow insert notifications"
  on public.notifications
  for insert
  to authenticated
  with check (
    user_id is not null
    and coalesce(type,'') <> ''
  );
