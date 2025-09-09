-- Activer les répliques complètes et ajouter les tables aux publications realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace_missions REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;