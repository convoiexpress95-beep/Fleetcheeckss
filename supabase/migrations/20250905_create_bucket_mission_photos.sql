-- Crée le bucket mission-photos s'il n'existe pas
do $$
begin
	if not exists (
		select 1 from storage.buckets where id = 'mission-photos'
	) then
		insert into storage.buckets (id, name, public)
		values ('mission-photos', 'mission-photos', true);
	end if;
end $$;

