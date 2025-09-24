-- Create storage bucket mission-photos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('mission-photos', 'mission-photos', false)
on conflict (id) do nothing;
