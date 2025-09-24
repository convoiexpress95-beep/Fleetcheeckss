-- Safeguarded performance indexes: only create if target tables exist

do $$
begin
  -- messages: index on (conversation_id, created_at desc)
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'messages'
  ) then
    execute 'create index if not exists idx_messages_conv_created on public.messages(conversation_id, created_at desc)';
  end if;

  -- Add more guarded indexes here if needed, following the same pattern.
end $$;
