-- Store chosen vehicle image path for missions (points to 'vehicle-assets' bucket)
alter table public.missions
  add column if not exists vehicle_image_path text null;
