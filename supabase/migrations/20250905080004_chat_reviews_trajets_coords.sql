-- Guarded updates for chat/reviews/trajets coords if tables exist
do $$
begin
	-- Example: add generated column or index only when table exists
	if exists (select 1 from information_schema.columns where table_schema='public' and table_name='trajets' and column_name='coords') then
		-- placeholder for potential index on coords
		null;
	end if;
end $$;
