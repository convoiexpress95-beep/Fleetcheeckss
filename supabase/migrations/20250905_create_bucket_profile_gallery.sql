-- Create storage bucket profile-gallery if it doesn't exist
insert into storage.buckets (id, name, public)
select 'profile-gallery', 'profile-gallery', true
where not exists (select 1 from storage.buckets where id = 'profile-gallery');
