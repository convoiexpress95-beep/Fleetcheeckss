-- Guarded FKs and indexes (no-op if referenced tables/columns are missing)
do $$ begin
	-- Example pattern (disabled until specific FKs are defined):
	-- if exists (select 1 from information_schema.tables where table_schema='public' and table_name='some_table') then
	--   execute 'create index if not exists some_table_created_at_idx on public.some_table(created_at)';
	-- end if;
	null;
end $$;

