-- Add vehicle model relation to missions with fallback body_type
alter table public.missions
  add column if not exists vehicle_model_id uuid null,
  add column if not exists vehicle_body_type text null;

-- Foreign key to vehicle_models (guarded without IF NOT EXISTS)
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'missions_vehicle_model_id_fkey'
  ) then
    alter table public.missions
      add constraint missions_vehicle_model_id_fkey
      foreign key (vehicle_model_id)
      references public.vehicle_models(id)
      on update cascade on delete set null;
  end if;
exception when others then
  -- if vehicle_models table not present yet, ignore; a later migration can add FK
  null;
end $$;

create index if not exists missions_vehicle_model_id_idx on public.missions(vehicle_model_id);
