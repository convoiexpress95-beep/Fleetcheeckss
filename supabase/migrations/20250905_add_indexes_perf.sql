-- Performance indexes for frequent queries
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_messages_conv_created on public.messages(conversation_id, created_at desc);
create index if not exists idx_marketplace_devis_mission_status on public.marketplace_devis(mission_id, status);
create index if not exists idx_marketplace_missions_creator_status on public.marketplace_missions(created_by, status);
-- Shared trips proximity lookups (if used)
create index if not exists idx_trajets_partages_start on public.trajets_partages(start_lat, start_lng);
create index if not exists idx_trajets_partages_end on public.trajets_partages(end_lat, end_lng);
